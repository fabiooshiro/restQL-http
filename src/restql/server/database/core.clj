(ns restql.server.database.core
  (:require [pdg-named-query.query.persistence :as db]
            [pdg-named-query.pdg.core :as pdg]
            [slingshot.slingshot :refer [throw+]]
            ))

;re-exporting find-query
(def find-query-by-id-and-revision db/find-query)
(def count-query-revisions db/count-query-revisions)


(defn save-query [id query]
  (let [validation (pdg/validate (:text query))]
    (when-not (:valid? validation)
      (throw+ {:type :pdg-query-validation-error :data validation}))
    (db/save-query id query)))

(comment
  (save-query "omg" "[]")
  )

