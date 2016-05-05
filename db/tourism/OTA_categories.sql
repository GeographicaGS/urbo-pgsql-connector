
-- SCOPE: Andalucia
--
-- Open Travel Alliance Categories
--

SET statement_timeout = 0;
SET lock_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SET check_function_bodies = false;
SET client_min_messages = warning;
SET search_path = public, pg_catalog;
SET default_tablespace = '';
SET default_with_oids = false;


BEGIN;
--
-- Open Travel Alliance Categories TABLE
--
CREATE TABLE andalucia.ota_categories
(
  ota_cats character varying(255) NOT NULL,
  types jsonb,
  CONSTRAINT ota_cats_pkey PRIMARY KEY (ota_cats)
)
WITH (
  OIDS=FALSE
);
ALTER TABLE andalucia.ota_categories
  OWNER TO fiware_admin;

--
-- Open Travel Alliance Categories DATA
--
INSERT INTO andalucia.ota_categories
SELECT * FROM json_to_recordset('[{"code":"Cultural","types":["Archeology","Architecture","Art","Jazz","Museums","Theater","Concert","Cultural","Historical","Music","Photography","Sightseeing"]},{"code":"EcoAdventure","types":["Agriculture","Ecology","Garden","Farmstays","Guided_Land","Submersible_Scooter"]},{"code":"Educational","types":["Educational","Astronomy","Spiritual","Holistic","Research"]},{"code":"GuidedTour","types":["Cave_Tours","Combination_Tours","Underwater_Reef_Tours","Sunrise_Tours","Segway_Tours"]},{"code":"Nature","types":["Bird_watching","Amphibious","Aquariums","Camping","Whale_Watching","Volcano","Turtle_Watching","Dolphins","Hiking","Manta_Ray_Snorkel","Nature","Parks","Rainforest","Safari","Scuba/Snorkeling"]},{"code":"SportsAndRecreation","types":["Banana_Boat","Bicycling","Boogie_Boarding","Bumper_Tubing","Canoeing","Canyoneering","Climbing","Cross_Country","Diving","Equestrian","Fishing","Golf","Golf_Golf_Courses","Hang_Gliding","Hiking","Horseback","Hula_Dancing","Jet_Skiing","Kayaking","Marathon","Motorcycling","Mountaineering","Paragliding","Parasailing","Pilgrimage","Scuba/Snorkeling","Skate_Park","Skiing","Snowboarding","Snowmobile","Spa_and_Gym","Speed_Boating","Sphere_Riding","Sport_Fishing","Sporting_Clays","StandUp_Paddle_Boarding","Train","Trekking","Underwater_Reef_Tours","Wakeboarding","Walking","Water_Skiing","Windsurfing"]},{"code":"FoodAndBeverage","types":["Restaurants","Food","Gourmet","Guided_Restaurant","Wine","Culinary","Restaurant_Tours"]},{"code":"Free","types":["Free"]},{"code":"Adventure","types":["Adventure","Ballooning","All_Terrain_Vehicle","Bumper_Tubing","Canyoneering","Climbing","Hang_Gliding","Helicopter","War","Submarine","Storm_Chasing","Space","Dog_Sledding","Flightseeing","GlassBottom_Viewing","High_Performance_Jet_Boat","Jet_Skiing","Lava_Tour","Rafting"]},{"code":"Theater","types":["Theater"]},{"code":"Walking","types":["Walking","Trekking"]},{"code":"Historical","types":["Historical"]},{"code":"Museums","types":["Museums"]},{"code":"Show","types":["Show"]},{"code":"Golf","types":["Golf","Golf_Golf_Courses"]},{"code":"Accessible","types":["Disabled"]},{"code":"EscortedTour","types":["Island_Day_Trip"]},{"code":"Family","types":["Attractions","Homestays","Water_Park","Zoo","Youth_Activities","Vacation_Portraits"]},{"code":"Group","types":["Surfing_Camps","Comedy_Club","Luau","Mancation","Meetings"]},{"code":"Independent","types":["Single"]},{"code":"Romantic","types":["Weddings","Sunset_Dinner","Honeymoon","Spa_and_Gym"]},{"code":"Beach","types":["Beach","Boating/Boat_Tour","Boogie_Boarding","Yacht_Charters"]},{"code":"MotorSports","types":["Motorcycling"]},{"code":"WaterSports","types":["Wakeboarding","Bareboat","Canoeing","Windsurfing","Water_Skiing","Speed_Boating","StandUp_Paddle_Boarding","Kayaking","Sailing"]},{"code":"SnowSports","types":["Skiing","Snowboarding","Snowmobile"]},{"code":"WheeledSports","types":["Bicycling","Skate_Park"]},{"code":"Fishing","types":["Sport_Fishing","Fishing"]},{"code":"OtherSports","types":["Sporting_Clays"]},{"code":"MountainSports","types":["Mountaineering"]},{"code":"AirSports","types":["Paragliding","Parasailing"]},{"code":"Underwater","types":["Snuba","Diving","Scuba_Lessons"]},{"code":"OnAnimals","types":["Equestrian","Horseback"]},{"code":"OnFoot","types":["Marathon","Cross_Country"]},{"code":"Travelling","types":["Airline_Airplane","Barges","Train","Transportation","Ferries","Freighters","Cruise","Inter_Island_Transportation","Motorcoach","Pilgrimage","Railroad_or_Trams"]},{"code":"Other_","types":["Audio","Clothing_Optional","Shopping","Volunteering","Dude_Ranch","Eclipse","Free","Ghost","Executive_Board","Lei_Greeters","Night_Life","Religious","Rental_Equipment","Show","Other_"]}]')
  as x(code text, types jsonb);


--
-- OTA categories aggregated TABLE
--
CREATE TABLE andalucia.ota_cat_agg
(
  id_otacat_agg character varying(255) NOT NULL,
  otacat_agg_name character varying(255),
  ota_cats jsonb,
  colour character varying(10),
  CONSTRAINT id_otacat_agg_pkey PRIMARY KEY (id_otacat_agg)
)
WITH (
  OIDS=FALSE
);
ALTER TABLE andalucia.ota_cat_agg
  OWNER TO fiware_admin;

--
-- OTA categories aggregated DATA
--
COPY andalucia.ota_cat_agg (id_otacat_agg, otacat_agg_name, ota_cats, colour) FROM stdin;
culture	Cultural	["Cultural","Educational","Theater","Historical","Museums"]	f69e37
sports	Deportes	["SportsAndRecreation","Golf","MotorSports","WaterSports","SnowSports","OtherSports","MountainSports","AirSports","Underwater","OnFoot"]	00addf
nature	Naturaleza y aire libre	["EcoAdventure","Nature","Adventure","Walking","EscortedTour","Beach","Fishing","OnAnimals"]	3eba94
leisure	Ocio	["GuidedTour","FoodAndBeverage","Show","Family","Group","Independent","Romantic"]	fa606f
others	Otros	["Free","Accessible","Other_"]	9966cc
transports	Transportes	["Travelling"]	3c71db
\.
COMMIT;
