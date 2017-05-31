(ns restql.server.request-util
  (:require [clojure.data.json :as json]
            [slingshot.slingshot :refer [try+]]
            [environ.core :refer [env]]
            [clojure.edn :as edn]
            [restql.parser.core :as parser]
            [restql.core.validator.core :as validator])
  (import [org.apache.commons.validator UrlValidator]))

(def headers-blacklist
  ["host"
   "content-type"
   "content-length"
   "connection"
   "origin"])

(defn header-allowed?
  "Filter to verify if the given header (k) is not on the headers-blacklist"
  [[k v]]

  (let [header (.toLowerCase k)]
    (not
      (some #(= header %) headers-blacklist))))

(defn add-headers-to-object
  "Adds or appends headers to a given query"
  [headers query-obj]

  (if (nil? (query-obj :with-headers))
    (into query-obj {:with-headers (into {} (filter header-allowed? headers))})
    (into query-obj {:with-headers (into (query-obj :with-headers) (into {} (filter header-allowed? headers)))})))

(defn merge-headers
  "Merge a given headers map with the query :with-headers"
  [headers query]

  (let [data (->> query edn/read-string (partition 2))
        binds (map first data)
        items (map second data)
        items-with-headers (map (partial add-headers-to-object headers) items)
        data-with-headers (flatten (map vector binds items-with-headers)) ]
    (binding [*print-meta* true]
      (pr-str (into [] data-with-headers)))))

(defn parse
  "Parse the given query text to EDN format"
  [text context]

  (parser/parse-query (str text "\n") :pretty true :context context))

(defn extract-body
  "Extracts the body from a given request"
  [req]

  (->> req
       :body
       slurp))

(defn parse-req
  "Parses a given request, extracting it's headers, parameters and body
   and returns the request body and a context map"
  [req]

  (let [body (extract-body req)
        params (:params req)
        headers (:headers req)
        context (into headers params)]
    (parse body context)))

(defn status-code-ok
  "Verifies if the status code of a given response is an OK class
   status code"
  [query-response]

  (and
    (not (nil? (:status query-response)))
    (< (:status query-response) 300)))


(defn is-success
  "Verifies if the response is a success response"
  [query-response]

  (and
    (status-code-ok query-response)
    (nil? (:parse-error query-response))))


(defn error-output
  "Creates an error output response from a given error"
  [err]

  (case (:type err)
    :expansion-error {:status 422 :body "There was an expansion error"}
    :invalid-resource-type {:status 422 :body "Request with :from string is no longer supported"}
    :invalid-parameter-repetition {:status 422 :body (:message err)}
    {:status 500 :body "internal server error"}))

(defn json-output
  "Creates a json output given it's status and body (message)"
  [status message]

  {:status  status
   :headers {"Content-Type" "application/json"}
   :body    (json/write-str {:message message})})

(defn format-entry-query
  "Formats a query entry"
  [text metadata]

  (let [data (into {} metadata)]
    (assoc data :text text)))


(defn valid-url?
  "Verifies if a given string is a valid URL"
  [url-str]

  (let [validator (UrlValidator.)]
    (.isValid validator url-str)))

(defn filter-valid-urls
  "Filters all valid URLs of a given map"
  [mp]

  (reduce-kv
    (fn [m k v]
      (if (valid-url? v) (into m {k v}) m))
    {}
    (into {} mp)))

(defn make-revision-link
  "Returns a revision route"
  [query-ns id rev]

  (str "/run-query/" query-ns "/" id "/" rev))

(defn make-revision-list-link
  "Returns a query list route"
  [query-ns id]

  (str "/ns/" query-ns "/query/" id))

(defn make-query-link
  "Return a query execution route"
  [query-ns id rev]

  (str "/ns/" query-ns "/query/" id "/revision/" rev))

(defn validate-request
  "Validates if a given request is valid"
  [req]

  (try+
    (let [query (->>
                  (parse-req req)
                  edn/read-string)]
      (if (validator/validate {:mappings env} query)
        (json-output 200 "valid")))
    (catch [:type :validation-error] {:keys [message]}
      (json-output 400 message))))

(defn should-ignore-errors
  "Searches for an ignore-errors meta on a given item
   and returns it's value"
  [item]

  (-> item
      :details
      :metadata
      :ignore-errors
      (= "ignore")))

(defn higher-value
  "Returns the max between a and b"
  [a b]

  (cond
    (nil? a) b
    (nil? b) a
    (> a b) a
    :else b))

(defn calculate-response-status-code
  "Calculates the response status code of a given result"
  [result]

  (let [statuses (as-> result x
                 (json/read-str x :key-fn keyword)
                 (vals x)
                 (flatten x)
                 (filter (complement should-ignore-errors) x)
                 (map (comp :status :details) x))]
    (reduce higher-value 200 statuses)))

(defn map-values [f m]
  (reduce-kv (fn [r k v] (assoc r k (f v)) ) {} m))

(defn format-response-details
  "Formats the response details"
  [details]

  (dissoc details :headers))

(defn format-response-value
  "Formats the response value"
  [item]

  (let [details (-> item :details format-response-details)]
    (assoc item
           :details details)))

(defn format-response-item
  "Formats a response item"
  [item]

  (cond
    (sequential? item) (map format-response-value item)
    :else (format-response-value item)))

(defn format-response-body
  "Formats the response body"
  [result]

  (as-> result x
    (json/read-str x :key-fn keyword)
    (map-values format-response-item x)
    (json/write-str x)))
