// Copyright 2017 Telefónica Digital España S.L.
// 
// This file is part of URBO PGSQL connector.
// 
// URBO PGSQL connector is free software: you can redistribute it and/or
// modify it under the terms of the GNU Affero General Public License as
// published by the Free Software Foundation, either version 3 of the
// License, or (at your option) any later version.
// 
// URBO PGSQL connector is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU Affero
// General Public License for more details.
// 
// You should have received a copy of the GNU Affero General Public License
// along with URBO PGSQL connector. If not, see http://www.gnu.org/licenses/.
// 
// For those usages not covered by this license please contact with
// iot_support at tid dot es

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
    log.warn('Trying to insert data with no data. Ignoring.')
    return;
  }

  var sql = this._squel.insert().into(table).setFieldsRows(data).toString();

  this._connect(function(err,client,done){
    if (err){
      log.error("Cannot connect PLGPSQL");
      log.error(err);
      if (cb) cb(err);
      return;
    }

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
    if (err){
      log.error("Cannot connect PLGPSQL");
      log.error(err);
      if (cb) cb(err);
      return;
    }

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
    log.warn('Trying to update data with no data. Ignoring.')
    return;
  }

  var sql = this._squel.update()
              .table(table)
              .setFields(data)
              .toString();

  this._connect(function(err,client,done){
    if (err){
      log.error("Cannot connect PLGPSQL");
      log.error(err);
      if (cb) cb(err);
      return;
    }

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
      log.error("Cannot connect PLGPSQL");
      log.error(err);
      if (cb) cb(err);
      return;
    }

    client.query(sql,bindings,function(err,r){
      done();
      if (err){
        log.error('Error executing query: '+sql);
        log.error(err);
      }
      if (cb) cb(err,r);
    });
  });
}

module.exports = PGSQLModel;
