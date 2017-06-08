FROM clojure:lein-2.7.1-alpine

ENV PORT=9000
EXPOSE $PORT

RUN apk add --update zip curl nodejs

WORKDIR /opt/source
COPY . /opt/source

RUN ./scripts/build-dist.sh && \
    mkdir -p /opt/app/ && \
    cp restql-server.zip /opt/app/ && \
    cd /opt/app/ && \
    unzip restql-server.zip && \
    rm restql-server.zip && \
    rm -rf /opt/source/

WORKDIR /opt/app

ENTRYPOINT eval "exec bin/run.sh"
