(ns restql.http.plugin.core
  (:require [restql.http.plugin.plugin-loader :as loader]
            [restql.hooks.core :as hooks]
            [clojure.tools.logging :as log]))

(defonce plugins (atom []))

(defn get-loaded-plugins
  "Gets all loaded custom plugins"
  []
  (deref plugins))

(defn- register-each [hook]
  (doseq [[hook-name hook-fns] hook]
    (hooks/register-hook hook-name hook-fns)))

(defn- register-plugins []
  (->> (deref plugins)
       (filter #(-> % :add-hooks nil? not))
       (map :add-hooks)
       (map (fn [hook] (hook)))
       (map register-each)
       (doall)))

(defn- log-loaded []
  (as-> (get-loaded-plugins) loadeds
    (if (>= (count loadeds) 1)
      (doseq [p loadeds]
        (log/info "Loaded plugin:" (:name p)))
      (log/info "No plugins to load"))))

(defn load!
  "Loads custom plugins"
  []
  (reset! plugins (loader/search-installed-plugins))
  (register-plugins)
  (log-loaded))
