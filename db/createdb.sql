--CREATE USER fiware_admin with password :password;
CREATE USER :owner with password :'password';
CREATE DATABASE :dbname with owner :owner;
