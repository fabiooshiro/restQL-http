(ns restql.server.plugin.core
  (:require [restql.server.plugin.plugin-loader :as loader]))

(defonce plugins (atom []))

(defn load-plugins! []
  (reset! plugins (loader/search-installed-plugins)))

(defn get-loaded-plugins []
  (deref plugins))

(defn combine-hook [one other]
  (merge-with into one other))

(defn merge-hooks [target-query-opts query-opts]
  (-> target-query-opts
    (update-in [:clojure-hooks] combine-hook (:clojure-hooks query-opts))
    (update-in [:java-hooks] combine-hook (:java-hooks query-opts))))

(defn get-query-opts-with-plugins [query-opts]
  (let [plugins (deref plugins)
        plugins-with-hooks (filter #(-> % :add-hooks nil? not) plugins)
        plugin-hooks (map (fn [plugin] ((:add-hooks plugin))) plugins-with-hooks)
        plugin-query-opts (map (fn [hooks] {:clojure-hooks hooks}) plugin-hooks) ]
    (reduce merge-hooks query-opts plugin-query-opts)))

(comment
  (load-plugins!)
  (get-loaded-plugins)
  (get-query-opts-with-plugins {}))
