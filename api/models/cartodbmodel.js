var log = require('log4js').getLogger();
log.setLevel(process.env.LOG_LEVEL || 'INFO');

var CartoDB = require('cartodb');

function CartoDBModel(cfg){
  this.client = new CartoDB({user: cfg.user,api_key: cfg.api_key});
  this._connected = false;
};

CartoDBModel.prototype.connect = function(cb){
  var _this = this;
  this.client.on('connect', function(){
    _this._connected = true;
    cb(true);
  });

  this.client.connect();
}

CartoDBModel.prototype.query = function(opts,cb){
  var err = null;
  if (!opts)
    err = "No params";
  else if (!opts.query)
    err = "No query";
  else if (!this._connected)
    err = "Cannot execute a query without a previous connection. Please call connect.";

  opts.params = opts.params || {};

  if (err){
    log.error(err);
    cb(err);
  }
  else{
    this.client.query(opts.query, opts.params, function(err,data){
      if (err){
        log.error(err);
        log.error(valueTemplate(opts.query, opts.params));
        cb(err);
      }
      else{
        //console.log(valueTemplate(opts.query, opts.params));
        cb(err,data)
      }
    });
  }

}

function valueTemplate(s,d){
  for(var p in d) s = s.replace(new RegExp('{'+p+'}', 'g'), d[p]);
  return s;
};


module.exports = CartoDBModel;