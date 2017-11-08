(ns restql.server.database.core
  (:require [restql.server.database.persistence :as db]
            [environ.core :refer [env]]
            [clojure.edn :as edn]
            [restql.core.validator.core :as validator]
            [slingshot.slingshot :refer [throw+]]
            [org.httpkit.client :as http]
            [restql.server.request-util :as util]))

;re-exporting find-query
(def find-query-by-id-and-revision db/find-query)
(def count-query-revisions db/count-query-revisions)
(def list-namespaces db/list-namespaces)
(def find-all-queries-by-namespace db/find-all-queries-by-namespace)

;re-exporting tenant methods
(def find-tenants db/find-tenants)
(def find-tenant-by-id db/find-tenant-by-id)
(def save-resource db/save-resource)

(defn save-query
  "Validates a given query and saves it into the database"
  [query-ns id query mappings]

  (let [parsed-query (util/parse query {})]
    (if (validator/validate {:mappings mappings} parsed-query)
      (db/save-query query-ns id {:text query})
      (do (println query) (throw+ {:type :pdg-query-validation-error :data query})))))
