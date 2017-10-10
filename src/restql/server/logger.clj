(ns restql.server.logger
  (:require [clojure.core.async :refer [go-loop go >! <! chan sliding-buffer]]
            [clojure.string :as string]
            [restql.core.log :as log]))

(defn generate-uuid!
  "Generates a random UUID"
  []

  (.toString (java.util.UUID/randomUUID)))

(def logger (chan (sliding-buffer 10000)))

(go-loop [{:keys [level data]} (<! logger)]
  (case level
    :info (log/info data)
    :warn (log/warn data)
    :error (log/error data)
    :debug (log/debug data))
  (recur (<! logger)))

(defn log [& texts]
  (go (>! logger {:level :info :data (string/join "" texts)})))

(defn info [& args]
  (go (>! logger {:level :info :data args})))

(defn warn [& args]
  (go (>! logger {:level :warn :data args})))

(defn error [& args]
  (go (>! logger {:level :error :data args})))

(defn debug [& args]
  (go (>! logger {:level :debug :data args})))