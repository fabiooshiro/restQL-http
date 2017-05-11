(ns restql.server.database.persistence
  (:require [monger.core :as mg]
            [monger.collection :as mc]
            [monger.operators :refer [$inc $push $slice $group]]
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

(defquery find-tenant-by-id [id :with db]
          (mc/find-one-as-map db "tenant" {:_id id}))

(defquery find-tenants [{} :with db]
          (->> (mc/find-maps db "tenant" {}) (map :_id)))


(defquery list-namespaces [{} :with db]
  (let [namespaces (mc/aggregate db "query" [{$group {:_id "$namespace"}}])]
    namespaces))

(defquery save-query [query-ns id query :with db]
  (mc/find-and-modify db "query"
                      {:name id :namespace query-ns}
                      {$inc {:size 1}
                       $push {:revisions query}}
                      {:return-new true
                       :upsert true
                       :fields {:size true}}))

(defquery find-query [query-ns id revision :with db]
  (let [res (mc/find-one-as-map db "query" {:name id :namespace query-ns}
                                     {:_id 0 :size 0 :revisions {$slice [(dec revision) 1]}})
        text (-> res :revisions first)]
    text))

(defquery count-query-revisions [query-ns id :with db]
  (let [res (mc/find-one-as-map db "query" {:name id :namespace query-ns} {:name 0 :revisions 0})]
    (if (nil? res)
      0
      (:size res))))

(defquery find-all-queries-by-namespace [query-ns :with db]
  (let [res (mc/find-maps db "query" {:namespace query-ns})]
    (map
      (fn [q]
        {:id (:name q)
         :size (:size q)} )
      res)))

(comment
  (find-all-queries {})
  (connect! "mongodb://localhost:27017/pdgquery"))
