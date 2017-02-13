#!/usr/bin/env bash

lein uberjar && cp target/uberjar/restql-server-standalone.jar dist/restql-server.jar
