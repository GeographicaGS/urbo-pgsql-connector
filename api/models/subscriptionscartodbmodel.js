var util = require('util'),
    CartoDBModel = require('./cartodbmodel.js'),
    utils = require('./utils'),
    _ = require('underscore'),
    log = require('log4js').getLogger();

log.setLevel(process.env.LOG_LEVEL || 'INFO');

function SubscriptionsCartoDBModel(cfg) {
  CartoDBModel.call(this,cfg);
}

util.inherits(SubscriptionsCartoDBModel, CartoDBModel);

SubscriptionsCartoDBModel.prototype.createTable = function(sub,cb){

  var sql = ['SELECT count(*) as n FROM information_schema.tables',
       " WHERE table_schema = '{{user}}' AND table_name = '{{table}}'"];

  var that = this;
  this.query({ 
      'query': sql.join(' '),
      'params' : { 'user' : this._user, 'table': sub.id}
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
          var name = attr.type=='coords' ? 'the_geom' : attr.name;
          fields.push(name + ' ' + utils.getPostgresType(attr.type));
        }
      }

      var q = [
        'CREATE TABLE ' + that._user + '.' + sub.id + ' (',
          fields.join(','),

          ');',
          "SELECT cdb_cartodbfytable('" +that._user + "','" + sub.id +"')" ];
      
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
        'query': "select column_name from INFORMATION_SCHEMA.COLUMNS where table_schema = '{{user}}' AND table_name = '{{table}}'",
        'params' : { 'user' : that._user, 'table': sub.id}
      },function(err,data){
        if (err){
          log.error('Error getting fields information')
          return cb(err,null)
        }

        var current = _.pluck(data.rows,'column_name');
        var attributes = _.filter(sub.attributes, function(attr){ return attr.cartodb && attr.type!='coords'; });
        var needed = _.pluck(attributes,'name').concat('cartodb_id','the_geom','the_geom_webmercator');
        var toadd = _.difference(needed,current);
        var toremove = _.difference(current,needed);

        if (toremove.length){
          // TODO: REMOVE element.  
          console.log('TOREMOVE CDB');
          console.log(toremove);
        }

        // Add element
        if (toadd.length){
          var fields = [];
          for (var i=0;i<attributes.length;i++){
            var attr = attributes[i];
            if (toadd.indexOf(attr.name)!=-1){
              fields.push('ADD COLUMN ' + attr.name + ' ' + utils.getPostgresType(attr.type));  
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

SubscriptionsCartoDBModel.prototype.storeData = function(sub,contextResponses){
  var valid_attrs = _.pluck(_.filter(sub.attributes, function(attr){ return attr.cartodb || attr.type=='coords';}),'name');
  
  for (var i=0;i<contextResponses.length;i++){
    var obj = {}, objdq = {};
    obj['id_entity'] = contextResponses[i].contextElement.id;

    _.each(contextResponses[i].contextElement.attributes,function(attr){
      if (valid_attrs.indexOf(attr.name)!=-1){
        var v = utils.getValueForType(attr.value,attr.type);
        var name = attr.type!='coords' ? attr.name : 'the_geom';
        if (utils.isTypeQuoted(attr.type))
          obj[name] = v;
        else
          objdq[name] = v;  
      }
    });


    this.insert(sub.id,obj,objdq);
  }
}

module.exports = SubscriptionsCartoDBModel;