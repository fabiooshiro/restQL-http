(ns restql.server.async-handler
  (:require [compojure.core :as c]
            [clojure.walk :refer [keywordize-keys]]
            [restql.core.api.restql-facade :as restql]
            [restql.core.log :refer [info warn error]]
            [restql.server.logger :refer [log generate-uuid!]]
            [restql.server.request-util :as util]
            [restql.server.database.core :as dbcore]
            [restql.server.exception-handler :refer [wrap-exception-handling]]
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


(defn process-query [query query-opts]
  (restql/execute-query-channel :mappings env
                                :encoders   {}
                                :query      query
                                :query-opts query-opts))

(defn list-mapped-resources []
  {:status 200
   :body {:resources (filter
                       (fn [key]
                         (util/valid-url? (env key)))
                       (keys env))}
   })

(defn validate-request [req]
  (try+
    (let [query (->>
                  (util/parse-req req)
                  edn/read-string)]
      (if (dbcore/validate query)
        (util/json-output 200 "valid")))
    (catch [:type :validation-error] {:keys [message]}
      (util/json-output 400 message))))

(defn make-revision-link [id, rev]
  (str "/run-query/" id "/revision/" rev))

(defn make-revision-list-link [id]
  (str "/revisions/" id))

(defn make-query-link [id, rev]
  (str "/query/" id "/revision/" rev))


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
(defn- list-revisions [req]
  (let [id (-> req :params :id)
        revs (dbcore/count-query-revisions id)]
    {:status (if (= 0 revs) 404 200)
     :body {:revisions (->> (range 0 revs)
                             reverse
                             (map inc)
                             (map (fn [index]
                                    {:index index
                                     :link (make-revision-link id index)
                                     :query (make-query-link id index)}))
                             (into []))}}))

(defn- find-formatted-query [req]
  (let [id (-> req :params :id)
        rev (-> req :params :rev read-string)
        query (-> (dbcore/find-query-by-id-and-revision id rev) :text)]
    {:status (if (= 0 rev) 404 200)
     :body query}))

(defn- list-saved-queries []
  (let [queries (dbcore/find-all-queries {})]
    {:status 200
     :body {:queries (map
                       (fn[q] {:id (:id q)
                               :revisions (make-revision-list-link (:id q))
                               :last-revision (make-query-link (:id q) (:size q))})
                       queries)}}))

(defn- run-saved-query
  [req]
  (with-channel req channel
    (info "Trying to retrieve query" (-> req :params :id))
    (let [id (-> req :params :id)
          rev (-> req :params :rev read-string)
          headers (-> req :headers)
          params (-> req :query-params keywordize-keys)
          query-entry (-> (dbcore/find-query-by-id-and-revision id rev) :text)
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


(defn add-query [req]
  (let [id (-> req :params :id)
        query (util/parse-req req)
        metadata (-> query edn/read-string meta) ]
    {:status 201
     :headers {"Location" (->> (dbcore/save-query id (util/format-entry-query query metadata))
                               :size
                               (make-revision-link id))}}))


(c/defroutes routes
  ; Routes to health checking
  (c/OPTIONS "/restql" request {:status 204} )
  (c/GET "/health" [] "restql is healthy :)")
  (c/GET "/resource-status" [] "OK")

  ; Route to check mapped resources
  (c/GET "/resources" [] (list-mapped-resources))

  ; Route to validate some query
  (c/POST "/validate-query" req (validate-request req))

  ; Route to run ad hoc queries
  (c/POST "/run-query" req (run-query req))

  ; Routes to search for queries and revisions
  (c/GET "/queries" [] (list-saved-queries))
  (c/GET "/revisions/:id" req (list-revisions req))
  (c/GET "/query/:id/revision/:rev" req (find-formatted-query req))

  ; Routes to save and run saved queries
  (c/POST "/save-query/:id" req (add-query req))
  (c/GET "/run-query/:id/revision/:rev" req (run-saved-query req)))

(def app (-> routes
             wrap-exception-handling
             wrap-params
             wrap-json-response
             (wrap-json-body {:keywords? true})))
