# URBO PGSQL connector

| Master | Staging | Dev |
|--------|---------|-----|
|[![Build Status](https://jenkins.geographica.gs/buildStatus/icon?job=urbo-connector/master)](https://jenkins.geographica.gs/job/urbo-connector/job/master/)|[![Build Status](https://jenkins.geographica.gs/buildStatus/icon?job=urbo-connector/staging)](https://jenkins.geographica.gs/job/urbo-connector/job/staging/)|[![Build Status](https://jenkins.geographica.gs/buildStatus/icon?job=urbo-connector/dev)](https://jenkins.geographica.gs/job/urbo-connector/job/dev/)|

This project is a connector between Fiware and PostgreSQL. It supports spatial features with PostGIS and CartoDB.

You choose which part of Fiware do you want to listen to, you specify how to map the information and you'll get this information ready on a PostgreSQL database. Furthermore, if you want to have great maps you can also have this information at CartoDB, it's up to you.

## How to use

It's your lucky day, we use Docker to deploy, also for development stages.

You need the following dependencies to run this project:
* Docker 18.02+: https://docs.docker.com/engine/installation/
* Docker-compose: https://docs.docker.com/compose

### 1. Prepare the database.

**The .sql scripts existing in the db directory in this repository are deprecated**. All the necessary scripts and Docker configurations are now located in the [Urbo API Repository](https://github.com/GeographicaGS/UrboCore-api). Check the [readme](https://github.com/GeographicaGS/UrboCore-api#setting-up-the-database) for more information on how to set up the Posgtres database.

### 2. Prepare your config file.

At this file you specify which part of fiware you want to listen to and how to map the info.

```
cp api/config.example.yml api/config.yml
```

Now, you can edit this file using your favourite text editor.

### 3. Run.

```
docker-compose up
```

## Development

### Considerations

The *docker-compose.override.yml* file defines containers with an alternative configuration for the API:
- Starts the Node server with the Inspector mode. This mode allows you to debug the API with your favourite IDE, text editor or Chromium-based web browser. The debug port (9229) will be bridged to your host, so you can debug the application as if you had an instance of the server running on your machine. The API will start with a breakpoint on the first line of code, you will need to connect to the debug process in order to continue with the execution.
- Publishes the connector container listening port in your host's 3005 port.
- By default the container will use an image with all the development dependencies installed.

### Notes for developers
The development configurations for the different containers required by the API are defined in the *docker-compose.override.yml* file. By default, docker-compose will override/merge the configuration existing in the *docker-compose.yml* file with the contents of the *.override.yml* file. This means that when you execute `docker-compose up` you will start the development environment by default. You can find more information about how docker-compose allows you to extend configurations [here](https://docs.docker.com/compose/extends/).

If you wish to change/update the configurations you can create a new _docker-compose.*.yml_ file, that file will be ignored by default by git, so you can create as many configurations as you wish.
In order to use these configs you will have to append to your docker-compose commands two `-f` flags. For example:
```
docker-compose -f docker-compose.yml -f docker-compose.example.yml up -d
```
This leads to more difficult to read commands, our recommendation is to create an alias in your shell, let's call it `dcp`:
```
alias dcp="docker-compose -f docker-compose.yml -f docker-compose.example.yml"
```
With this alias you can issue commands faster, the previous example ends up like this:
```
dcp up -d
```
Remember that you can still use other docker-compose commands with this shortcut: `dcp build`, `dcp down` ...

### License

URBO PGSQL connector is licensed under Affero General Public License (GPL) version 3.
