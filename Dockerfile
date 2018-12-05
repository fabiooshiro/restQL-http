FROM openjdk:8-alpine

RUN apk update
RUN apk upgrade
RUN apk add bash

RUN mkdir -p /usr/src/restql-http
ADD ./dist /usr/src/restql-http

WORKDIR /usr/src/restql-http

CMD ./bin/run.sh
