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
  var schemaName = sub.schemaname;
  var schemaTable = schemaName+'_'+sub.id;
  var sql = ["SELECT count(*) as n FROM urbo_get_user_tables('"+this._user+"')",
             " WHERE urbo_get_user_tables = '{{table}}'"];

  var that = this;
  this.query({
      'query': sql.join(' '),
      'params' : { 'table': schemaTable}
    },function(err,data){

    if (err){
      log.error('Error getting table information');
      log.error(err);
      return cb(err,null)
    }

    if (!data.rows[0].n){
      var fields = ['id_entity varchar(64) not null'];
      var indexAttr = [];
      var jsonAttr = [];
      var subAttr = utils.parseLatLon(sub.attributes.slice());

      for (var i in subAttr){
        var attr = subAttr[i];
        if (attr.cartodb){
          var name;
          if (attr.type === 'coords' || attr.type.startsWith('geojson'))
            name = 'the_geom';
          else if ("namedb" in attr)
            name = attr.namedb;
          else
            name = attr.name;
          if (attr.indexdb && name != 'position'){
            if (attr.type == 'json')
              jsonAttr.push(name);
            else
              indexAttr.push(name);
          }
          fields.push(utils.wrapStrings(name,['"']) + ' ' + utils.getPostgresType(attr.type));
        }
      }

      var tableName = that._enterprise ? utils.wrapStrings(that._user,['"']) + '.' + schemaTable : schemaTable;
      var cartodbfy = that._enterprise ?
            "SELECT CDB_Cartodbfytable('" +that._user + "','" + schemaTable +"');"
            :
            "SELECT CDB_Cartodbfytable('" + schemaTable +"');";

      var q = [
        'CREATE TABLE ' + tableName + ' (',
          fields.join(','),
          ");",
          cartodbfy,
          'ALTER TABLE '+tableName + " ADD COLUMN created_at timestamp without time zone DEFAULT (now() at time zone 'utc');",
          'ALTER TABLE '+tableName + " ADD COLUMN updated_at timestamp without time zone DEFAULT (now() at time zone 'utc');" ];

      that.query({ 'query' : q.join(' ') },function(err,data){
        if (err){
          log.error('Error saving table at CartoDB');
          log.error(err);
          cb(err);
        }
        else{
          log.info('Create table at CartoDB completed');

          if (jsonAttr.length > 0)
            that.createJSONIndexes(sub,jsonAttr);

          if (indexAttr.length > 0)
            that.createAttrIndexes(sub,indexAttr);

          cb();
        }
      });
    }
    else{
      // get table info. Apply alter table is needed. NEVER DROP COLUMNS except if config says it

      that.query({
        'query': "SELECT CDB_ColumnNames('{{table}}')",
        'params' : { 'table': schemaTable }
      },function(err,data){
        if (err){
          log.error('Error getting fields information')
          return cb(err,null)
        }
        var subAttr = utils.parseLatLon(sub.attributes.slice());

        var current = _.pluck(data.rows,'cdb_columnnames');
        var attributes = _.filter(subAttr, function(attr){ return attr.cartodb && attr.type!='coords' && !attr.type.startsWith('geojson'); });
        var needed = _.map(attributes, function(at){return at.namedb || at.name;}).concat('cartodb_id','the_geom','the_geom_webmercator');
        var toadd = _.difference(needed,current);
        var toremove = _.difference(current,needed);

        if (toremove.length){
          // TODO: REMOVE element.
          // log.debug('TOREMOVE CDB');
          // log.debug(toremove);
        }

        // Add element
        if (toadd.length){
          var fields = [];
          for (var i in attributes){
            var attr = attributes[i];
            if (toadd.indexOf(attr.name)!=-1){
              fields.push('ADD COLUMN ' + utils.wrapStrings(attr.name,['"']) + ' ' + utils.getPostgresType(attr.type));
            }
          }
          sql = 'ALTER TABLE ' + schemaTable + ' ' + fields.join(',');
          that.query({query: sql},function(err,data){
            if (err){
              log.error('Error altering table ' + schemaTable);
              return cb(err,null);
            }
            log.info('Updated table [%s] at CartoDB completed',sub.id);
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

SubscriptionsCartoDBModel.prototype.createJSONIndexes = function(sub, attribs){
  var q;
  for (var i=0;i<attribs.length;i++){
    q = ['CREATE INDEX',sub.id+'_'+attribs[i]+'_idx',
         'ON',sub.schemaname+'_'+sub.id,'USING gin('+utils.wrapStrings(attribs[i],['"'])+')'];

    this.query({ 'query' : q.join(' ')}, null, function(err, r){
      if (err){
        log.error('Cannot execute CartoDB JSON attribute index creation on table %s',sub.id)
      }
      log.info('Index created on table %s',sub.id)
    });
  }
}

SubscriptionsCartoDBModel.prototype.createAttrIndexes = function(sub, attribs){
  var q = [];
  var sq;
  for (var i=0;i<attribs.length;i++){
    sq = ['CREATE INDEX',sub.id+'_'+attribs[i]+'_idx',
         'ON',sub.schemaname+'_'+sub.id,'USING btree('+utils.wrapStrings(attribs[i],['"'])+');'];
    q.push(sq.join(' '));
  }

  this.query({ 'query' : q.join(' ')}, null, function(err, r){
    if (err){
      log.error('Cannot execute CartoDB attribute index creation on table %s',sub.id)
    }
    log.info('CartoDB index created on table %s',sub.id)
  });
}

SubscriptionsCartoDBModel.prototype.upsertSubscriptedData = function(table, obj, objdq){
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

  var updtConstructor = sqpg.update().table(table);
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
                  .from(table)
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
                 .into(table)
                 .fromQuery(dataKeys, slCon)
                 .toString();

  var sql = ["WITH upsert AS ",utils.wrapStrings(udtQry,["(",")"]),insQry]
  var q = sql.join(' ')
  this.query({ 'query' : q}, null, function(err, r){
    if (err)
      return log.error('Cannot execute upsert query for table [%s] - CartoDB',table);
  });
}

SubscriptionsCartoDBModel.prototype.storeData = function(sub,contextResponses){

  for (var i in contextResponses){
    var obj = {}, objdq = {};
    obj['id_entity'] = contextResponses[i].contextElement.id;

    var subAttr = sub.attributes.slice();
    var crAttr = contextResponses[i].contextElement.attributes.slice();
    if (_.find(subAttr,{namedb:'lat',type:'coords'}) && _.find(subAttr,{namedb:'lon',type:'coords'})){
      var lat_name = _.find(subAttr,{namedb:'lat'}).name;
      var lon_name = _.find(subAttr,{namedb:'lon'}).name;
      var lat = _.find(crAttr,{name: lat_name});
      var lon = _.find(crAttr,{name: lon_name});
      if (lat && lon){
        crAttr.push({
          name: 'position',
          type: 'coords',
          value: util.format('%s, %s',lat.value,lon.value)
        });
      }
      crAttr = _.without(crAttr,_.find(crAttr,{name:lat_name}),_.find(crAttr,{name:lon_name}));
      subAttr.push({name:'position',type:'coords',cartodb:true});
    }

    var valid_attrs = _.pluck(_.filter(subAttr, function(attr){ return attr.cartodb || attr.type=='coords' || attr.type.startsWith('geojson');}),'name');

    _.each(crAttr,function(attr){
      var attrSub = _.findWhere(subAttr, {'name': attr.name});
      if (attrSub){
        var attrName = "namedb" in attrSub ? attrSub.namedb : attr.name;
        var attrType = attrSub.type;
        if (valid_attrs.indexOf(attr.name)!=-1){
          var v = utils.getValueForType(attr.value,attrType);
          var name = (attrType !== 'coords' && !attrType.startsWith('geojson')) ? attrName : 'the_geom';
          if (utils.isTypeQuoted(attrType))
            obj[name] = v;
          else
            objdq[name] = v;
        }
      }
    });

    var schemaName = sub.schemaname;
    var schemaTable = schemaName+'_'+sub.id;

    if ("mode" in sub && sub.mode == "update")
      this.upsertSubscriptedData(schemaTable,obj,objdq);
    else
      this.insert(schemaTable,obj,objdq);

  }
}

module.exports = SubscriptionsCartoDBModel;
