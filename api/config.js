var yaml = require('js-yaml');
var fs = require('fs');
var _ = require('underscore');

/*
FIWARE NGSI APIv1
Context management using NGSI10 standard operations:
https://github.com/telefonicaid/fiware-orion/blob/develop/doc/manuals/user/walkthrough_apiv1.md#ngsi10-standard-operations
*/
var URL_AUTHTK = '/v3/auth/tokens'
var URL_QRY = '/NGSI10/queryContext'
var URL_UDT = '/NGSI10/updateContext'
var URL_SBC = '/NGSI10/subscribeContext'
var URL_SBC_UPDATE = '/NGSI10/updateContextSubscription'

/*
Logs params
*/
var LOG_LEVELS = ['INFO','ERROR','DEBUG'];
var LOG_OUTPUTS = ['console','file'];
var LOG_FOLDER = './logs';

function Config(){

  this._data = yaml.safeLoad(fs.readFileSync('config.yml', 'utf8'));
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
      var portAuthtk = this._data.contextBrokerUrls.portAuthtk;
      return urlCtxBrBase + ':' + portAuthtk + URL_AUTHTK
    }
    else{
      var portCtxApi = this._data.contextBrokerUrls.portCtxApi;
      var apiBase = urlCtxBrBase + ':' + portCtxApi;
      if (optype == 'subscr')
        return apiBase + URL_SBC;
      else if (optype == 'updsbscr')
        return apiBase + URL_SBC_UPDATE;
      else if (optype == 'update')
        return apiBase + URL_UDT;
      else if (optype == 'updsbscr')
        return apiBase + URL_QRY;
      else
        return null
    }
  }

}

module.exports = new Config()
