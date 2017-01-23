(ns restql.server.database.persistence
  (:require [monger.core :as mg]
            [monger.collection :as mc]
            [monger.operators :refer [$inc $push $slice]]
            [slingshot.slingshot :refer [throw+]]))

(defonce conn-data (atom nil))

(defn connect! [uri]
  (when (nil? @conn-data)
  (reset! conn-data (mg/connect-via-uri uri))))

(defn disconnect! []
  (when-not (nil? @conn-data)
    (mg/disconnect (:conn @conn-data))
    (reset! conn-data nil)))

(defn check-conn! []
  (when (nil? (:db @conn-data))
    (throw+ {:type :db-not-connected})))

(defmacro defquery [qname args & body]
  (let [[fargs _ [dbarg]] (->> args (partition-by #{:with}))]
    `(defn ~qname ~(into [] fargs)
       (let [~dbarg (:db @conn-data)]
       (check-conn!)
       ~@body))))

(defquery save-query [id query :with db]
  (mc/find-and-modify db "query"
                      {:_id id}
                      {$inc {:size 1}
                       $push {:revisions query}}
                      {:return-new true
                       :upsert true
                       :fields {:size true}}))

(defquery find-query [id revision :with db]
  (let [res (mc/find-map-by-id db "query" id {:_id 0 :size 0 :revisions {$slice [(dec revision) 1]}})
        text (-> res :revisions first)]
    text))

(defquery count-query-revisions [id :with db]
  (let [res (mc/find-map-by-id db "query" id {:_id 0 :revisions 0})]
    (if (nil? res)
      0
      (:size res))))

(defquery find-all-queries[{} :with db]
  (let [res (mc/find-maps db "query")]
    (map
      (fn [q]
        {:id (:_id q)
         :size (:size q)} )
      res)))

(comment
  (connect! "mongodb://localhost:27017/pdgquery"))
