(ns restql.config.core
  (:require [clojure.java.io :as io]
            [yaml.core :as yaml]
            [clojure.tools.logging :as log]))

(defonce config-data (atom nil))

(defn- get-config-from-file
  [filename]
  (try
    (log/info "Getting configuration from" (str "resources/" filename))
    (-> filename
        (io/resource)
        (slurp)
        (yaml/parse-string :keywords true))
    (catch Exception e
      (do (log/error "Error getting configuration from file:" (str "resources/" filename) "error:" (.getMessage e))
          {}))))

(defn init!
  "Read the configuration yaml file from resources
  and store the parsed value into config-data"
  ([filename]
   (let [file (or filename "restql.yml")]
     (when (nil? @config-data)
       (reset! config-data (get-config-from-file file))))))

(defn get-config
  "Gets part or all config data"
  ([] @config-data)
  ([configPath]
    (get-in @config-data configPath)))
