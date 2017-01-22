CREATE EXTENSION postgis;

CREATE TABLE public.subscriptions
(
  subs_id character varying(255) NOT NULL ,
  id_name character varying(255),
  schema text,
  PRIMARY KEY (subs_id),
  UNIQUE(schema, subs_id)

)
WITH (
  OIDS=FALSE
);
ALTER TABLE public.subscriptions OWNER TO :owner;
