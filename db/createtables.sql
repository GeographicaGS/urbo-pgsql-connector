CREATE EXTENSION postgis;

CREATE TABLE public.subscriptions
(
  subs_id character varying(255) NOT NULL,
  id_name character varying(255),
  CONSTRAINT pk PRIMARY KEY (subs_id)
)
WITH (
  OIDS=FALSE
);
ALTER TABLE public.subscriptions
  OWNER TO fiware_admin;
