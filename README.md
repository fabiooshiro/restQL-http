[![Build Status](https://travis-ci.org/B2W-BIT/restQL-server.svg?branch=master)](https://travis-ci.org/B2W-BIT/restQL-server)

restQL-server is a server to run restQL queries, making easy to fetch information from multiple services in the most efficient manner. e.g:

```
from search
    with
        role = "hero"

from hero as heroList
    with
        name = search.results.name
```

Useful links

* [restql.b2w.io](http://restql.b2w.io): Project home page,
* [game.b2w.io](http://game.b2w.io): A game developed to teach the basics of restQL language,
* [restQL-core](https://github.com/B2W-BIT/restQL-core): If you want to embed restQL directly into your Clojure application,
* [restQL-core-java](https://github.com/B2W-BIT/restQL-core): If you want to embed restQL directly into your Java application,
* [restQL-manager](https://github.com/B2W-BIT/restQL-manager): To manage saved queries and resources endpoints. restQL-manager requires a MongoDB instance.
* [Tackling microservice query complexity](https://medium.com/b2w-engineering/restql-tackling-microservice-query-complexity-27def5d09b40): Project motivation and history.
* [Wiki](https://github.com/B2W-BIT/restQL-server/wiki/RestQL-Query-Language): Project documentation.

If you need help or assistance, we've just created a Google Groups: https://groups.google.com/forum/#!forum/restql

# Getting Started

## Running restQL Server

restQL Server allows you to post ad-hoc queries and to reference resources pre-configured in the server startup.

1. Download the latest release in the [release page](https://github.com/B2W-BIT/restQL-server/releases),
2. Unzip the package,
3. Edit the file env.sh with the resources you want to invoke,
3. Run bin/run.sh.

Post to http://your-server.ip:9000/run-query the body below and content-type text/plain:

```
from planets as allPlanets
```

## Next steps

1. Learn restQL [query language](https://github.com/B2W-BIT/restQL-server/wiki/RestQL-Query-Language),
2. Learn about the [manager and saved queries](https://github.com/B2W-BIT/restQL-server/wiki/Manager-and-Saved-Queries),
3. Get involved :)

# Source and Docker

## Building From Source Code

As prerequisites to build restQL-server from source we need:

+ Java 8
+ Leiningen

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

The MongoDB dependency is optional and is used to run saved queries.

## License

Copyright © 2016-2017 B2W Digital

Distributed under the MIT License.
