(ns restql.server.request-util
  (:require [clojure.data.json :as json]
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


(defn error-output [err]
  (case (:type err)
    :expansion-error {:status 422 :body "There was an expansion error"}
    :invalid-resource-type {:status 422 :body "Request with :from string is no longer supported"}
    :invalid-parameter-repetition {:status 422 :body (:message err)}
    {:status 500 :body "internal server error"}))

(defn json-output [status message]
  {:status  status
   :headers {"Content-Type" "application/json"}
   :body    (json/write-str {:message message})})

(defn validate-request [req]
  (try+
    (->> req parse-req)
    (json-output 200 "ok")

    (catch [:type :validation-error] {:keys [message]}
      (json-output 400 message))
    (catch Object e
      (json-output 500 (.toString e)))))

(defn format-entry-query [text metadata]
  (let [data (into {} metadata)]
    (assoc data :text text)))
