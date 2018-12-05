(ns restql.http.authorization
  (:require [environ.core :refer [env]]))

(defn get-env-key
  "Retrives an authorization key from env"
  []

  (:authorization-key env))

(defn is-authorized?
  "Checks if the key matches the env key"
  [key]
  
  (= (str key) (str (get-env-key))))