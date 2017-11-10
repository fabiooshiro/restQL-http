(ns restql.server.async-handler
  (:require [compojure.core :as c]
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
            [clojure.tools.reader.edn :as edn]
            [environ.core :refer [env]]
            [clojure.core.async :refer [chan go go-loop >! >!! <! alt! timeout]]
            [org.httpkit.server :refer [with-channel send!]]
            [ring.middleware.params :refer [wrap-params]]
            [ring.middleware.json :refer [wrap-json-body wrap-json-response]]
            [slingshot.slingshot :refer [try+]]))
(defonce FIND_QUERY_TTL 86400000)
(def find-query (cache/cached
                  (fn [query-ns id rev]
                    (-> (dbcore/find-query-by-id-and-revision query-ns id rev) :text))
                  FIND_QUERY_TTL))

(def find-mappings (cache/cached (fn [id] (cond
                                            (nil? id) (util/filter-valid-urls env)
                                            :else (-> (dbcore/find-tenant-by-id id)
                                                      :mappings
                                                      (into env)
                                                      util/filter-valid-urls)))))

(defn process-query [query query-opts tenant]
  (restql/execute-query-channel :mappings (find-mappings tenant)
                                :encoders base-encoders
                                :query query
                                :query-opts (plugin/get-query-opts-with-plugins query-opts)))

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

(defn handle-request [req result-ch error-ch]
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

          [query-ch exception-ch] (process-query query opts tenant)
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

(defn- parse-query [req]
  (try+
    {:status 200 :body (util/parse-req req)}
    (catch [:type :parse-error] {:keys [line column reason]}
      {:status 400 :body (str "Parsing error in line " line ", column " column "\n" reason)})))

(defn run-query
  [req]
  (with-channel req channel
                (let [time-before (System/currentTimeMillis)
                      result-ch (chan)
                      error-ch (chan)]
                  (handle-request req result-ch error-ch)
                  (go
                    (alt!
                      result-ch ([result]
                                  (debug {:time    (- (System/currentTimeMillis) time-before)
                                          :success true}
                                         "restQL Query finished")
                                  (send! channel result))
                      error-ch ([err]
                                 (error {:time    (- (System/currentTimeMillis) time-before)
                                         :success false}
                                        "restQL Query finished")
                                 (send! channel err)))))))

(defn run-saved-query
  [req]
  (with-channel req channel
                (debug "Trying to retrieve query" (-> req :params :id))
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
                      [result-ch error-ch] (process-query query opts tenant)]
                  (debug "Query" query-ns "/" id "rev" rev "retrieved")
                  (go
                    (alt!
                      result-ch ([result]
                                  (debug {:time    (- (System/currentTimeMillis) time-before)
                                          :success true}
                                         "restQL Query finished")
                                  (send! channel {:headers (make-headers interpolated-query result)
                                                  :status  (util/calculate-response-status-code result)
                                                  :body    (util/format-response-body result)}))
                      error-ch ([err]
                                 (error {:time    (- (System/currentTimeMillis) time-before)
                                         :success false}
                                        "restQL Query finished")
                                 (send! channel err)))))))



(c/defroutes
  routes
  ; Routes to health checking
  (c/OPTIONS "*" request {:status 204})
  (c/GET "/health" [] "restql is healthy :)")
  (c/GET "/resource-status" [] "OK")

  ; Route to validate a query
  (c/POST "/validate-query" req (util/validate-request req))

  ; Route to run ad hoc queries
  (c/POST "/run-query" req (run-query req))

  ; Route to check the parsing of the query
  (c/POST "/parse-query" req (parse-query req))

  (c/GET "/run-query/:namespace/:id/:rev" req (run-saved-query req)))


(def app (-> routes
             wrap-exception-handling
             wrap-params
             wrap-json-response
             (wrap-json-body {:keywords? true})))
