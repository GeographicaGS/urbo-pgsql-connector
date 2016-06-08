# Fiware dashboard
This project is a connector between Fiware and PostgreSQL. It supports spatial features with PostGIS and CartoDB.

You choose which part of Fiware do you want to listen to, you specify how to map the information and you'll get this information ready on a PostgreSQL database. Furthermore, if you want to have great maps you can also have this information at CartoDB, it's up to you.

## How to use

It's your lucky day, we use Docker to deploy (also for development stages).

You need the following dependencies to run this project:
* Docker: https://docs.docker.com/engine/installation/
* Docker-compose: https://docs.docker.com/compose


### 1. Prepare the database.
```
// Create data container
docker create --name fiwaredashboard_pgdata -v /data debian /bin/true
// Start the db
docker-compose up -d postgis
// Create the database and execute the start scripts, for connector
docker-compose exec -T  postgis psql -U postgres -f /usr/src/db/all.sql
```

### 2. Prepare your config file.

At this file you specify which part of fiware you want to listen to and how to map the info.

```
cp api/config.sample.yml api/config.yml
```

Now, you can edit this file using your favourite text editor.

### 3. Run.

```
docker-compose up
```

## Development

###Create an alias to docker-compose
Let's call it dcp
```
echo "alias dcp='docker-compose -f docker-compose.dev.yml'" >> ~/.bash_profile
source ~/.bash_profile
```

### First time

Install node packages on sources directory
```
dcp run api  npm install
```

Database
```
// Create data container
docker create --name fiwaredashboard_pgdata -v /data debian /bin/true
// Start the db
dcp up -d postgis
// Create the database and execute the start scripts, for connector
dcp exec -T  postgis psql -U postgres -f /usr/src/db/all.sql
```

Config file. Copy from sample and fill with your config
```
cp api/config.sample.yml api/config.yml

```

### Start
```
dcp up
```
