(ns restql.server.cache
  (:require [clojure.tools.logging :as log]
            [slingshot.slingshot :refer [throw+]]
            [clojure.core.cache :as cache]
            [clojure.core.memoize :as memo]))

(def search-cache (atom (cache/fifo-cache-factory {} :threshold 100)))
(def DEFAULT_TTL 10000)

(defn build-cache [limit]
  (atom (cache/fifo-cache-factory {} :threshold limit)))

(defn cacheable [fun acache key]
  (if (cache/has? @acache key)
    (cache/lookup @acache key)
    (let [res (fun)]
      (when-not (nil? res)
        (reset! acache (cache/miss @acache key res))
        res))))

(defn cached [function]
  (memo/ttl function {} :ttl/threshold DEFAULT_TTL))

(defn clear-cache [cached-fn]
  (memo/memo-clear! cached-fn))

(defmacro defcached [fname using cache-atom args & body]
  `(defn ~fname ~args
     (cacheable (fn [] ~@body) ~cache-atom ~args)))

