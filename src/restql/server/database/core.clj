(ns restql.server.database.core
  (:require [restql.server.database.persistence :as db]
            [restql.server.request-util :as util]
            [environ.core :refer [env]]
            [clojure.edn :as edn]
            [restql.core.validator.core :as validator]
            [slingshot.slingshot :refer [throw+]]
            [org.httpkit.client :as http]))

;re-exporting find-query
(def find-query-by-id-and-revision db/find-query)
(def count-query-revisions db/count-query-revisions)
(def find-all-queries db/find-all-queries)

(defn validate [text]
  (validator/validate {:mappings env} text))


(defn save-query [id query]
  (let [parsed-query (->> query
                          :text
                          edn/read-string)]
    (if (validate parsed-query)
      (db/save-query id query)
      (throw+ {:type :pdg-query-validation-error :data query}))))

  ;(let [validation (validate (:text query))]
  ;  (when-not (:valid? validation)
  ;    (throw+ {:type :pdg-query-validation-error :data validation}))
  ;  (db/save-query id query)))


;(defn get-response-message [body]
;  (try
;    (-> body
;        (json/parse-string true)
;        :message)
;    (catch Exception e
;      (log/warn "error parsing PDG validation response" e)
;      body)))
