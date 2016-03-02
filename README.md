# Fiware dashboard

## Environment

### Development
#### First time

Build the images
```Bash
docker-compose -f docker-compose.dev.yml build
```
Install node packages on sources directory
```
docker run --rm -it -v $(pwd)/api:/usr/src/app fiwaredashboard_api npm install --no-bin-links
```

PostGIS
```
// 1. Create data container
docker create --name fiwaredashboard_pgdata -v /data debian /bin/true
// 2. Start the db
docker run --rm --name tmp_fiware_pgsql -it -e "POSTGRES_PASSWD=postgres" --volumes-from fiwaredashboard_pgdata geographica/postgis:postgresql-9.4.5-postgis-2.2.0-gdal-2.0.1-patched-es_ES
// 3. Create the database and execute the start scripts (Edit the file with you database name, user and password)
docker exec -i tmp_fiware_pgsql psql -U postgres < db/createdb.sql
// Do either 4.1 or 4.2
// 4.1 Create empty db 
docker exec -i tmp_fiware_pgsql psql -U postgres -d fiware < db/initial.sql
// 4.2 Import dabase dump
docker exec -i tmp_fiware_pgsql psql -U postgres -d fiware < <dumpfile.sql>
// 5. CTRL-C at terminal launched at point 2
```

#### Start
```
docker-compose -f docker-compose.dev.yml up
```
