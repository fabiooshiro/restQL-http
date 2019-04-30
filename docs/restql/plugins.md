# Plugins

restQL-http has a plugin system that works by placing the respective jars into the plugins directory.

A plugin can register hooks into the restQL instance that runs inside the server, such as logging data or sending metrics to other systems.

To install a plugin all that needs to be done is to place the jar in the correct directory, and to uninstall it simply remove the respective jar.

## Developing a plugin

restQL-http plugins are mainly written in Clojure, and there is a leiningen template with all the required boilerplate ready to use. To start a new plugin project, run the following command:

`lein new restql-server-plugin YOUR_PLUGIN_NAME`

This template has a bunch of dependencies marked as provided, to avoid conflict with the restQL-http's own dependencies.

Inside the created project, there will be a file named `restQL-plugin.json` with the following content:

```json
{
  "name": "My Plugin",
  "namespace": "my.plugin.namespace"
}
```

This file will be scanned by restQL-http, and will serve as a guide on how to load the plugin. The `namespace` entry must have a module named `core`, that will contain the entry point for the plugin.

Look at the `core.clj` file, in the same folder:

```clojure
(ns test-plugin.core
  (:gen-class))

(defn check []
  "Checking that the hook was installed")

(defn before-query-hook [{:keys [query query-params]}]
  (println "THIS SHOULD RUN BEFORE A QUERY EXECUTES"))

(defn after-query-hook [{:keys [query result]}]
  (println "THIS SHOULD RUN AFTER A QUERY EXECUTES"))

(defn before-request-hook [{:keys [resource timeout url query-params headers]}]
  (println "THIS SHOULD RUN BEFORE A REQUEST EXECUTES"))

(defn after-request-hook [{:keys [status headers url timeout params response-time]}]
  (println "THIS SHOULD RUN AFTER A REQUEST EXECUTES"))

(defn add-hooks []
  {:before-query [before-query-hook]
   :after-query [after-query-hook]
   :before-request [before-request-hook]
   :after-request [after-request-hook]})
```

The functions that matter in this example are `check` and `add-hooks`. You can require other modules and use external libraries, but all of them must be accessed from these functions.

The `check` function returns only a string that will be displayed during load, just to be sure the plugin was successfully loaded.

The `add-hooks` function must return a map containing hook functions to be used by the restQL engine to perform requests. Each key must hold a vector with the hook functions, so it's possible to register multiple hooks for the same execution stage.

To build the plugin, just run `lein uberjar` and grab the jar in the `target` directory. To install it, just drop the built jar into the `plugins` directory of the restQL-http dist folder.