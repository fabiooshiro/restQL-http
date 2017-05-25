(ns restql.server.manager
  (:require [org.httpkit.server :as server]
            [environ.core :refer [env]]
            [restql.core.log :refer [info]]
            [restql.server.async-manager-handler :as am]))

(defonce server
         (atom nil))

(defn start!
  "Starts the manager"
  ([] (start! 3030))
  ([port]
   (reset! server (server/run-server #'am/app {:port port}))))

(defn stop!
  "Stops the manager"
  []

  (when-not (nil? @server)
    (@server :timeout 100)
    (reset! server nil)))

