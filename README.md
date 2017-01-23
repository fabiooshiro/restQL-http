RestQL-server is a server to run restQL queries, making easy to fetch information from multiple services in the most efficient manner.

## Getting Started

### Installation

You can download the latest binary release on the releases page or clone the repository and build from source (requires clojure).

Java 8 is the only pre-requisite to run restQL-server, making it easy to run and deploy. 

### Configuration

In order to use it, you must provide the resources you want to map when starting the server. You can also provide an optional port argument (default running on port 8080).

For example, to map the planets resource from Star Wars API, you will start the server as follows:

```
java -jar -Dmongo-url=mongodb://localhost:27017/restql-server -Dport=9000 -Dplanets=http://swapi.co/api/planets/ restql-server-v1.0.0-standalone.jar
```

For more information about resources see [the restQL-core configuration wiki](https://github.com/B2W-BIT/restQL-core/wiki/Configuration#resources).

## Running Queries

Once configured, you can run queries on the server you can send a POST HTTP request to `http://your-server.ip/run-query` with your query on the body.

Example POST Body: 

```clojure
[:allPlanets {:from :planets}]
```

For more details about the query language and structure see [restQL-core Query Language wiki](https://github.com/B2W-BIT/restQL-core/wiki/Query-Language).

## Building From Source Code

As prerequisites to build restQL-server from source we have:

+ Java 8
+ Leiningen
+ MongoDB (To store and run saved queries)

To run the server using Leinigen: `lein run`

To build the server as a deployable standalone: `lein uberjar` (will generate `restql-server-v1-standalone.jar` under `target/uberjar`)

## License

Copyright © 2016-2017 B2W Digital

Distributed under the MIT License.