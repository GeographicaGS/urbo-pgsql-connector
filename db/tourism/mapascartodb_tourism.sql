Mapa municipal

SELECT a.cartodb_id,a.id_entity, a."localityName", a.activities, b.the_geom, b.the_geom_webmercator  FROM "smart-admin".andalucia_activity_locality a inner join "smart-admin".municipios b on a.id_entity=b.cod_mun


SELECT a.cartodb_id,a.id_entity, a."localityName", a.demand, b.the_geom, b.the_geom_webmercator  FROM "smart-admin".andalucia_activity_locality a inner join "smart-admin".municipios b on a.id_entity=b.cod_mun

Mapa comarcal

SELECT sum(a.activities),c.cartodb_id, c.the_geom, c.the_geom_webmercator,c.zona, b.id_comarca  FROM "smart-admin".andalucia_activity_locality a inner join "smart-admin".municipios b on a.id_entity=b.cod_mun inner join "smart-admin".comarcas_pota c on b.id_comarca=c.cartodb_id::text
group by c.zona, b.id_comarca, c.the_geom, c.the_geom_webmercator, c.cartodb_id

SELECT sum(a.demand),c.cartodb_id, c.the_geom, c.the_geom_webmercator,c.zona, b.id_comarca  FROM "smart-admin".andalucia_activity_locality a inner join "smart-admin".municipios b on a.id_entity=b.cod_mun inner join "smart-admin".comarcas_pota c on b.id_comarca=c.cartodb_id::text
group by c.zona, b.id_comarca, c.the_geom, c.the_geom_webmercator, c.cartodb_id

Mapa provincial

SELECT b.cartodb_id,sum(a.activities),b.provincia, b.the_geom, b.the_geom_webmercator  FROM "smart-admin".andalucia_activity_locality a inner join "smart-admin".provincias b on substr(a.id_entity,1,2)=b.cod_prov
group by b.provincia, b.the_geom, b.the_geom_webmercator, b.cartodb_id

SELECT b.cartodb_id,sum(a.demand),b.provincia, b.the_geom, b.the_geom_webmercator  FROM "smart-admin".andalucia_activity_locality a inner join "smart-admin".provincias b on substr(a.id_entity,1,2)=b.cod_prov
group by b.provincia, b.the_geom, b.the_geom_webmercator, b.cartodb_id
