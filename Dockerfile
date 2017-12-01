FROM clojure:lein-2.7.1-alpine

ENV PORT=9000
EXPOSE $PORT

WORKDIR /opt/source
COPY . /opt/source

RUN apk add --update -q --no-cache zip && \
    ./scripts/build-dist.sh && \
    mkdir -p /opt/app/ && \
    cp restql-server.zip /opt/app/ && \
    cd /opt/app/ && \
    unzip restql-server.zip && \
    rm restql-server.zip && \
    rm -rf /opt/source/ && \
    apk del --purge zip

WORKDIR /opt/app

ENTRYPOINT eval "exec bin/run.sh"
