(ns restql.server.server
  (:require [org.httpkit.server :as server]
            [environ.core :refer [env]]
            [restql.core.log :refer [info]]
            [restql.server.async-handler :as a]))

(defonce server
  (atom nil))

(defn start!
  "Starts the server"
  ([] (start! 3000))
  ([port]
   (reset! server (server/run-server #'a/app {:port port}))))

(defn stop!
  "Stops the server"
  []

  (when-not (nil? @server)
    (@server :timeout 100)
    (reset! server nil)))

(comment
  (start! 3000)
  (stop!))
