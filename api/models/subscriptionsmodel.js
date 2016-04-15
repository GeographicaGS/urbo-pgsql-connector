var util = require('util');
var PGSQLModel = require('./pgsqlmodel.js');
var utils = require('./utils');
var _ = require('underscore');

var logParams = require('../config.js').getLogOpt();
var log = require('log4js').getLogger(logParams.output);

function SubscriptionsModel(cfg) {
  PGSQLModel.call(this,cfg);
}

util.inherits(SubscriptionsModel, PGSQLModel);

SubscriptionsModel.prototype.createTable = function(sub,cb){

  var sql = ['SELECT * FROM information_schema.tables',
       " WHERE table_schema = 'public' AND table_name = $1"]

  var that = this;
  this.query(sql.join(' '),[sub.id],function(err,data){
    if (err){
      log.error('Error getting table information')
      return cb(err,null)
    }
    if (!data.rows.length){
      var fields = [];
      for (var i=0;i<sub.attributes.length;i++){
        var attr = sub.attributes[i];
        fields.push(utils.wrapStrings(attr.name,['"']) + ' ' + utils.getPostgresType(attr.type));
      }

      var q = [
        'CREATE TABLE ' + sub.id + ' ( id bigserial  CONSTRAINT ' + sub.id + '_pk PRIMARY KEY,',
          fields.join(','),
          ",id_entity varchar(64) not null",
          ",created_at timestamp without time zone DEFAULT (now() at time zone 'utc')",
          ",updated_at timestamp without time zone DEFAULT (now() at time zone 'utc')",
          ')'];

      that.query(q.join(' '),null,function(err,data){
        if (err)
          log.error(err);
        else
          cb();
      });
    }
    else{
      // get table info. Apply alter table is needed. NEVER DROP COLUMNS except if config says it
      // TODO: Create metadata table.
      sql = ['SELECT column_name, data_type, character_maximum_length',
              ' FROM INFORMATION_SCHEMA.COLUMNS WHERE table_name = $1'];

      that.query(sql.join(' '),[sub.id],function(err,data){
        if (err){
          log.error('Error getting fields information')
          return cb(err,null)
        }
        var current = _.pluck(data.rows,'column_name');
        var needed = _.pluck(sub.attributes,'name').concat('id','created_at','updated_at','id_entity');
        var toadd = _.difference(needed,current);
        var toremove = _.difference(current,needed);

        if (toremove.length){
          // TODO: REMOVE element.
          log.debug('TOREMOVE');
          log.debug(toremove);
        }

        // Add element
        if (toadd.length){
          var fields = [];
          for (var i=0;i<sub.attributes.length;i++){
            var attr = sub.attributes[i];
            if (toadd.indexOf(attr.name)!=-1){
              fields.push('ADD COLUMN ' + utils.wrapStrings(attr.name,['"']) + ' ' + utils.getPostgresType(attr.type));
            }
          }
          sql = 'ALTER TABLE ' + sub.id + ' ' + fields.join(',');

          that.query(sql,null,function(err,data){
            if (err){
              log.error('Error altering table ' + sub.id);
              return cb(err,null)
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

SubscriptionsModel.prototype.queryData = function(sql,bindings,cb){
  this.query(sql,bindings,cb);
}

SubscriptionsModel.prototype.getSubscription = function(id,cb){
  var q = 'SELECT subs_id FROM subscriptions WHERE id_name=$1';

  this.query(q,[id],function(err,d){
    if (err){
      log.error('Cannot execute sql query');
      cb(err);
    }
    else if (!d.rows.length){
      cb(null,null);
    }
    else{
      cb(null,d.rows[0]);
    }
  });
}

SubscriptionsModel.prototype.handleSubscriptionsTable = function(data, cb){
  var table = 'subscriptions';
  var sql = 'SELECT COUNT(*) as n FROM subscriptions WHERE id_name=$1';

  var self = this;
  this.query(sql, [data.id_name], function(err, r){
    if (err)
      return log.error('Cannot execute sql query');

    if (!r.rows[0].n == '0') {
      self.insertBatch(table,[data],cb);
    }
    else{
      self.update(table,data,cb);
    }
  });
}

SubscriptionsModel.prototype.upsertSubscriptedData = function(sub, obj, objdq){
  /*
  Upsert SQL example:

  WITH upsert AS
      (
          UPDATE dev_agua
          SET id_entity='dispositivo_k01',
              value='18',
              timeinstant='2016-03-04T16:09:54.01',
              position=ST_SetSRID(ST_MakePoint(-4.45,37.09),4326)
          WHERE id=(SELECT MAX(id) FROM dev_agua WHERE id_entity='dispositivo_k01')
          RETURNING *
      )
  INSERT INTO dev_agua (id_entity, value, timeinstant, position)
      SELECT 'dispositivo_k01' AS id_entity,
             '0.234' AS value,
             '2015-03-04T16:09:54.01' AS timeinstant,
             ST_SetSRID(ST_MakePoint(-4.45,37.09),4326) AS position
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
                  .field('MAX(id)')
                  .from(sub.id)
                  .where("id_entity = ?",obj.id_entity)

  var udtQry = updtConstructor.where('id = ?', slMaxid)
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

  this.query(q, null, function(err, r){
    if (err)
      return log.error('Cannot execute upsert query: ' + q);
  });
}

SubscriptionsModel.prototype.storeData = function(sub,contextResponses){
  for (var i=0;i<contextResponses.length;i++){
    var obj = {}, objdq = {};
    obj['id_entity'] = contextResponses[i].contextElement.id;

    _.each(contextResponses[i].contextElement.attributes,function(attr){
      var attrType = _.findWhere(sub.attributes, {'name': attr.name}).type;
      var v = utils.getValueForType(attr.value, attrType);
      console.log(v);
      if (utils.isTypeQuoted(attrType))
        obj[attr.name] = v;
      else
        objdq[attr.name] = v;
    });

    if ("mode" in sub && sub.mode == "update")
      this.upsertSubscriptedData(sub,obj,objdq);
    else
      this.insert(sub.id,obj,objdq);

  }
}

module.exports = SubscriptionsModel;
