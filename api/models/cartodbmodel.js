var CartoDB = require('cartodb');

var logParams = require('../config.js').getLogOpt();
var log = require('log4js').getLogger(logParams.output);

function CartoDBModel(cfg){
  this._user = cfg.user;
  this._apiKey = cfg.apiKey;
  this._enterprise = cfg.enterprise;
  this._sql = new CartoDB.SQL({user: cfg.user,api_key: cfg.apiKey});
  this._squel = require('squel');
};

CartoDBModel.prototype.query = function(opts,cb){
  var err = null;
  if (!opts)
    err = "No params";
  else if (!opts.query)
    err = "No query";

  opts.params = opts.params || {};

  if (err){
    log.error(err);
    cb(err);
  }
  else{
    // console.log('BEFORE EXECUTE');
    // console.log(this._sql.sql_api_url);
    // console.log(opts.query);
    // var self = this;

    this._sql.execute(opts.query, opts.params)
      .done(function(data){
        // console.log('On DONE');
        // console.log(self._sql.sql_api_url);
        // console.log(opts.query);
        if (cb) cb(null,data);
      })
      .error(function(err){
        // console.log('here');
        // console.log(err);
        log.error(err);
        log.error(valueTemplate(opts.query, opts.params));
        if (cb) cb(err);
      });
  }
}

CartoDBModel.prototype.insert = function(table,data,dontquotedata,cb){

  var constructor = this._squel.insert().into(table);

  for (var i in data){
    constructor.set(i,data[i]);
  }

  for (var i in dontquotedata){
    constructor.set(i,dontquotedata[i],{dontQuote: true});
  }

  var sql = constructor.toString();
  this.query({query: sql},cb);

}

function valueTemplate(s,d){
  for(var p in d) s = s.replace(new RegExp('{'+p+'}', 'g'), d[p]);
  return s;
};


module.exports = CartoDBModel;
