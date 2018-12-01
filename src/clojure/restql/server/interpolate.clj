(ns restql.server.interpolate
  (:require [clojure.string :as string]
            [schema.core :as s :refer [Keyword Str]]
            [environ.core :refer [env]]
            [clojure.tools.logging :as log]))

(s/defn replace-all :- Str [query :- Str
                            keyname :- Str
                            value :- Str]
  (string/replace query (str "$" keyname) value))

(s/defn interpolate :- Str [query :- Str
                            context :- {Keyword Str}]
  (reduce
    (fn [result key]
      (replace-all result (name key) (get context key))) query (keys context)))

