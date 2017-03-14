(ns restql.server.request-util
  (:require [clojure.data.json :as json]
            [slingshot.slingshot :refer [try+]]
            [environ.core :refer [env]]
            [clojure.edn :as edn]
            [restql.parser.core :as parser]
            [restql.core.validator.core :as validator])
  (import [org.apache.commons.validator UrlValidator]))

(defn parse [text]
  (let [parsed (parser/parse-query (str text "\n") :pretty true)]
    (println parsed)
    parsed))

(defn parse-req [req]
  (->> req
       :body
       slurp
       parse))

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

(defn format-entry-query [text metadata]
  (let [data (into {} metadata)]
    (assoc data :text text)))


(defn valid-url? [url-str]
  (let [validator (UrlValidator.)]
    (.isValid validator url-str)))

(defn make-revision-link [query-ns id rev]
  (str "/run-query/ns/" query-ns "/query/" id "/revision/" rev))

(defn make-revision-list-link [query-ns id]
  (str "/ns/" query-ns "/query/" id))

(defn make-query-link [query-ns id rev]
  (str "/ns/" query-ns "/query/" id "/revision/" rev))

(defn validate-request [req]
  (try+
    (let [query (->>
                  (parse-req req)
                  edn/read-string)]
      (if (validator/validate {:mappings env} query)
        (json-output 200 "valid")))
    (catch [:type :validation-error] {:keys [message]}
      (json-output 400 message))))
