
BEGIN;
DELETE FROM dashboard_scopes WHERE id_scope='dgt';
DELETE FROM dashboard_scopesentities WHERE id_scope='dgt';
DELETE FROM dashboard_entities WHERE id_entity='dgt30.vehiculo';
DELETE FROM dashboard_categories WHERE id_category='traffic';
DELETE FROM dashboard_variables WHERE id_entity='dgt30.vehiculo';
COMMIT;
