(ns restql.http.plugin.core
  (:require [restql.http.plugin.plugin-loader :as loader]
            [restql.hooks.core :as hooks]))

(defonce plugins (atom []))

(defn load-plugins! []
  (reset! plugins (loader/search-installed-plugins))
)

(defn get-loaded-plugins []
  (deref plugins)
)

(defn register-each [hook]
  (doseq [[hook-name hook-fns] hook]
    (hooks/register-hook hook-name hook-fns)
  )
)

(defn register-plugins! []
  (->> (deref plugins)
       (filter #(-> % :add-hooks nil? not))
       (map :add-hooks)
       (map (fn [hook] (hook)))
       (map register-each)
       (doall))
)

(comment
  (load-plugins!)
  (get-loaded-plugins)
  (get-query-opts-with-plugins {}))
