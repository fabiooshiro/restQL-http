(ns restql.server.async-manager-handler
  (:require [compojure.core :as c]
            [clojure.walk :refer [keywordize-keys]]
            [restql.core.log :refer [info warn error]]
            [restql.server.logger :refer [log generate-uuid!]]
            [restql.server.request-util :as util]
            [restql.server.database.core :as dbcore]
            [restql.server.cache :as cache]
            [restql.server.network :as net]
            [restql.server.exception-handler :refer [wrap-exception-handling]]
            [restql.server.async-handler :as runner]
            [clojure.edn :as edn]
            [clojure.data.json :as json]
            [environ.core :refer [env]]
            [clojure.core.async :refer [chan go go-loop >! >!! <! alt! timeout]]
            [org.httpkit.server :refer [with-channel send!]]
            [ring.middleware.params :refer [wrap-params]]
            [ring.middleware.json :refer [wrap-json-body wrap-json-response]]
            [ring.middleware.file :refer [wrap-file]]
            [slingshot.slingshot :refer [try+]]))

(def mapped-tenants (cache/cached (fn [] (dbcore/find-tenants {}))))

(defn mapped-resources-with-check [mappings]
  (reduce-kv
    (fn [m k v] (into m [{:name k
                          :url v
                          :status (net/check-availability v)}]))
      []
      mappings))

(defn list-mapped-tenants []
  {:status 200
   :body {:tenants (mapped-tenants)}})

(defn list-mapped-resources [req]
  (with-channel req channel
    (let [tenant (some-> req :params :tenant)
          resources (runner/find-mappings tenant)
          mappings (mapped-resources-with-check resources)]
      (send! channel {:status 200 :body (json/write-str {:resources mappings})}))))

(defn list-namespaces []
  {:status 200 :body (dbcore/list-namespaces {})})


(defn- list-revisions [req]
  (let [id (-> req :params :id)
        query-ns (-> req :params :namespace)
        revs (dbcore/count-query-revisions query-ns id)]
    {:status (if (= 0 revs) 404 200)
     :body {:revisions (->> (range 0 revs)
                            reverse
                            (map inc)
                            (map (fn [index]
                                   {:index index
                                    :link (util/make-revision-link query-ns id index)
                                    :query (util/make-query-link query-ns id index)}))
                            (into []))}}))


(defn- find-formatted-query [req]
  (let [query-ns (-> req :params :namespace)
        id (-> req :params :id)
        rev (-> req :params :rev Integer/parseInt)
        query (-> (dbcore/find-query-by-id-and-revision query-ns id rev) :text)]
    {:status (if (= 0 rev) 404 200)
     :body query}))

(defn- list-saved-queries [req]
  (let [query-ns (-> req :params :namespace)
        queries (dbcore/find-all-queries-by-namespace query-ns)]
    {:status 200
     :body {:queries (map
                       (fn[q] {:id (:id q)
                               :revisions (util/make-revision-list-link query-ns (:id q))
                               :last-revision (util/make-query-link query-ns (:id q) (:size q))})
                       queries)}}))

(defn add-query [req]
  (let [id (-> req :params :id)
        query-ns (-> req :params :namespace)
        query (util/extract-body req)

        ; Retrieving tenant (env is always prioritized)
        tenant (some-> req
                       :query-params
                       keywordize-keys
                       :tenant)

        metadata {} ] ;(-> query edn/read-string meta) ]
    {:status 201
     :headers {"Location" (->> (dbcore/save-query query-ns id query (runner/find-mappings tenant))
                               :size
                               (util/make-revision-link query-ns id))}
     :body {
       :result (list-revisions req)
     }}))

(c/defroutes
  routes

  (c/GET "/health" [] "restql manager is healthy :)")
  (c/GET "/resource-status" [] "OK")

  ; Route to check mapped resources
  (c/GET "/tenants" [] (list-mapped-tenants))
  (c/GET "/resources/:tenant" req (list-mapped-resources req))
  (c/GET "/resources" req (list-mapped-resources req))

  ; Route to validate a query
  (c/POST "/validate-query" req (util/validate-request req))

  ; Routes to run queries
  (c/POST "/run-query" req (runner/run-query req))
  (c/GET "/run-query/:namespace/:id/:rev" req (runner/run-saved-query req))

  ; Routes to search for queries and revisions
  (c/GET "/namespaces" req (list-namespaces))
  (c/GET "/ns/:namespace" req (list-saved-queries req))
  (c/GET "/ns/:namespace/query/:id" req (list-revisions req))
  (c/GET "/ns/:namespace/query/:id/revision/:rev" req (find-formatted-query req))

  ; Route to save queries
  (c/POST "/ns/:namespace/query/:id" req (add-query req)))

(def app (-> routes
             wrap-exception-handling
             wrap-params
             wrap-json-response
             (wrap-file "manager-interface/build")
             (wrap-json-body {:keywords? true})))
