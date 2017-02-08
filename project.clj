(defproject restql-server "v1.2.0" :description "RestQL Server"
  :url "http://example.com/FIXME"
  :license {:name "Eclipse Public License"
            :url "http://www.eclipse.org/legal/epl-v10.html"}
  :dependencies [[org.clojure/clojure "1.7.0"]
                 [http-kit "2.1.18"]
                 [compojure "1.4.0"]
                 [org.clojure/data.json "0.2.6"]
                 [com.taoensso/timbre "4.1.4"]
                 [environ "1.0.0"]
                 [prismatic/schema "1.1.2"]
                 [expectations "2.0.9"]
                 [http-kit.fake "0.2.1"]
                 [slingshot "0.12.2"]
                 [org.clojure/core.async "0.2.395"]
                 [cheshire "5.5.0"]
                 [ring/ring-json "0.4.0"]
                 [com.novemberain/monger "3.0.2"]
                 [com.b2wdigital/restql-core "0.4.0"]
                 [commons-validator "1.5.1"]]
  :plugins [[lein-expectations "0.0.8"]
            [lein-autoexpect "1.4.0"]
            [lein-environ "1.0.0"]
            [single-file-lein-zip "0.1.0"]]
  :main ^:skip-aot restql.server.core
  :target-path "target/%s"
  :zip ["Dockerfile" {:file-name "restql-server-standalone.jar" :file-folder "target/uberjar"}]
  :uberjar-name "restql-server-standalone.jar"
  :profiles {
    :uberjar {
      :aot :all
      :env {
        :port "9000"
        :manager-port "9001"
      }
    }
    :dev {
      :env {
        :port "9000"
        :manager-port "9001"
	      :cache-ttl "30000"
        :cards "http://api.magicthegathering.io/v1/cards"
        :mongo-url "mongodb://localhost:27017/restql-server"
      }
    }})
