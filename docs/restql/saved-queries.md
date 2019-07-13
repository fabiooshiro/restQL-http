# Saved Queries

restQL-http is able to save queries. On saving, restQL-http will generate an unique URL where you can execute your query with a simple `GET` call. You can also include parameters in your query and set them when running the query using URL query string or HTTP headers.

restQL-http works with a revision system. Once you save a query, it's immutable. If you save another query with the same queryId of an existing one, the server will not touch the previous query but rather it will create a new revision.

This is designed to avoid unaware impact in production system and to optimize caching.

To save queries access restQL-manager. The default port is 3000: http://my-ip:3000.

## Saved queries format

Saved queries are regular restQL queries that can be parametrized. You can set params values when running the query.

The following examples show how to assign both query parameters and header parameters.

```
from cards as cards
    headers
        Page-Size = $pagesize
    with
        type = $type
```

Where you can populate the variables using:

+ `$pagesize`: sending the request to the server with the header `pagesize`
+ `$type`: sending the request to the server with a query parameter type, e.g. `GET http://localhost:9000/run-query/foo/cardsByType/1?type=Artifact`

You can also repeat the type parameter in the URL, this will produce a list, and tell restQL to execute the query N times. e.g.: `GET http://localhost:9000/run-query/foo/cardsByType/1?type=Artifact&type=Monster`

## URL Parameters

restQL also supports URL parameters. To use URL parameters save the resource URL and put a colon (:) before the parameter name.

*Resource configuration* 
cards=http://magic.com/cards/:cardId

*Query*
```
from cards
with cardId = $id
```
When running the query just pass id as a regular parameter. e.g.: `GET http://localhost:9000/run-query/foo/cardById/1?id=1234`.

If cardId is not present in the query, restQL will suppress the parameter in the URL. In the previous example the resource URL would become http://magic.com/cards/

## Creating new saved queries

You can create a saved query via editing the `restql.yml` file, which requires the restart of the application for the changes to take place

``` yml
mappings:
  your-resource: "http://your-resource-url.com"

queries:
  your-namespace:
    your-query:
      - |
        from your-resource
      - |
        use max-age=900
        from your-resource
  your-namespace-2:
    your-query:
      - |
        from your-resource
      - |
        use max-age=900
        from your-resource
```

It is also possible to save your queries in a MongoDB collection called `queries`, that shold look like that:
```json
{
    "namespace" : "heroes-league",
    "name" : "hero-and-sidekick",
    "revisions" : [ 
        {
            "text" : "from heroes\n with id = $id\n\n from sidekick"
        }, 
        {
            "text" : "from heroes\n with id = $heroId\n\n from sidekick\n with id = $sidekickId" 
        }
    ]
}
```

Where:
* `namespace` is the name of the namespace that contains a saved query
* `name` is the name of the saved query
* `revisions` is an array with the revisions of a saved query

When you save a query with the same name in the same namespace, a new **revision** is created. This allows multiple versions of the same query to be requested. This is also useful for documentation purposes, because you can see the changes made on each version of a saved query.

## Running queries

restQL works with a namespace concept. This allows you to organize your queries per subject or project for example.

The generated saved query URL format is: http://restqlServerIp:9000/run-query/namespace/query/revision, accessible using HTTP GET method.

e.g. GET http://localhost:9000/run-query/foo/galaxyPlanets/1

