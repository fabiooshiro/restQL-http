FROM clojure:lein-2.7.1

RUN apt-get update
RUN apt-get install -y zip
RUN apt-get install -y unzip

COPY . /opt/source
WORKDIR /opt/source

RUN ./scripts/build-dist.sh

RUN mkdir /opt/app
RUN cp restql-server.zip /opt/app
WORKDIR /opt/app
RUN unzip restql-server.zip
RUN rm restql-server.zip

RUN ls -lah

ENV PORT=9000
EXPOSE $PORT
ENTRYPOINT eval "exec bin/run.sh"
