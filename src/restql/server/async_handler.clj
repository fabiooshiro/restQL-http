(ns restql.server.async-handler
  (:require [compojure.core :as c]
            [clojure.walk :refer [keywordize-keys]]
            [restql.core.api.restql-facade :as restql]
            [restql.server.logger :refer [log generate-uuid!]]
            [restql.core.log :refer [info warn error]]
            [restql.server.database.persistence :as db]
            [clojure.edn :as edn]
            [clojure.data.json :as json]
            [environ.core :refer [env]]
            [restql.core.transformations.select :refer [select]]
            [restql.server.interpolate :refer [interpolate]]
            [clojure.core.async :refer [chan go go-loop >! >!! <! alt! timeout]]
            [org.httpkit.server :refer [with-channel send!]]
            [ring.middleware.params :refer [wrap-params]]
            [slingshot.slingshot :refer [try+]]))

(defn parse-req [req]
  (->> req
       :body
       slurp))

(defn status-code-ok [query-response]
  (and
    (not (nil? (:status query-response)))
    (< (:status query-response) 300)))

(defn is-success [query-response]
  (and
    (status-code-ok query-response)
    (nil? (:parse-error query-response))))

(defn process-query [query query-opts]
  (restql/execute-query-channel :mappings env
                                :encoders   {}
                                :query      query
                                :query-opts query-opts))

(defn error-output [err]
  (case (:type err)
    :expansion-error {:status 422 :body "There was an expansion error"}
    :invalid-resource-type {:status 422 :body "Request with :from string is no longer supported"}
    :invalid-parameter-repetition {:status 422 :body (:message err)}
    {:status 500 :body "internal server error"}))

(defn json-output [status message]
  {:status status
   :headers {"Content-Type" "application/json"}
   :body (json/write-str {:message message})})

(defn validate-request [req]
  (try+
    (->> req parse-req)
    (json-output 200 "ok")

    (catch [:type :validation-error] {:keys [message]}
      (json-output 400 message))
    (catch Object e
      (json-output 500 (.toString e)))))

(defn handle-request [req result-ch error-ch]
  (try+
    (let [uid (generate-uuid!)
          headers {"Content-Type" "application/json"}
          response {:headers headers}
          query (parse-req req)
          debugging (-> req :query-params (get "_debug") boolean)
          [query-ch exception-ch] (process-query query {:debugging debugging})
          timeout-ch (timeout 10000)]
      (info {:session uid} "starting request handler")
      (go
        (alt!
          timeout-ch ([] (warn {:session uid} "request handler timed out") (>! error-ch {:status 500 :body "Request timed out"}))
          exception-ch ([err] (>! error-ch (error-output err)) )
          query-ch ([result]
            (let [output (->> result
                              ;(select (flatten query))
                              json/write-str
                              (assoc response :body))]
              (info {:session uid} " finishing request handler")
              (>! result-ch output))))))
    (catch [:type :validation-error] {:keys [message]}
      (go (>! error-ch (json-output 400 message))))
    (catch Exception e (.printStackTrace e)
      (go (>! error-ch (.getMessage e))))))

(defn- run-query
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
          rev (-> req :params :rev read-string)
          headers (-> req :headers)
          params (-> req :query-params keywordize-keys)
          query-entry (db/find-query id rev)
          query-with-params (interpolate query-entry params) ; Interpolating parameters
          query (interpolate query-with-params headers) ; Interpolating headers
          time-before (System/currentTimeMillis)
          [result-ch error-ch] (process-query query params)]
          (info "Query" id "rev" rev "retrieved")
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


(c/defroutes routes
  (c/OPTIONS "/restql" request {:status 204} )
  (c/GET "/health" [] "restql is healthy :)")
  (c/GET "/resource-status" [] "OK")
  (c/POST "/restql/validate" req (validate-request req))
  (c/POST "/run-query" req (run-query req))
  (c/GET "/run-query/:id/revision/:rev" req (run-saved-query req)))

(def app (-> routes
             wrap-params ))
