(ns restql.server.core
  (:require [restql.server.server :as server]
            [restql.server.manager :as manager]
            [restql.server.database.persistence :as db]
            [restql.core.log :refer [info]]
            [environ.core :refer [env]])
  (:gen-class))

(defn get-port
  [default]
  (if (contains? env :port) (read-string (env :port))  default))

(defn get-manager-port [default]
  (if (contains? env :manager-port) (read-string (env :manager-port)) default))

(defn -main
  [& args]
  (let [port (get-port 8080)
        manager-port (get-manager-port 8081)]
    (info "Starting the amazing restQL Server!")
    (info "Connecting to MongoDB:" (:mongo-url env))
    (db/connect! (:mongo-url env))
    (info "Starting server")
    (server/start! port)
    (info "restQL Server running on port" port)
    (info "Starting manager")
    (manager/start! manager-port)
    (info "restQL Query Manager running on port" manager-port)))
