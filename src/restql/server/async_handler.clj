(ns restql.server.async-handler
  (:require [compojure.core :as c]
            [compojure.route :as route]
            [clojure.walk :refer [keywordize-keys stringify-keys]]
            [restql.core.api.restql :as restql]
            [restql.core.encoders.core :refer [base-encoders]]
            [restql.server.logger :refer [debug warn error generate-uuid!]]
            [restql.server.request-util :as util]
            [restql.server.database.core :as dbcore]
            [restql.server.cache :as cache]
            [restql.server.exception-handler :refer [wrap-exception-handling]]
            [restql.server.plugin.core :as plugin]
            [restql.server.response :as resp]
            [clj-http.conn-mgr :as http-conn]
            [clj-http.core :as http-core]
            [clojure.tools.reader.edn :as edn]
            [environ.core :refer [env]]
            [clojure.core.async :refer [chan go go-loop >! >!! <! alt! timeout]]
            [ring.middleware.params :refer [wrap-params]]
            [slingshot.slingshot :refer [try+]]))

(defonce FIND_QUERY_TTL 86400000)
(def find-query (cache/cached
                  (fn [query-ns id rev]
                    (-> (dbcore/find-query-by-id-and-revision query-ns id rev) :text))
                  FIND_QUERY_TTL))

(def find-mappings (cache/cached (fn [id] (cond
                                            (nil? id) env
                                            :else (-> (dbcore/find-tenant-by-id id)
                                                      :mappings
                                                      (into env))))))

(defn process-query [query query-opts tenant http-client]
  (restql/execute-query-channel :mappings (find-mappings tenant)
                                :encoders base-encoders
                                :query query
                                :query-opts (plugin/get-query-opts-with-plugins query-opts)
                                :http-client http-client))

(defn strip-nils [map]
  (reduce-kv (fn [r k v]
               (if (nil? v)
                 r
                 (assoc r k v))) {} map))

(defn additional-headers [query]
  (let [metadata (meta query)
        cache-control-value (:cache-control metadata)]
    (if (nil? cache-control-value)
      {}
      (strip-nils
        (into {} {"cache-control" (str "max-age=" cache-control-value)})))))

(defn make-headers [interpolated-query result]
  (->
    (resp/extract-alias-suffixed-headers result)
    (into {"Content-Type" "application/json"})
    (into (additional-headers interpolated-query))
    (stringify-keys)))

(defn handle-request [req http-client result-ch error-ch]
  (try+
    (let [uid (generate-uuid!)
          headers {"Content-Type" "application/json"}
          req-headers (into {"restql-query-control" "ad-hoc"} (:headers req))
          params (-> req :query-params keywordize-keys)

          ; Retrieving tenant (env is always prioritized)
          env-tenant (some-> env :tenant)
          tenant (if (nil? env-tenant) (some-> params :tenant) env-tenant)

          query-entry (util/parse-req req)
          query (->> query-entry (util/merge-headers req-headers))
          debugging (-> req :query-params (get "_debug") boolean)

          base-opts {:debugging debugging
                     :tenant    tenant
                     :info      {:type :ad-hoc}}

          forward-params (if (nil? (:forward-prefix env))
                           {}
                           (into {} (filter (partial util/is-contextual? (:forward-prefix env)) params)))
          opts (into {:forward-params forward-params} base-opts)

          [query-ch exception-ch] (process-query query opts tenant http-client)
          timeout-ch (timeout 10000)]
      (debug {:session uid} "starting request handler")
      (go
        (alt!
          timeout-ch ([] (warn {:session uid} "request handler timed out") (>! error-ch {:status 500 :body "Request timed out"}))
          exception-ch ([err] (>! error-ch (util/error-output err)))
          query-ch ([result]
                     (debug {:session uid} " finishing request handler")
                     (>! result-ch {:body    (util/format-response-body result)
                                    :headers (make-headers query-entry result)
                                    :status  (util/calculate-response-status-code result)})))))
    (catch [:type :validation-error] {:keys [message]}
      (go (>! error-ch (util/json-output 400 {:error "VALIDATION_ERROR" :message message}))))
    (catch [:type :parse-error] {:keys [line column]}
      (go (>! error-ch (util/json-output 400 {:error "PARSE_ERROR" :line line :column column}))))
    (catch Exception e (.printStackTrace e)
                       (go (>! error-ch (util/json-output 400 {:error "UNKNOWN_ERROR" :message (.getMessage e)}))))))

(defn- parse-query
  [req respond raise]
    (try+
      (respond {:status 200 :body (util/parse-req req)})
      (catch [:type :parse-error] {:keys [line column reason]}
        (respond {:status 400 :body (str "Parsing error in line " line ", column " column "\n" reason)}))))

(defn run-query 
  [http-client]
  (partial
    (fn ([req respond raise]
      (let [time-before (System/currentTimeMillis)
            result-ch (chan)
            error-ch (chan)]
        (handle-request req http-client result-ch error-ch)
          (go
            (alt!
              result-ch ([result]
                          (debug {:time    (- (System/currentTimeMillis) time-before)
                                  :success true}
                            "restQL Query finished")
                          (respond result))
              error-ch ([err]
                          (error {:time    (- (System/currentTimeMillis) time-before)
                                  :success false}
                            "restQL Query finished")
                          (respond err)))))))))

(defn run-saved-query
  [http-client]
  (partial 
    (fn [req respond raise]
      (debug "Trying to retrieve query" (-> req :params :id))
      (try+
        (let [id (-> req :params :id)
              query-ns (-> req :params :namespace)
              rev (-> req :params :rev read-string)
              headers (-> req :headers)
              req-headers (into {"restql-query-control"   "saved"
                                  "restql-query-namespace" query-ns
                                  "restql-query-id"        id
                                  "restql-query-revision"  rev} (:headers req))
              params (-> req :query-params keywordize-keys)
              debugging (-> params (get :_debug false) boolean)

              ; Retrieving tenant (env is always prioritized)
              env-tenant (some-> env :tenant)
              tenant (if (nil? env-tenant) (some-> params :tenant) env-tenant)
              forward-params (if (nil? (:forward-prefix env))
                                {}
                                (into {} (filter (partial util/is-contextual? (:forward-prefix env)) params)))
              opts {:debugging      debugging
                    :tenant         tenant
                    :forward-params forward-params
                    :info           {:type      :saved
                                      :namespace query-ns
                                      :id        id
                                      :revision  rev}}

              query-entry (find-query query-ns id rev)
              context (into (:headers req) (:query-params req))
              interpolated-query (util/parse query-entry context)
              query (util/merge-headers req-headers interpolated-query)
              time-before (System/currentTimeMillis)
              [result-ch error-ch] (process-query query opts tenant http-client)]
          (debug "Query" query-ns "/" id "rev" rev "retrieved")
          (go
            (alt!
              result-ch ([result]
                          (debug {:time    (- (System/currentTimeMillis) time-before)
                                  :success true}
                                  "restQL Query finished")
                          (respond {:headers (make-headers interpolated-query result)
                                    :status  (util/calculate-response-status-code result)
                                    :body    (util/format-response-body result)}))
              error-ch ([err]
                          (error {:time    (- (System/currentTimeMillis) time-before)
                                  :success false}
                                "restQL Query finished")
                          (respond (str err))))))
        (catch [:type :validation-error] {:keys [message]}
          (respond (util/json-output 400 {:error "VALIDATION_ERROR" :message message})))
        (catch [:type :parse-error] {:keys [line column]}
          (respond (util/json-output 400 {:error "PARSE_ERROR" :line line :column column})))
        (catch Exception e (.printStackTrace e)
                          (respond (util/json-output 400 {:error "UNKNOWN_ERROR" :message (.getMessage e)})))))))

(defn create-http-client [opts]
  (http-core/build-async-http-client {}
    (http-conn/make-reuseable-async-conn-manager {:connect-timeout 5000
                                                  :so-timeout 5000
                                                  :default-per-route 100})))

(c/defroutes
  routes
  ; Routes to health checking
  (c/OPTIONS "*" [] {:status 204})
  (c/GET "/health" [] "restql is healthy :)")
  (c/GET "/resource-status" [] "OK")

  ; Route to validate a query
  (c/POST "/validate-query" [] util/validate-request)

  ; Route to run ad hoc queries
  (c/POST "/run-query" [] (run-query (create-http-client {})))

  ; Route to check the parsing of the query
  (c/POST "/parse-query" [] parse-query)

  (c/GET "/run-query/:namespace/:id/:rev" [] (run-saved-query (create-http-client {})))
  
  (route/not-found "route not found"))


(def app (-> routes
             wrap-exception-handling
             wrap-params))
