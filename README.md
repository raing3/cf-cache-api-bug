# CF cache API put redirect with query bug

Reproduction steps:

1. Upload worker, add a worker route which uses the worker.
2. Invoke the worker via both the `.workers.dev` domain and the worker route.

Expected behaviour:

1. A request with a query string that caches a 301 response that redirects to a location with a query string can
   be retrieved from cache when accessed via both the `.workers.dev` domain and a worker route.

Actual behaviour:

1. A request with a query string that caches a 301 response that redirects to a location with a query string can
   be retrieved from cache when accessed via the `.workers.dev` domain, but is not retrievable when accessed via
   a worker route.

The behaviour difference can also be seen with the worker deployed here:

 * https://us.cloudflare-workers-harness.dev.dxp.squiz.cloud/__rainger/cf-cache-api
 * https://cache-test.squiz-test.workers.dev/
