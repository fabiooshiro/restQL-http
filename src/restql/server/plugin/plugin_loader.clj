(ns restql.server.plugin.plugin-loader
  (:require [clojure.java.classpath :as cp]
            [clojure.java.io :as io]
            [restql.core.log :refer [info]]
            [cheshire.core :as json]))

(defn is-plugin-properties-file? [path]
  (not (nil? (re-matches #".*restql-plugin\.json$" (.toLowerCase path)))))

(defn create-plugin-def [json-def]
  (let [ns-symbol (symbol (:namespace json-def))
        _ (require ns-symbol)
        check-fn (ns-resolve ns-symbol (symbol "check"))
        add-hooks-fn (ns-resolve ns-symbol (symbol "add-hooks"))]
    {:name (:name json-def)
     :check check-fn
     :add-hooks add-hooks-fn}))

(defn read-plugin-def [desc-file-path]
  (-> desc-file-path
      io/resource
      io/input-stream
      slurp
      (json/parse-string true)
      create-plugin-def))

(defn search-installed-plugins []
  (->> (cp/classpath-jarfiles)
       (map cp/filenames-in-jar)
       flatten
       (filter is-plugin-properties-file?)
       (map read-plugin-def)))
