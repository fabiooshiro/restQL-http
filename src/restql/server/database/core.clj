(ns restql.server.database.core
  (:require [restql.server.database.persistence :as db]
            [restql.server.request-util :as util]
            [slingshot.slingshot :refer [throw+]]
            [org.httpkit.client :as http]))

;re-exporting find-query
(def find-query-by-id-and-revision db/find-query)
(def count-query-revisions db/count-query-revisions)


;(def restql-url (:restql-url env))
;
;(defn request-restql-validate! [text]
;        (http/request {:url    (str restql-url "/validate")
;                       :method :post
;                       :body   text}))
;
;(defn validate [text]
;        (let [{:keys [status body]} @(request-restql-validate! text)]
;          (if (= 400 status)
;            {:valid? false
;             :details (get-response-message body)}
;            {:valid? true})))



(defn save-query [id query]
  (db/save-query id query))
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
