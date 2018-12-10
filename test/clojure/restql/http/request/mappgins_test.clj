(ns restql.http.request.mappgins-test
  (:require [clojure.test :refer :all]
            [restql.config.core :as config])
  (:use restql.http.request.mappings)
)

(deftest get-mappings-from-config-test
  (testing "Is getting from config data"
    (reset! config/config-data {:mappings {:test "test.com"}})
    (is
      (= {:test "test.com"}
         (get-mappings-from-config)
      )
    )
    (reset! config/config-data nil)
  )
)