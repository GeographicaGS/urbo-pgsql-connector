var util = require('util'),
    PGSQLModel = require('./pgsqlmodel.js'),
    utils = require('./utils'),
    _ = require('underscore'),
    log = require('log4js').getLogger();

log.setLevel(process.env.LOG_LEVEL || 'INFO');

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
        fields.push(attr.name + ' ' + utils.getPostgresType(attr.type));
      }
      var q = [
        'CREATE TABLE ' + sub.id + ' ( id bigserial  CONSTRAINT ' + sub.id + '_pk PRIMARY KEY,',
          fields.join(','),
          ",id_entity varchar(64) not null",
          ",created_at timestamp without time zone default (now() at time zone 'utc')",
          ')'];
      that.query(q.join(' '),null,function(err,data){
        if (err)
          console.log(err);
        else
          cb();
      });
    }
    else{
      // get table info. Apply alter table is needed. NEVER DROP COLUMNS except if config says it
      // TODO: Create metadata table.
      sql = ['select column_name, data_type, character_maximum_length',
              ' from INFORMATION_SCHEMA.COLUMNS where table_name = $1'];

      that.query(sql.join(' '),[sub.id],function(err,data){
        if (err){
          log.error('Error getting fields information')
          return cb(err,null)
        }
        var current = _.pluck(data.rows,'column_name');
        var needed = _.pluck(sub.attributes,'name').concat('id','created_at','id_entity');
        var toadd = _.difference(needed,current);
        var toremove = _.difference(current,needed);

        if (toremove.length){
          // TODO: REMOVE element.  
          console.log('TOREMOVE');
          console.log(toremove);
        }

        // Add element
        if (toadd.length){
          var fields = [];
          for (var i=0;i<sub.attributes.length;i++){
            var attr = sub.attributes[i];
            if (toadd.indexOf(attr.name)!=-1){
              fields.push('ADD COLUMN ' + attr.name + ' ' + utils.getPostgresType(attr.type));
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
      console.error('Cannot execute sql query');
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
      return console.error('Cannot execute sql query');

    if (!r.rows[0].n == '0') {
      self.insertBatch(table,[data],cb);
    }     
    else{
      self.update(table,data,cb);
    }
  });
}

SubscriptionsModel.prototype.storeData = function(sub,contextResponses){
  for (var i=0;i<contextResponses.length;i++){
    var obj = {}, objdq = {};
    obj['id_entity'] = contextResponses[i].contextElement.id;

    _.each(contextResponses[i].contextElement.attributes,function(attr){
      var v = utils.getValueForType(attr.value,attr.type);
      if (utils.isTypeQuoted(attr.type))
        obj[attr.name] = v;
      else
        objdq[attr.name] = v;
    });
    this.insert(sub.id,obj,objdq);
  }
}

module.exports = SubscriptionsModel;
