(ns restql.server.server
  (:require [aleph.http :as http]
            [environ.core :refer [env]]
            [restql.core.log :refer [info]]
            [restql.server.async-handler :as a]))

(defonce server
  (atom nil))

(defn start!
  "Starts the server"
  ([] (start! 3000 30000))
  ([port timeout]
   (reset! server (http/start-server #'a/app {:port port}))))

(defn stop!
  "Stops the server"
  []

  (when-not (nil? @server)
    (@server :timeout 100)
    (reset! server nil)))

(comment
  (start! 3000 30000)
  (stop!))
