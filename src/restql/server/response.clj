(ns restql.server.response
  (:require [clojure.data.json :as json]
            [clojure.string :as string]))

(defn is-x-preffixed-header? [[k _]]
  (some->
    k
    (keyword)
    (name)
    (string/includes? "x-")))

(defn suffixed-keyword [kwd separator suffix]
  (keyword (str (name kwd) separator (name suffix))))

(defn map-headers-to-aliases
  "Given a key-value pair, where key is the resource alias
   and value is it's value, extracts only the headers to a
   new map."
  [[k v]]
  (into {} {k (some-> v :details :headers)}))

(defn map-suffixes-to-headers [alias headers]
  (let [special-headers (filter is-x-preffixed-header? headers)
        header-keys (keys special-headers)
        header-values (vals special-headers)]
    (->>
      (map (fn [k v] {(suffixed-keyword k "-" alias) v}) header-keys header-values)
      (into {}))))

(defn get-alias-suffixed-headers
  "Given a key-value pair, where key is the resource alias
  and value is it's value, inserts the key prefix on each key
  of the headers map."
  [headers-json]
  (let [aliases (keys headers-json)
        values (vals headers-json)]
    (into {} (map map-suffixes-to-headers aliases values))))

(defn get-response-headers
  "Return a map of :resource headers"
  [response-json]
  (->>
    response-json
    (map map-headers-to-aliases)
    (into {})))

(defn transform-response [query-response]
  (if
    (string? query-response)
    (json/read-str query-response :key-fn keyword)
    query-response))

(defn extract-alias-suffixed-headers
  "Extracts all headers of a query response string."
  [query-response]
  (->>
    (transform-response query-response)
    (get-response-headers)
    (get-alias-suffixed-headers)))