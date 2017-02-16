var config = require('../config.js');
var util = require('util');
var PGSQLModel = require('./pgsqlmodel.js');
var utils = require('./utils');
var _ = require('underscore');

var logParams = config.getLogOpt();
var log = require('log4js').getLogger(logParams.output);

function SubscriptionsModel(cfg) {
  PGSQLModel.call(this,cfg);
}

util.inherits(SubscriptionsModel, PGSQLModel);

SubscriptionsModel.prototype.createSchema = function(schema, cb){
  var sql = ['SELECT * FROM information_schema.schemata',
             'WHERE schema_name = $1']

  var that = this;
  this.query(sql.join(' '),[schema],function(err,data){
    if (err){
      log.error('Error getting database schema information')
      return cb(err,null);
    }
    if (!data.rows.length){
      var q = ['CREATE SCHEMA',schema,'AUTHORIZATION ' + that._cfg.user];
      that.query(q.join(' '),null,function(err,data){
        if (err){
          log.error('Error creating schema: '+schema+' Error: '+err);
          return cb(err,null);
        }
        log.info('Created database schema: '+schema);
        cb(null);
      });
    }
    else{
      log.info('Schema [%s] already exists: nothing is done', schema);
      cb(null);
    }
  });
  // cb();
}

SubscriptionsModel.prototype.createTable = function(sub,cb){

  var schemaName = sub.schemaname;

  var sql = ['SELECT * FROM information_schema.tables',
             "WHERE table_schema = $1 AND table_name = $2"];

  var that = this;
  this.query(sql.join(' '),[schemaName, sub.id],function(err,data){
    if (err){
      log.error('Error getting table information');
      return cb(err,null);
    }
    var geomIndex;
    var jsonAttr = [];
    var indexAttr = [];
    if (!data.rows.length){
      var fields = [];
      var subAttr = utils.parseLatLon(sub.attributes.slice());

      for (var i in subAttr){
        var attr = subAttr[i];
        var attrName = attr.namedb || attr.name;
        if (attrName == 'position')
          geomIndex = true;
        else if (attr.indexdb){
          if (attr.type == 'json')
            jsonAttr.push(attrName);
          else
            indexAttr.push(attrName);
        }
        fields.push(utils.wrapStrings(attrName,['"']) + ' ' + utils.getPostgresType(attr.type));
      }
      var q = [
        'CREATE TABLE',schemaName+'.'+sub.id,
          '( id bigserial CONSTRAINT',sub.id+'2_pk PRIMARY KEY,',
          fields.join(','),
          ",id_entity varchar(64) not null",
          ",created_at timestamp without time zone DEFAULT (now() at time zone 'utc')",
          ",updated_at timestamp without time zone DEFAULT (now() at time zone 'utc')"];

      if (sub.mode=='update')
        q.push(', CONSTRAINT ' + schemaName + '_' + sub.id + '_id_entity UNIQUE (id_entity)');

      var attrConstraint = config.getFieldsForConstraint(sub);
      if (attrConstraint.length) {
        attrConstraint = attrConstraint.map(function(attribute) {
          return utils.wrapStrings(attribute, ['"']);
        });
        attrConstraint = attrConstraint.join(', ');

        var constraint = ', CONSTRAINT ' + schemaName + '_' + sub.id + '_unique UNIQUE (id_entity, ' + attrConstraint + ')'
        q.push(constraint);
      }

      q.push(')');

      that.query(q.join(' '),null,function(err,data){
        if (err){
          log.error(err);
          return cb(err);
        }

        if (geomIndex)
          that.createGeomIndexes(sub);

        if (jsonAttr.length > 0)
          that.createJSONIndexes(sub,jsonAttr);

        if (indexAttr.length > 0)
          that.createAttrIndexes(sub,indexAttr);
        cb();
      });

    }
    else{
      // get table info. Apply alter table is needed. NEVER DROP COLUMNS except if config says it
      // TODO: Create metadata table.
      sql = ['SELECT column_name, data_type, character_maximum_length',
             'FROM information_schema.columns',
             'WHERE table_schema = $1 AND table_name = $2'];

      that.query(sql.join(' '),[schemaName,sub.id],function(err,data){
        if (err){
          log.error('Error getting fields information')
          return cb(err,null)
        }
        var subAttr = utils.parseLatLon(sub.attributes.slice());

        var current = _.pluck(data.rows,'column_name');
        var needed = _.map(subAttr, function(at){return at.namedb || at.name;}).concat('id','created_at','updated_at','id_entity');
        var toadd = _.difference(needed,current);
        var toremove = _.difference(current,needed);

        if (toremove.length){
          // TODO: REMOVE element.
          // log.debug('TOREMOVE');
          // log.debug(toremove);
        }

        // Add element
        if (toadd.length){
          var fields = [];
          for (var i in subAttr){
            var attr = subAttr[i];
            if (toadd.indexOf(attr.name)!=-1){
              fields.push('ADD COLUMN '+utils.wrapStrings(attr.name,['"']) +' '+utils.getPostgresType(attr.type));
            }
          }
          sql = 'ALTER TABLE '+schemaName+'.'+sub.id+' ' + fields.join(',');

          that.query(sql,null,function(err,data){
            if (err){
              log.error('Error altering table '+schemaName+'.'+sub.id);
              return cb(err,null)
            }
            log.info('Updated table [%s] at PostgreSQL completed',sub.id)
            cb();
          });
        }
        else{
          log.info('Updated table [%s] at PostgreSQL completed',sub.id)
          cb();
        }
      });
    }
  });
}

SubscriptionsModel.prototype.createGeomIndexes = function(sub){
  var q = ['CREATE INDEX ' + sub.schemaname + '_' + sub.id+'_gidx',
           'ON',sub.schemaname+'.'+sub.id,'USING gist(position)'];

  this.query(q.join(' '),null,function(err,d){
    if (err){
      log.error('Cannot execute geometry index creation');
    }
    log.info('Geometry Index created on table %s',sub.id)
  });
}

SubscriptionsModel.prototype.createJSONIndexes = function(sub, attribs){
  var q;
  for (var i=0;i<attribs.length;i++){
    q = ['CREATE INDEX '  + sub.schemaname + '_' + sub.id + '_' + attribs[i]+'_idx',
         'ON',sub.schemaname+'.'+sub.id,'USING gin('+utils.wrapStrings(attribs[i],['"'])+')'];

    this.query(q.join(' '),null,function(err,d){
      if (err){
        log.error('Cannot execute JSON attribute index creation on table %s',sub.id)
      }
      log.info('Index created on table %s',sub.id)
    });
  }
}

SubscriptionsModel.prototype.createAttrIndexes = function(sub, attribs){
  var q;
  for (var i=0;i<attribs.length;i++){
    q = ['CREATE INDEX ' + sub.schemaname + '_' + sub.id+ '_'+attribs[i]+'_idx',
         'ON',sub.schemaname+'.'+sub.id,'USING btree('+utils.wrapStrings(attribs[i],['"'])+')'];

    this.query(q.join(' '),null,function(err,d){
      if (err){
        log.error('Cannot execute attribute index creation on table %s',sub.id)
      }
      log.info('Index created on table %s',sub.id)
    });
  }
}

SubscriptionsModel.prototype.queryData = function(sql,bindings,cb){
  this.query(sql,bindings,cb);
}

SubscriptionsModel.prototype.getSubscription = function(id_name,schema,cb){
  var q = 'SELECT subs_id FROM subscriptions WHERE id_name=$1 and schema=$2';

  this.query(q,[id_name,schema],function(err,d){
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

SubscriptionsModel.prototype.deleteSubscription = function(subs_id, cb){
  var q = 'DELETE FROM subscriptions WHERE subs_id=$1';

  this.query(q,[subs_id],function(err,d){
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
};

SubscriptionsModel.prototype.handleSubscriptionsTable = function(data, cb){
  var table = 'subscriptions';
  var sql = 'SELECT COUNT(*) as n FROM subscriptions WHERE id_name=$1 AND schema=$2';

  var self = this;
  this.query(sql, [data.id_name,data.schema], function(err, r){
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

SubscriptionsModel.prototype.upsertSubscriptedData = function(table, obj, objdq,cb){

  var fields = [], insert = [], update = [];

  function buildQueryArrays(obj,quote){
    for (var o in obj){

      fields.push('"' + o + '"');
      var v = obj[o];
      if (quote)
        v = "'" + v + "'";
      insert.push(v);
      if (o != 'id_entity')
        update.push('"'+ o+ '"=' + v);
    }
  }

  buildQueryArrays(obj,true);
  buildQueryArrays(objdq,false);

  update.push('updated_at=now()');
  fields.push('created_at');
  insert.push('now()');

  fields = fields.join(',');
  insert = insert.join(',');
  update = update.join(',');

  var sql = `INSERT INTO ${table} (${fields}) VALUES (${insert})
              ON CONFLICT (id_entity) DO UPDATE SET ${update}`;

  this.query(sql,null, function(err, r){
    if (err)
      log.error('Cannot execute upsert query: %s'  + sql);

    if (cb) cb(err);

  });
}

// SubscriptionsModel.prototype.upsertSubscriptedDataDEPRECATED = function(table, obj, objdq,cb){
//   /*
//   Upsert SQL example:
//
//   WITH upsert AS
//       (
//           UPDATE dev_agua
//           SET id_entity='dispositivo_k01',
//               value='18',
//               timeinstant='2016-03-04T16:09:54.01',
//               position=ST_SetSRID(ST_MakePoint(-4.45,37.09),4326)
//           WHERE id=(SELECT MAX(id) FROM dev_agua WHERE id_entity='dispositivo_k01')
//           RETURNING *
//       )
//   INSERT INTO dev_agua (id_entity, value, timeinstant, position)
//       SELECT 'dispositivo_k01' AS id_entity,
//              '0.234' AS value,
//              '2015-03-04T16:09:54.01' AS timeinstant,
//              ST_SetSRID(ST_MakePoint(-4.45,37.09),4326) AS position
//       WHERE NOT EXISTS (SELECT * FROM upsert);
//   */
//
//   var sqpg = this._squel.useFlavour('postgres');
//
//   var updtConstructor = sqpg.update().table(table);
//   var slConstructor = this._squel.select();
//
//   for (var i in obj){
//       updtConstructor.set(utils.wrapStrings(i,['"']),obj[i]);
//       if (i == "TimeInstant" && (!obj[i] || obj[i] == ''))
//         obj[i] = '1970-01-01T00:00Z';
//       slConstructor.field(utils.wrapStrings(obj[i],["'"]),i);
//   }
//   for (var i in objdq){
//       updtConstructor.set(utils.wrapStrings(i,['"']),objdq[i],{dontQuote: true});
//       slConstructor.field(String(objdq[i]),i,{dontQuote: true});
//   }
//
//   updtConstructor.set("updated_at","now()");
//   slConstructor.field("now()","updated_at");
//
//   var slMaxid = sqpg.select()
//                   .field('MAX(id)')
//                   .from(table)
//                   .where("id_entity = ?",obj.id_entity)
//
//   var udtQry = updtConstructor.where('id = ?', slMaxid)
//                 .returning("*")
//                 .toString();
//   var slUpsrt = this._squel.select().from("upsert");
//   // var slCon = slConstructor.from("").where("NOT EXISTS ?", slUpsrt);  // OLD -> .from("")
//   var slCon = slConstructor.where("NOT EXISTS ?", slUpsrt);
//
//   var dataKeys = _.keys(_.extend(obj, objdq));
//   dataKeys.push("updated_at");
//   dataKeys = _.map(dataKeys, function(dkey){return utils.wrapStrings(dkey,['"']);});
//
//   var insQry = this._squel.insert()
//                  .into(table)
//                  .fromQuery(dataKeys, slCon)
//                  .toString();
//
//   var sql = ["WITH upsert AS ",utils.wrapStrings(udtQry,["(",")"]),insQry]
//   var q = sql.join(' ')
//
//   this.query(q, null, function(err, r){
//     if (err)
//       log.error('Cannot execute upsert query:' + q);
//
//     if (cb) cb(err);
//
//   });
// }


SubscriptionsModel.prototype.storeData = function(sub,contextResponses,cb){
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

    _.each(crAttr,function(attr){

      var attrSub = _.findWhere(subAttr, {'name': attr.name});

      if (attrSub){
        var attrName = attrSub.namedb || attr.name;
        var attrType = attrSub.type;
        var attrOutcome = attrSub.outcome || {};
        var v = utils.getValueForType(attr.value, attrType, attrOutcome);
        if (utils.isTypeQuoted(attrType))
          obj[attrName] = v;
        else
          objdq[attrName] = v;
      }

    });

    var schemaName = sub.schemaname;
    var schemaTable = schemaName+'.'+sub.id
    if ("mode" in sub && sub.mode == "update")
      this.upsertSubscriptedData(schemaTable,obj,objdq,cb);
    else
      this.insert(schemaTable,obj,objdq,cb);

  }
}

module.exports = SubscriptionsModel;
