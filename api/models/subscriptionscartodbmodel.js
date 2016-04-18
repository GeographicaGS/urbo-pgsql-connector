var util = require('util');
var CartoDBModel = require('./cartodbmodel.js');
var utils = require('./utils');
var _ = require('underscore');

var logParams = require('../config.js').getLogOpt();
var log = require('log4js').getLogger(logParams.output);

function SubscriptionsCartoDBModel(cfg) {
  CartoDBModel.call(this,cfg);
}

util.inherits(SubscriptionsCartoDBModel, CartoDBModel);

SubscriptionsCartoDBModel.prototype.createTable = function(sub,cb){

  var sql = ['SELECT count(*) as n FROM CDB_UserTables()',
             " WHERE cdb_usertables = '{{table}}'"];

  var that = this;
  this.query({
      'query': sql.join(' '),
      'params' : { 'table': sub.id}
    },function(err,data){

    if (err){
      log.error('Error getting table information');
      log.error(err);
      return cb(err,null)
    }

    if (!data.rows[0].n){
      var fields = ['id_entity varchar(64) not null'];
      for (var i=0;i<sub.attributes.length;i++){
        var attr = sub.attributes[i];
        if (attr.cartodb){
          var name;
          if (attr.type == 'coords')
            name = 'the_geom';
          else if ("namedb" in attr)
            name = attr.namedb;
          else
            name = attr.name;
          fields.push(utils.wrapStrings(name,['"']) + ' ' + utils.getPostgresType(attr.type));
        }
      }

      var tableName = that._enterprise ? utils.wrapStrings(that._user,['"']) + '.' + sub.id : sub.id;
      var cartodbfy = that._enterprise ?
            "SELECT CDB_Cartodbfytable('" +that._user + "','" + sub.id +"');"
            :
            "SELECT CDB_Cartodbfytable('" + sub.id +"');";

      var q = [
        'CREATE TABLE ' + tableName + ' (',
          fields.join(','),
          ");",
          cartodbfy,
          "ALTER TABLE "+sub.id + " ADD COLUMN created_at timestamp without time zone DEFAULT (now() at time zone 'utc');",
          "ALTER TABLE "+sub.id + " ADD COLUMN updated_at timestamp without time zone DEFAULT (now() at time zone 'utc');" ];

      that.query({ 'query' : q.join(' ') },function(err,data){
        if (err){
          log.error('Error saving table at CartoDB');
          log.error(err);
          cb(err);
        }
        else{
          cb();
        }
      });
    }
    else{
      // get table info. Apply alter table is needed. NEVER DROP COLUMNS except if config says it

      that.query({
        'query': "SELECT CDB_ColumnNames('{{table}}')",
        'params' : { 'table': sub.id }
      },function(err,data){
        if (err){
          log.error('Error getting fields information')
          return cb(err,null)
        }

        var current = _.pluck(data.rows,'cdb_columnnames');
        var attributes = _.filter(sub.attributes, function(attr){ return attr.cartodb && attr.type!='coords'; });
        var needed = _.map(attributes, function(at){return at.namedb || at.name;}).concat('cartodb_id','the_geom','the_geom_webmercator');
        var toadd = _.difference(needed,current);
        var toremove = _.difference(current,needed);

        if (toremove.length){
          // TODO: REMOVE element.
          log.debug('TOREMOVE CDB');
          log.debug(toremove);
        }

        // Add element
        if (toadd.length){
          var fields = [];
          for (var i=0;i<attributes.length;i++){
            var attr = attributes[i];
            if (toadd.indexOf(attr.name)!=-1){
              fields.push('ADD COLUMN ' + utils.wrapStrings(attr.name,['"']) + ' ' + utils.getPostgresType(attr.type));
            }
          }
          sql = 'ALTER TABLE ' + sub.id + ' ' + fields.join(',');
          that.query({query: sql},function(err,data){
            if (err){
              log.error('Error altering table ' + sub.id);
              return cb(err,null);
            }
            cb();
          });
        }
        else{
          cb();
        }
      });
    }
  });
}

SubscriptionsCartoDBModel.prototype.upsertSubscriptedData = function(sub, obj, objdq){
  /*
  Upsert SQL example:

  WITH upsert AS
      (
          UPDATE dev_agua
          SET id_entity='dispositivo_k01',
              value='18',
              timeinstant='2016-03-04T16:09:54.01',
              position=ST_SetSRID(ST_MakePoint(-4.45,37.09),4326),
              updated_at=now()
          WHERE cartodb_id=(SELECT MAX(cartodb_id) FROM dev_agua WHERE id_entity='dispositivo_k01')
          RETURNING *
      )
  INSERT INTO dev_agua (id_entity, value, timeinstant, position)
      SELECT 'dispositivo_k01' AS id_entity,
             '0.234' AS value,
             '2015-03-04T16:09:54.01' AS timeinstant,
             ST_SetSRID(ST_MakePoint(-4.45,37.09),4326) AS position,
             now() AS updated_at
      WHERE NOT EXISTS (SELECT * FROM upsert);
  */

  var sqpg = this._squel.useFlavour('postgres');

  var updtConstructor = sqpg.update().table(sub.id);
  var slConstructor = this._squel.select();

  for (var i in obj){
      updtConstructor.set(utils.wrapStrings(i,['"']),obj[i]);
      slConstructor.field(utils.wrapStrings(obj[i],["'"]),i);
  }
  for (var i in objdq){
      updtConstructor.set(utils.wrapStrings(i,['"']),objdq[i],{dontQuote: true});
      slConstructor.field(objdq[i],i,{dontQuote: true});
  }

  updtConstructor.set("updated_at","now()");
  slConstructor.field("now()","updated_at");

  var slMaxid = sqpg.select()
                  .field('MAX(cartodb_id)')
                  .from(sub.id)
                  .where("id_entity = ?",obj.id_entity)

  var udtQry = updtConstructor.where('cartodb_id = ?', slMaxid)
                .returning("*")
                .toString();

  var slUpsrt = this._squel.select().from("upsert");
  var slCon = slConstructor.from("").where("NOT EXISTS ?", slUpsrt);

  var dataKeys = _.keys(_.extend(obj, objdq));
  dataKeys.push("updated_at");
  dataKeys = _.map(dataKeys, function(dkey){return utils.wrapStrings(dkey,['"']);});

  var insQry = this._squel.insert()
                 .into(sub.id)
                 .fromQuery(dataKeys, slCon)
                 .toString();

  var sql = ["WITH upsert AS ",utils.wrapStrings(udtQry,["(",")"]),insQry]
  var q = sql.join(' ')
  this.query({ 'query' : q}, null, function(err, r){
    if (err)
      return log.error('Cannot execute upsert query - CartoDB');
  });
}

SubscriptionsCartoDBModel.prototype.storeData = function(sub,contextResponses){
  var valid_attrs = _.pluck(_.filter(sub.attributes, function(attr){ return attr.cartodb || attr.type=='coords';}),'name');

  for (var i=0;i<contextResponses.length;i++){
    var obj = {}, objdq = {};
    obj['id_entity'] = contextResponses[i].contextElement.id;

    _.each(contextResponses[i].contextElement.attributes,function(attr){
      var attrSub = _.findWhere(sub.attributes, {'name': attr.name});
      var attrName = "namedb" in attrSub ? attrSub.namedb : attr.name;
      var attrType = attrSub.type;
      if (valid_attrs.indexOf(attr.name)!=-1){
        var v = utils.getValueForType(attr.value,attrType);
        var name = attrType!='coords' ? attrName : 'the_geom';
        if (utils.isTypeQuoted(attrType))
          obj[name] = v;
        else
          objdq[name] = v;
      }
    });

    if ("mode" in sub && sub.mode == "update")
      this.upsertSubscriptedData(sub,obj,objdq);
    else
      this.insert(sub.id,obj,objdq);

  }
}

module.exports = SubscriptionsCartoDBModel;
