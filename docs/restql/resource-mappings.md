# Resource Mappings

All resource that will be fetched should be mapped with `Environment` variable or `restql.yml` config or via [`restql-manager`](/restql/manager.md).

### Environment
`Environment` variables should be setted before run the `bin/run.sh` or Docker Image.

```sh
export LAUNCHES=https://api.spacexdata.com/v3/launches
./bin/run.sh
```
or inline
```sh
LAUNCHES=https://api.spacexdata.com/v3/launches ./bin/run.sh
```
or Docker run environment
```sh
docker run -e LAUNCHES=https://api.spacexdata.com/v3/launches b2wdigital/restql-http
```

### YML Config
By default restql-http server will try to find a `restql.yml` file on project root directory that should be configured as the example above.

```yml
mappings:
  launches: "https://api.spacexdata.com/v3/launches"
```

To use with the docker image you can mount a volume with your custom restql.yml file.

```
docker run -v $PWD/restql.yml:/usr/src/restql-http/restql.yml b2wdigital/restql-http
```

### Manager
Look at the [manager section](/restql/manager.md)

