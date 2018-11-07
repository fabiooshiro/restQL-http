(defproject restql-server "v2.6.0-SNAPSHOT" :description "restQL Server"
  :url "http://example.com/FIXME"
  :license {:name "Eclipse Public License"
            :url  "http://restql.b2w.io"}
  :dependencies [[org.clojure/clojure "1.8.0"]
                 [b2wdigital/restql-core "2.6.1-SNAPSHOT"]
                 [aleph "0.4.6"]
                 [compojure "1.6.1"]
                 [environ "1.0.0"]
                 [prismatic/schema "1.1.2"]
                 [expectations "2.0.9"]
                 [slingshot "0.12.2"]
                 [cheshire "5.5.0"]
                 [org.clojure/core.async "0.2.395"]
                 [org.clojure/data.json "0.2.6"]
                 [com.fasterxml.jackson.core/jackson-core "2.8.5"]
                 [com.fasterxml.jackson.core/jackson-annotations "2.8.5"]
                 [com.fasterxml.jackson.core/jackson-databind "2.8.5"]
                 [org.clojure/java.classpath "0.2.3"]
                 [com.novemberain/monger "3.0.2"]
                 [prismatic/schema "1.1.6"]
                 [commons-validator "1.5.1"]
                 [org.clojure/tools.logging "0.4.0"]
                 [org.clojure/tools.reader "1.0.5"]]
  :plugins [[lein-expectations "0.0.8"]
            [lein-autoexpect "1.4.0"]
            [lein-environ "1.0.0"]
            [lein-ring "0.12.1"]
            [single-file-lein-zip "0.1.0"]]
  :main ^:skip-aot restql.server.core
  :target-path "target/%s"
  :resource-paths ["plugins/first.jar" "resources"]
  :zip ["Dockerfile" {:file-name "restql-server-standalone.jar" :file-folder "target/uberjar"}]
  :uberjar-name "restql-server-standalone.jar"
  :profiles {:uberjar {:aot :all
                       :env {:port      "9000"
                             :cache-ttl "30000"}}
             :dev     {:env     {:port      "9000"
                                 :cache-ttl "30000"
                                 :cards     "http://api.magicthegathering.io/v1/cards"
                                 :card      "http://api.magicthegathering.io/v1/cards/:id"
                                 :planets   "https://swapi.co/api/planets/:id"
                                 :mongo-url "mongodb://localhost:27017/restql-server"}
                       :plugins [[lein-cloverage "1.0.9"]]}})
