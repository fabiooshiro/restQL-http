(ns restql.server.response-test
  (:require [clojure.test :refer :all]
            [restql.server.response :refer :all]
            [clojure.data.json :as json]))

(defn get-sample-response []
  {:jedis {:details {:headers {:x-type "Jedi"
                               :x-weapon "Light Saber"}}
           :result {:id 1
                    :name "Luke Skywalker"
                    :weaponId 2}}})

(defn get-sample-response-as-string []
  (json/write-str (get-sample-response)))


(deftest should-map-all-headers-to-aliases
  (is (=
        [{:jedis {:x-type "Jedi"
                 :x-weapon "Light Saber"}}]
        (map map-headers-to-aliases (get-sample-response)))))

(deftest should-parse-if-query-response-is-map
  (is (= {:jedis {:x-type "Jedi"
                  :x-weapon "Light Saber"}}
         (get-response-headers (get-sample-response)))))

(deftest should-filter-only-x-headers
  (is (=
        {:x-type "Jedi"}
        (into
          {}
          (filter is-x-preffixed-header? {:content-type "application/json"
                                        :x-type "Jedi"})))))


(deftest test-keyword-suffixing
  (is (= :x-test-hero (suffixed-keyword :x-test "-" :hero))))


(deftest should-return-only-headers
  (is (=
        {:jedis {:x-type "Jedi"
                 :x-weapon "Light Saber"}}
        (get-response-headers (get-sample-response)))))


(deftest should-return-keywordized-key-value-header
  (is (=
        {:x-type-jedis "Jedi"
         :x-weapon-jedis "Light Saber"}
        (get-alias-suffixed-headers (->
                               (get-sample-response)
                               (get-response-headers))))))

(deftest should-return-alias-suffixed-headers
  (is (=
        {:x-type-jedis "Jedi"
         :x-weapon-jedis "Light Saber"}
        (extract-alias-suffixed-headers (get-sample-response-as-string)))))
