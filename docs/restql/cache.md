# Cache Control

One of restQL cornerstones is to keep HTTP semantics whenever that's possible. HTTP headers play a key role in current HTTP tools and servers, worth mentioning the `cache-control` header. 

Cache-control is a header returned in a HTTP call that tells the intermediate proxies and the end client on how to handle the cache of the returned content. For example: a `cache-control` header with `max-age=60` tells that the client can safely cache the request for 1 minute.

Consider a query fetching two resources:

```
from resourceA

from resourceB
```
 
What happens if **resourceA** returns `max-age=60`, and **resourceB** `max-age=30`?

To avoid stale data on the client restQL will return the least common configuration, i.e. the lowest value among them.

If one resource returns `no-cache`, that should have precedence over the max-age headers and no-cache should be the return of the query.

The `use` statement in the query has precedence over all headers. It can be used just like that:

```
use max-age=600

from heroes
```