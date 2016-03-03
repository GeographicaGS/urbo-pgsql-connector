CREATE USER fiware_admin with password 'fiware';
CREATE DATABASE fiware with owner fiware_admin;

CREATE EXTENSION postgis;
