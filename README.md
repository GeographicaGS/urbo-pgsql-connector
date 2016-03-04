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
docker create --name fiwarepgsqlconetor_pgdata -v /data debian /bin/true
// Start the db
docker run --rm --name tmp_fiware_pgsql -it -e "POSTGRES_PASSWD=postgres" --volumes-from fiwarepgsqlconetor_pgdata geographica/postgis:postgresql-9.4.5-postgis-2.2.0-gdal-2.0.1-patched-es_ES
// Create the database and execute the start scripts (Edit the file db/createdb.sql with you database name, user and password)
docker exec -i tmp_fiware_pgsql psql -U postgres < db/createdb.sql
docker exec -i tmp_fiware_pgsql psql -U postgres < db/createtables.sql
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
### First time

Build the images
```Bash
docker-compose -f docker-compose.dev.yml build
```
Install node packages on sources directory
```
docker run --rm -it -v $(pwd)/api:/usr/src/app fiwarepgsqlconetor_api npm install --no-bin-links
```

PostGIS
```
// 1. Create data container
docker create --name fiwarepgsqlconetor_pgdata -v /data debian /bin/true
// 2. Start the db
docker run --rm --name tmp_fiware_pgsql -it -e "POSTGRES_PASSWD=postgres" --volumes-from fiwarepgsqlconetor_pgdata geographica/postgis:postgresql-9.4.5-postgis-2.2.0-gdal-2.0.1-patched-es_ES
// 3. Create the database and execute the start scripts (Edit the file with you database name, user and password)
docker exec -i tmp_fiware_pgsql psql -U postgres < db/createdb.sql
// Do either 4.1 or 4.2
// 4.1 Create empty db 
docker exec -i tmp_fiware_pgsql psql -U postgres -d fiware < db/initial.sql
// 4.2 Import dabase dump
docker exec -i tmp_fiware_pgsql psql -U postgres -d fiware < <dumpfile.sql>
// 5. CTRL-C at terminal launched at point 2
```

### Start
```
docker-compose -f docker-compose.dev.yml up
```