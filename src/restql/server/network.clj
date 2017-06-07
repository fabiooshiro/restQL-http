(ns restql.server.network
  (:require [restql.server.request-util :as util]
            [clojure.core.async :refer [chan go go-loop >! <! alt!! alt! timeout]]
            [org.httpkit.client :as http]))

(defn get-base-url
  "Gets the base url of a given url string
   or nil if not valid.
    E.g.:
      url-str: http://www.example.com/123/abc?x=5
      return: http://www.example.com"
  [url-str]

  (if (util/valid-url? url-str)
    (let [uriObj (new java.net.URI url-str)
          scheme (.getScheme uriObj)
          host (.getHost uriObj)
          port (.getPort uriObj)
          portString (if (= -1 port) 80 port)]
      (str scheme "://" host ":" portString))
    nil))


(defn perform-request!
  "Performs the check request"
  [url timeout]

  (let [output (chan)]
    (http/get (str url "/resource-status")
              {:connect-timeout timeout
               :timeout timeout
               :idle-timeout (/ 5 timeout)}
              (fn [{:keys [status]}]
                (go (>! output (if (nil? status) 0 status)))))
    output))

(defn start-requester!
  "Starts a new async requester"
  [{:keys [name url base-url]} timeout-value aggr-ch]
  
  (go
    (alt!
      (timeout timeout-value) 
        ([_] (>! aggr-ch {:url url :base-url base-url :name name :status 408}))

      (perform-request! base-url timeout-value)
        ([status] (>! aggr-ch {:url url :base-url base-url :name name :status status})))))


(defn start-aggregator!
  "Starts a new aggregator"
  [init-count aggr-ch result-ch]
  
  (go-loop [count init-count
            state []]
    (if (> count 0)
      (recur
        (dec count)
        (conj state (<! aggr-ch)))
      (>! result-ch state))))

(defn check-availabilities
  "Does the async check"
  [mappings global-timeout]

  (let [input (map (fn [[k v]] {:name k :url v :base-url (get-base-url v)}) mappings)
        size (count input)
        aggr-ch (chan)
        result-ch (chan)]

  (doseq [item input] (start-requester! item 500 aggr-ch))
  (start-aggregator! size aggr-ch result-ch)
  
  (alt!! 
    result-ch                ([result] result)
    (timeout global-timeout) ([_] {:error :timeout}))))