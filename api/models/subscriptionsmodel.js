var util = require('util'),
    PGSQLModel = require('./pgsqlmodel.js'),
    mustache = require('mustache'),
    utils = require('./utils'),
    _ = require('underscore');

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
          ", created_at timestamp without time zone default (now() at time zone 'utc')",
          ')'];
      that.query(q.join(' '),null,function(err,data){
        if (err)
          console.log(err);
        else
          console.log('Created');
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
        var needed = _.pluck(sub.attributes,'name').concat('id','created_at');
        var toadd = _.difference(needed,current);
        var toremove = _.difference(current,needed);

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
            console.log('HECHO')
          });
        }

        if (toremove.length){
          // TODO: REMOVE element.
          console.log('TOREMOVE');
          console.log(toremove);
        }

      });
    }
  });
}

SubscriptionsModel.prototype.insertData = function(table,data,cb){
  this.insert(table,data,cb);
}

SubscriptionsModel.prototype.updateData = function(table,data,cb){
  this.update(table,data,cb);
}

SubscriptionsModel.prototype.queryData = function(sql,bindings,cb){
  this.query(sql,bindings,cb);
}

module.exports = SubscriptionsModel;
