(ns restql.http.server
  (:require [aleph.http :as http]
            [aleph.flow :as flow]
            [clojure.tools.logging :as log]
            [restql.http.async-handler :as a]
            [restql.hooks.core :as hooks])
  (:import [java.util EnumSet]
           [io.aleph.dirigiste Stats$Metric]))

(defonce server
  (atom nil))

(defn start!
  "Starts the server"
  ([] (start! {:port 3000}))
  ([{:keys [port
            executor-utilization
            executor-max-threads
            executor-control-period]}]
   (reset! server 
      (http/start-server
        #'a/app 
        {:port port
        :executor (flow/utilization-executor executor-utilization executor-max-threads
                    {:metrics (EnumSet/of Stats$Metric/UTILIZATION)
                     :control-period executor-control-period
                     :initial-thread-count (/ executor-max-threads 2)
                     :stats-callback #(hooks/execute-hook :stats-server-executor (assoc {} :stats %))})}))))

(defn stop!
  "Stops the server"
  []

  (when-not (nil? @server)
    (@server :timeout 100)
    (reset! server nil)))

(comment
  (start! 3000 30000)
  (stop!))
