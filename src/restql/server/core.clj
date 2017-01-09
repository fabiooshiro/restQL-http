(ns restql.server.core
  (:require [restql.server.server :as server]
            [restql.core.log :refer [info]]
            [environ.core :refer [env]])
  (:gen-class))

(defn get-port
  [default]
  (if (contains? env :port) (read-string (env :port))  default))

(defn -main
  [& args]
  (let [port (get-port 8080)]
  (info "Starting the amazing restQL Server!")
  (server/start! port)
  (info "restQL Server running on port" port)))
