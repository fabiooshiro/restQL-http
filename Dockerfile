from clojure:lein-2.7.1-alpine

ENV PORT=9000
EXPOSE $PORT

COPY . /opt/app
WORKDIR /opt/app

RUN lein uberjar \
  && mv ./target/uberjar/restql-server-standalone.jar ./ \
  && lein clean \
  && rm -rf ~/.m2

ENTRYPOINT eval "exec java $JAVA_OPTS -Dport=$PORT -jar restql-server-standalone.jar \"\$@\""
