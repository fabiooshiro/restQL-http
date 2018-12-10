(ns restql.http.request.queries-test
  (:require [clojure.test :refer :all]
            [restql.config.core :as config])
  (:use restql.http.request.queries)
)

(deftest get-query-from-config-test
  (testing "Is getting from config data"
    (reset! config/config-data {:queries {:my-namespace {:my-query ["my query version 1" "my query version 2"]}}})
    (is
      (= "my query version 1"
         (get-query-from-config "my-namespace" "my-query" 1)
      )
    )
    (is
      (= "my query version 2"
         (get-query-from-config "my-namespace" "my-query" 2)
      )
    )
    (reset! config/config-data nil)
  )
)