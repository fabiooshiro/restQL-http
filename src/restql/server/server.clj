(ns restql.server.server
  (:require [ring.adapter.jetty :as ring]
            [environ.core :refer [env]]
            [restql.core.log :refer [info]]
            [restql.server.async-handler :as a]))

(defonce server
  (atom nil))

(defn start!
  "Starts the server"
  ([] (start! 3000 30000))
  ([port timeout]
   (reset! server (ring/run-jetty #'a/app {:port port
                                           :async? true
                                           :async-timeout timeout}))))

(defn stop!
  "Stops the server"
  []

  (when-not (nil? @server)
    (@server :timeout 100)
    (reset! server nil)))

(comment
  (start! 3000 30000)
  (stop!))
