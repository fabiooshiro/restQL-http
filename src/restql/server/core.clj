(ns restql.server.core
  (:require [restql.server.server :as server]
            [restql.server.plugin.core :as plugin]
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

(defn start-api? []
  (if (contains? env :run-api)
    (= "true" (:run-api env))
    true))

(defn start-manager? []
  (if (contains? env :run-manager)
    (= "true" (:run-manager env))
    true))

(defn display-loaded-plugins! []
  (doseq [p (plugin/get-loaded-plugins)]
    (info "Loaded: "(:name p))))

(defn -main
  [& args]
  (let [port (get-port 9000)
        manager-port (get-manager-port 9001)]
    (info "Starting the amazing restQL Server!")
    (info "Connecting to MongoDB:" (:mongo-url env))
    (db/connect! (:mongo-url env))
    (info "Loading plugins")
    (plugin/load-plugins!)
    (display-loaded-plugins!)
    (when (start-api?)
      (info "Starting server")
      (server/start! port)
      (info "restQL Server running on port" port))
    (when (start-manager?)
      (info "Starting manager")
      (manager/start! manager-port)
      (info "restQL Query Manager running on port" manager-port))))
