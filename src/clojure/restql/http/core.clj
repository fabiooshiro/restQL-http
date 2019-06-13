(ns restql.http.core
  (:require [restql.http.server.core :as server]
            [restql.http.plugin.core :as plugin]
            [restql.http.database.persistence :as db]
            [restql.config.core :as config]
            [clojure.tools.logging :as log]
            [environ.core :refer [env]])
  (:gen-class))

(defn- from-env-or-defaut
  ([name]
   (from-env-or-defaut name nil))
  ([name default]
   (cond (contains? env name) (read-string (env name))
         (not (nil? default)) default
         :else nil)))

(defn -main
  "Runs the restQL-server"
  [& args]

  (log/info "Starting the amazing restQL Server!")

  (config/init! (:restql-config-file env))
  (db/connect!  (env :mongo-url))
  (plugin/load!)

  (server/start! {:port                    (from-env-or-defaut :port 9000)
                  :executor-utilization    (from-env-or-defaut :executor-utilization 0.5)
                  :executor-max-threads    (from-env-or-defaut :executor-max-threads 512)
                  :executor-control-period (from-env-or-defaut :executor-control-period 1000)}))
