restQL is a microservice query language that makes easy to fetch information from multiple services in the most efficient manner.

There is no need of any implementation server side, just configure the service endpoints, run restQL server and start querying.

Query example:

```restql
from hero as protagonist
    with
        name = "Restman"

from sidekick
    with
        hero = protagonist.id
    only
        skills
```

For more details about the query language see [Query Language wiki](https://github.com/B2W-BIT/restQL-server/wiki/RestQL-Query-Language).

## Getting Started

### Installation

You can download the latest binary release on the releases page, clone the repository and [build from source](#building-from-source-code) (requires Clojure) or build a Docker image and [run it as a container](#running-as-a-docker-container).

Java 8 is the only pre-requisite to run restQL-server, making it easy to run and deploy. You may also need MongoDB if you want to store queries and run them later.

### Configuration

In order to use it, you must provide the resources you want to map when starting the server. You can also provide an optional port argument (default running on port 9000).

For example, to map the planets resource from Star Wars API and use port 8080, you should start the server as follows:

```
java -jar -Dmongo-url=mongodb://localhost:27017/restql-server -Dport=8080 -Dplanets=http://swapi.co/api/planets/ restql-server-v1.0.0-standalone.jar
```

The optional configurations currently available are:

+ port: The port restQL-server will be using to run.
+ mongo-url: The MongoDB connection url to store the queries.
+ cache-ttl: The time, in milliseconds, a query string retrieved from the database will be cached.

For more information about resources see [the restQL-core configuration wiki](https://github.com/B2W-BIT/restQL-core/wiki/Configuration#resources).

## Running Queries

Once configured, you can run queries on the server you can send a POST HTTP request to `http://your-server.ip/run-query` with your query on the body.

Example POST Body:

```restql
from planets as allPlanets
```

For more details about the query language and structure see [Query Language wiki](https://github.com/B2W-BIT/restQL-server/wiki/RestQL-Query-Language).

## Building From Source Code

As prerequisites to build restQL-server from source we have:

+ Java 8
+ Node.js >= 6
+ Leiningen
+ MongoDB (To store and run saved queries)

Build the server using the build script: `scripts/build-dist.sh`. 

The building script will create a folder `dist` where you can configure your resources on the file `dist/bin/env.sh` and run the server using the script `dist/bin/run.sh`.

If you want to deploy restQL-server, copy the files under the generated `dist` folder and start the server using the start script above.

## Running as a Docker container

### Building Docker image
restQL-server can also be run as a Docker container.
First, from the root folder, build a Docker image with the command:
```shell
docker build -t restql-server-img .
```

### Running the container
Than run the image as a container with the command:
```shell
docker run -p 9000:9000 -e JAVA_OPTS="-Dmongo-url=mongodb://my-mongo-ip:27017/restql-server -Dplanets=http://swapi.co/api/planets/" restql-server-img
```

You can register your APIs as resources by passing them in `JAVA_OPTS` environment variable, as seen above.
The server default port is 9000 but it can be changed by passing the `PORT` environment variable with the desired port.

The MongoDB instance can also run from a container. If that's the case you can link to it and use its link name as the address:
```shell
docker run -p 27017-27017 --name mongo-docker mongo
docker run --link mongo-docker -p 9000:9000 -e JAVA_OPTS="-Dmongo-url=mongodb://mongo-docker:27017/restql-server -Dplanets=http://swapi.co/api/planets/" restql-server-img
```

## License

Copyright © 2016-2017 B2W Digital

Distributed under the MIT License.
