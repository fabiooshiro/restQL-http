(ns restql.server.network
  (:require [restql.server.request-util :as util]
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


(defn check-availability
  "Checks if a server is available"
  
  ([resource-url] (check-availability resource-url "/resource-status"))
  ([resource-url check-path]
    (let [check-url (str (get-base-url resource-url) check-path)
          timeout 250
          response (http/get check-url {:timeout timeout
                                        :idle-timeout timeout
                                        :connect-timeout timeout})]
      (some-> @response :status))))