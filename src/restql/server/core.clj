(ns restql.server.core
  (:require [restql.server.server :as server]
            [restql.server.plugin.core :as plugin]
            [clojure.tools.logging :as log]
            [restql.server.database.persistence :as db]
            [environ.core :refer [env]])
  (:gen-class))

(defn get-port
  "Gets a port to run the server api, or the default api port"
  [default]

  (if (contains? env :port) (read-string (env :port))  default))

(defn get-handler-timeout
  "Gets a timeout for server hanldlers, or the default timeout"
  [default]
  (if (contains? env :handler-timeout) (read-string (env :handler-timeout)) default))

(defn get-executor-utilization
  "Gets sizes the thread pool according to target utilization, within `[0,1]`"
  [default]
  (if (contains? env :executor-utilization) (read-string (env :executor-utilization)) default))

(defn get-executor-max-threads
  "Gets sizes the thread pool according to target utilization, within `[0,1]`"
  [default]
  (if (contains? env :executor-max-threads) (read-string (env :executor-max-threads)) default))

(defn start-api?
  "Verifies if it should start the api"
  []

  (if (contains? env :run-api)
    (= "true" (:run-api env))
    true))

(defn display-loaded-plugins!
  "Prints the plugin information to the logger as info"
  []

  (doseq [p (plugin/get-loaded-plugins)]
    (log/info "Loaded: "(:name p))))

(defn connect-to-mongo []
  (if (:mongo-url env)
    (do
      (log/info "Connecting to MongoDB:" (:mongo-url env))
      (db/connect! (:mongo-url env))
    )
  )
)

(defn -main
  "Runs the restQL-server"
  [& args]

  (let [port (get-port 9000)
        handler-timeout (get-handler-timeout 30000)
        executor-utilization (get-executor-utilization 0.9)
        executor-max-threads (get-executor-max-threads 512)]
    (log/info "Starting the amazing restQL Server!")

    (connect-to-mongo)

    (log/info "Loading plugins")
    (plugin/load-plugins!)
    (display-loaded-plugins!)
    (when (start-api?)
      (log/info "Starting server")
      (server/start! {:port port
                      :timeout handler-timeout
                      :executor-utilization executor-utilization
                      :executor-max-threads executor-max-threads})
      (log/info "restQL Server running on port" port))))
