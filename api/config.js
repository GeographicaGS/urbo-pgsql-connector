var yaml = require('js-yaml');
var fs = require('fs');
var _ = require('underscore');

/*
FIWARE NGSI APIv1
Context management using NGSI10 standard operations:
https://github.com/telefonicaid/fiware-orion/blob/develop/doc/manuals/user/walkthrough_apiv1.md#ngsi10-standard-operations
*/
var URL_AUTHTK = '/v3/auth/tokens';
var URL_QRY = '/v1/queryContext';
var URL_UDT = '/v1/updateContext';
var URL_SBC = '/v1/subscribeContext';
var URL_SBC_UPDATE = '/v1/updateContextSubscription';
var URL_SBC_DELETE = '/v1/unsubscribeContext';

/*
Logs params
*/
var LOG_LEVELS = ['INFO','ERROR','DEBUG'];
var LOG_OUTPUTS = ['console','file'];
var LOG_FOLDER = './logs';

function Config(){

  this._data = yaml.safeLoad(fs.readFileSync('config.yml', 'utf8'));

  // Set default params
  var cdb = this._data.cartodb;
  if (cdb){
    // Set default params for cartodb
    if (!cdb.hasOwnProperty('active')){
      cdb.active = true;
    }
    if (!cdb.hasOwnProperty('enterprise')){
      cdb.enterprise = false;
    }
  }

  this.getData = function(){
    return this._data;
  };

  this.createLogFolderSync = function(folder){
    // Synchronous creation of logs folder
    try {
      fs.statSync(folder)
    } catch(e) {
      fs.mkdirSync(folder);
    }
  }

  this.getLogOpt = function(){
    var logAppenderConsole = [{ type: "console" }]
    var logAppenderFile = [
      { type: "console" },
      {
        type: "clustered",
        appenders: [
          {
            type: "dateFile",
            filename: "logs/lastmonth/connector-time",
            pattern: "-dd.log",
            alwaysIncludePattern: true
          },
          {
            type: "file",
            filename: "logs/connector-all.log",
            maxLogSize: 20971520,
            numBackups: 3
          },
          {
            type: "logLevelFilter",
            level: "ERROR",
            appender: {
              type: "file",
              filename: "logs/connector-errors.log",
              layout: {
                        type: "pattern",
                        pattern: "[%d{ISO8601}] [%p] (PID-%x{tk1}) - %c - %m",
                        tokens: {tk1: process.pid}
                    }
            }
          }
        ]
      }
    ]
    var logParams = {
                      level: LOG_LEVELS[0],
                      output: LOG_OUTPUTS[0],
                      logappenders: logAppenderConsole
                    }

    if ('logging' in this._data){
      var _logging = this._data.logging;
      if ('level' in _logging && _.contains(LOG_LEVELS,_logging.level))
        logParams.level = _logging.level;
      if ('output' in _logging && _logging.output == 'file'){
        this.createLogFolderSync(LOG_FOLDER);
        this.createLogFolderSync(LOG_FOLDER + '/lastmonth');
        logParams.output = _logging.output;
        logParams.logappenders = logAppenderFile;
      }
    }

    return logParams;
  }

  this.getSubs = function(){
    return this._data.subscriptions;
  };

  this.cdbActiveFields = function(sub){
    return _.contains(_.pluck(sub.attributes, 'cartodb'),true);
  }

  this.getSubServiceAuth = function(subserv){
    var subServAuth = this.getSubService(subserv.subservice_id);
    return {user: subServAuth.auth.user,
            password: subServAuth.auth.password,
            service: subServAuth.service
          };
  }

  this.getSubService = function(id){
    for (var i=0;i<this._data.subservices.length;i++){
      var s = this._data.subservices[i];
      if (s.id == id){
        return s;
      }
    }

    return null;
  };

  this.getCtxBrUrls = function(optype){
    var urlCtxBrBase = this._data.contextBrokerUrls.urlCtxBrBase;
    if (optype == 'authtk'){
      if(!this._data.contextBrokerUrls.portAuthtk) return null;
      var portAuthtk = this._data.contextBrokerUrls.portAuthtk;
      return urlCtxBrBase + ':' + portAuthtk + URL_AUTHTK
    }
    else{
      var portCtxApi = this._data.contextBrokerUrls.portCtxApi;
      var apiBase = urlCtxBrBase + ':' + portCtxApi;
      if (optype === 'subscr')
        return apiBase + URL_SBC;
      else if (optype === 'updsbscr')
        return apiBase + URL_SBC_UPDATE;
      else if (optype === 'dltsbscr')
        return apiBase + URL_SBC_DELETE;
      else if (optype === 'update')
        return apiBase + URL_UDT;
      else if (optype === 'query')
        return apiBase + URL_QRY;
      else
        return null
    }
  }

  this.recreateSubscription = function(subscription) {
    var rss = this._data.recreateSubscriptions || 'none';
    var rs = subscription.recreateSubscription || false;

    var _global = rss === 'global' ? true : false;  // global is a reserverd word :(
    var _single = rss === 'single' ? true : false;  // _keeping the mood
    rs = rs === true ? true : false;  // Only accepting booleans here

    if (_global || (_single && rs)) {
      return true;

    } else {
      return false;
    }
  };

  this.getFieldsForConstraint = function(subscription) {
    var attributes = subscription.attributes.filter(function(attribute) {
      return attribute.constraint;
    });

    return attributes.map(function(attribute) {
      return attribute.namedb || attribute.name;
    });
  };

}

module.exports = new Config();
