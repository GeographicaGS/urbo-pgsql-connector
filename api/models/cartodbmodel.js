var log = require('log4js').getLogger();
log.setLevel(process.env.LOG_LEVEL || 'INFO');

var CartoDB = require('cartodb');

function CartoDBModel(cfg){
  this._user = cfg.user;
  this._apiKey = cfg.apiKey;
  this._sql = new CartoDB.SQL({user: cfg.user,api_key: cfg.apiKey});
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
    
    this._sql.execute(opts.query, opts.params)
      .done(function(data){
        log.error(valueTemplate(opts.query, opts.params));
        cb(null,data);        
      })
      .error(function(err){
        log.error(err);
        log.error(valueTemplate(opts.query, opts.params));
        cb(err);
      });
  }

}

function valueTemplate(s,d){
  for(var p in d) s = s.replace(new RegExp('{'+p+'}', 'g'), d[p]);
  return s;
};


module.exports = CartoDBModel;