var pg = require('pg');
var utils = require('./utils');

var logParams = require('../config.js').getLogOpt();
var log = require('log4js').getLogger(logParams.output);


function PGSQLModel(cfg){
  this._cfg = cfg;
  this._squel = require('squel');
};

// 'energy',
// data:{field: 'value'}
PGSQLModel.prototype.insertBatch = function(table,data,cb){
  if (!data || (data.isArray && data.length==0)){
    log.warning('Trying to insert data with no data. Ignoring.')
    return;
  }

  var sql = this._squel.insert().into(table).setFieldsRows(data).toString();

  this._connect(function(err,client,done){
    client.query(sql,function(err,r){
      done();
      if (err){
        log.error(sql);
        log.error('Error when inserting data');
        log.error(err);
      }
      if (cb) cb(err,r);
    });
  });
}

PGSQLModel.prototype.insert = function(table,data,dontquotedata,cb){

  var constructor = this._squel.insert().into(table);

  for (var i in data){
    constructor.set(utils.wrapStrings(i,['"']),data[i]);
  }

  for (var i in dontquotedata){
    constructor.set(utils.wrapStrings(i,['"']),dontquotedata[i],{dontQuote: true});
  }

  var sql = constructor.toString();

  this._connect(function(err,client,done){
    client.query(sql,function(err,r){
      done();
      if (err){
        log.error(sql);
        log.error('Error when inserting data');
        log.error(err);
      }
      if (cb) cb(err,r);
    });
  });
}

PGSQLModel.prototype.update = function(table,data,cb){
  if (!data || (data.isArray && data.length==0)){
    log.warning('Trying to update data with no data. Ignoring.')
    return;
  }

  var sql = this._squel.update()
              .table(table)
              .setFields(data)
              .toString();

  this._connect(function(err,client,done){
    client.query(sql,function(err,r){
      done();
      if (err){
        log.error('Error when updating data');
        log.error(err);
      }
      if (cb) cb(err,r);
    });
  });
}

PGSQLModel.prototype._connect = function(cb){
  pg.connect(this._cfg,cb);
}

PGSQLModel.prototype.query = function(sql,bindings,cb){
  this._connect(function(err,client,done){
    if (err){
      log.error(err);
      return;
    }
    client.query(sql,bindings,function(err,r){
      done();
      if (err){
        log.error('Error executing query');
        log.error(err);
      }
      if (cb) cb(err,r);
    });
  });
}

module.exports = PGSQLModel;
