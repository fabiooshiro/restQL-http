(ns restql.server.async-handler
  (:require [compojure.core :as c]
            [clojure.walk :refer [keywordize-keys]]
            [restql.core.api.restql-facade :as restql]
            [restql.core.log :refer [info warn error]]
            [restql.server.logger :refer [log generate-uuid!]]
            [restql.server.request-util :as util]
            [restql.server.database.core :as dbcore]
            [restql.server.cache :as cache]
            [restql.server.exception-handler :refer [wrap-exception-handling]]
            [restql.server.plugin.core :as plugin]
            [clojure.edn :as edn]
            [clojure.data.json :as json]
            [environ.core :refer [env]]
            [restql.core.transformations.select :refer [select]]
            [restql.server.interpolate :refer [interpolate]]
            [clojure.core.async :refer [chan go go-loop >! >!! <! alt! timeout]]
            [org.httpkit.server :refer [with-channel send!]]
            [ring.middleware.params :refer [wrap-params]]
            [ring.middleware.json :refer [wrap-json-body wrap-json-response]]
            [slingshot.slingshot :refer [try+]]))

(def find-query (cache/cached (fn [query-ns id rev]
                                 (-> (dbcore/find-query-by-id-and-revision query-ns id rev) :text))))

(defn process-query [query query-opts]
  (restql/execute-query-channel :mappings env
                                :encoders   {}
                                :query      query
                                :query-opts (plugin/get-query-opts-with-plugins query-opts)))


(defn handle-request [req result-ch error-ch]
  (try+
    (let [uid (generate-uuid!)
          headers {"Content-Type" "application/json"}
          response {:headers headers}
          query (util/merge-headers (:headers req) (util/parse-req req))
          _ (println query)
          debugging (-> req :query-params (get "_debug") boolean)
          [query-ch exception-ch] (process-query query {:debugging debugging})
          timeout-ch (timeout 10000)]
      (info {:session uid} "starting request handler")
      (go
        (alt!
          timeout-ch ([] (warn {:session uid} "request handler timed out") (>! error-ch {:status 500 :body "Request timed out"}))
          exception-ch ([err] (>! error-ch (util/error-output err)) )
          query-ch ([result]
            (let [output (->> result
                              ;(select (flatten query))
                              (assoc response :body))]
              (info {:session uid} " finishing request handler")
              (>! result-ch output))))))
    (catch [:type :validation-error] {:keys [message]}
      (go (>! error-ch (util/json-output 400 message))))
    (catch [:type :parse-error] {:keys [line column]}
      (go (>! error-ch (util/json-output 400 {:error "PARSE_ERROR" :line line :column column}))))
    (catch Exception e (.printStackTrace e)
      (go (>! error-ch (.getMessage e))))))

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
                                  (info {:time (- (System/currentTimeMillis) time-before )
                                         :success true}
                                        "restQL Query finished")
                                  (send! channel result))
                      error-ch ([err]
                                 (error {:time (- (System/currentTimeMillis) time-before )
                                         :success false}
                                        "restQL Query finished")
                                 (send! channel err)))))))


(defn- run-saved-query
  [req]
  (with-channel req channel
    (info "Trying to retrieve query" (-> req :params :id))
    (let [id (-> req :params :id)
          query-ns (-> req :params :namespace)
          rev (-> req :params :rev read-string)
          headers (-> req :headers)
          params (-> req :query-params keywordize-keys)
          query-entry (find-query query-ns id rev)
          query-with-params (interpolate query-entry params) ; Interpolating parameters
          query-with-headers (interpolate query-with-params headers) ; Interpolating headers
          query (-> query-with-headers util/parse)
          time-before (System/currentTimeMillis)
          [result-ch error-ch] (process-query query params)]
          (info "Query" id "rev" rev "retrieved")
      (go
        (alt!
          result-ch ([result]
                      (info {:time (- (System/currentTimeMillis) time-before )
                             :success true}
                            "restQL Query finished")
                      (send! channel {:headers {"Content-Type" "application/json"}
                                      :body result}))
          error-ch ([err]
                     (error {:time (- (System/currentTimeMillis) time-before )
                             :success false}
                            "restQL Query finished")
                     (send! channel err)))))))



(c/defroutes
  routes
  ; Routes to health checking
  (c/OPTIONS "/restql" request {:status 204} )
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
