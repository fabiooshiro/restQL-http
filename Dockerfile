FROM clojure:lein-2.7.1

RUN apt-get update
RUN apt-get install -y zip
RUN apt-get install -y unzip

RUN apt-get install -y curl
RUN curl -sL https://deb.nodesource.com/setup_7.x | bash
RUN apt-get install -y nodejs

COPY . /opt/source
WORKDIR /opt/source

RUN ./scripts/build-dist.sh

RUN mkdir /opt/app
RUN cp restql-server.zip /opt/app
WORKDIR /opt/app
RUN unzip restql-server.zip
RUN rm restql-server.zip

ENV PORT=9000
EXPOSE $PORT
ENTRYPOINT eval "exec bin/run.sh"
