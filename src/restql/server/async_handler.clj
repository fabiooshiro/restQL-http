(ns restql.server.async-handler
  (:require [compojure.core :as c]
            [clojure.walk :refer [keywordize-keys]]
            [restql.core.api.restql-facade :as restql]
            [restql.server.logger :refer [log generate-uuid!]]
            [restql.server.request-util :as util]
            [restql.core.log :refer [info warn error]]
            [restql.server.database.persistence :as db]
            [restql.server.database.core :as dbcore]
            [clojure.edn :as edn]
            [clojure.data.json :as json]
            [environ.core :refer [env]]
            [restql.core.transformations.select :refer [select]]
            [restql.server.interpolate :refer [interpolate]]
            [clojure.core.async :refer [chan go go-loop >! >!! <! alt! timeout]]
            [org.httpkit.server :refer [with-channel send!]]
            [ring.middleware.params :refer [wrap-params]]
            [slingshot.slingshot :refer [try+]]))


(defn process-query [query query-opts]
  (restql/execute-query-channel :mappings env
                                :encoders   {}
                                :query      query
                                :query-opts query-opts))


(defn handle-request [req result-ch error-ch]
  (try+
    (let [uid (generate-uuid!)
          headers {"Content-Type" "application/json"}
          response {:headers headers}
          query (util/parse-req req)
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
                              json/write-str
                              (assoc response :body))]
              (info {:session uid} " finishing request handler")
              (>! result-ch output))))))
    (catch [:type :validation-error] {:keys [message]}
      (go (>! error-ch (util/json-output 400 message))))
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
          query-entry (-> (db/find-query id rev) :text)
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

(defn make-revision-link
        [id, rev]
        (str "/run-query/" id "/revision/" rev))

(defn add-query [req]
  (let [id (-> req :params :id)
        query (-> req :body slurp)
        metadata (-> query edn/read-string meta) ]
    {:status 201
     :headers {"Location" (->> (dbcore/save-query id (util/format-entry-query query metadata))
                               :size
                               (make-revision-link id))}}))


(c/defroutes routes
  (c/OPTIONS "/restql" request {:status 204} )
  (c/GET "/health" [] "restql is healthy :)")
  (c/GET "/resource-status" [] "OK")
  (c/POST "/restql/validate" req (util/validate-request req))
  (c/POST "/run-query" req (run-query req))
  (c/POST "/save-query/:id" req (add-query req))
  (c/GET "/run-query/:id/revision/:rev" req (run-saved-query req)))

(def app (-> routes
             wrap-params ))
