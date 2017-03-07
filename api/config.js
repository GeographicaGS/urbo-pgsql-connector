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

// Logs params
var LOG_LEVELS = ['ALL', 'TRACE', 'DEBUG', 'INFO', 'WARN', 'ERROR', 'FATAL', 'OFF'];
var LOG_OUTPUTS = ['console', 'file', 'dailyRotatingFile', 'sizeRotatingFile'];

// Log folders structure
var LOG_DEFAULT_DIR = './logs';
var LOG_DEFAULT_FILENAME = 'the_log';
var LOG_DEFAULT_MAX_SIZE = 20;
var LOG_DEFAULT_OLD_FILES = 5;

function Config() {

  this._data = yaml.safeLoad(fs.readFileSync('config.yml', 'utf8'));

  // Set default params
  var cdb = this._data.cartodb;
  if (cdb) {
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

  this.createFolderSync = function(folder){
    fs.existsSync(folder) || fs.mkdirSync(folder);
  };

  this.getLogOpt = function() {
    // Config vars
    var _logging = this._data.logging;
    var _file = _logging && _logging.file ? _logging.file : null;
    var _access = _logging && _logging.access ? _logging.access : null;

    // Filename vars
    var fileDir = _file && _file.dir ? _file.dir : LOG_DEFAULT_DIR;
    var suffixFilename = _file && _file.name ? _file.name : LOG_DEFAULT_FILENAME;
    suffixFilename = `${ fileDir }/${ suffixFilename }`;

    var errorFilename = `${ suffixFilename }-errors.log`;
    var filename = `${ suffixFilename }.log`;

    // Appenders definition
    var fileErrorAppender = {
      type: 'logLevelFilter',
      level: 'ERROR',
      appender: {
        type: 'file',
        filename: errorFilename
      }
    };

    var logAppenderConsole = [
      {
        type: 'console'
      }
    ];

    var logAppenderFile =  [
      {
        type: 'file',
        filename: filename
      }
    ];

    var logAppenderDailyRotatingFile = [
      {
        type: 'dateFile',
        filename: filename,
        pattern: '-dd'
      }
    ];

    var logAppenderSizeRotatingFile = [
      {
        type: 'file',
        filename: filename,
        maxLogSize: Math.pow((_file && _file.maxSize ? _file.maxSize : LOG_DEFAULT_MAX_SIZE) * 1024, 2),
        numBackups: _file && _file.oldFiles ? _file.oldFiles : LOG_DEFAULT_OLD_FILES
      }
    ];

    if (_file && _file.separateError) {
      logAppenderFile.push(fileErrorAppender);
      logAppenderDailyRotatingFile.push(fileErrorAppender);
      logAppenderSizeRotatingFile.push(fileErrorAppender);
    }

    // log4js parameters definition
    var logParams = {
      output: LOG_OUTPUTS[0],
      level: LOG_LEVELS[3],
      access: { level: LOG_LEVELS[3] },
      logappenders: logAppenderConsole
    };

    // Reading from config file
    if (_logging) {
      if (_logging.level && LOG_LEVELS.includes(_logging.level)) {
        logParams.level = _logging.level;
      }

      if (_access && _access.level && LOG_LEVELS.includes(_access.level)) {
        logParams.access.level = _access.level;
      }

      if (_access && _access.format) {
        logParams.access.format = _access.format;
      }

      if (_access && _access.nolog) {
        logParams.access.nolog = _access.nolog;
      }

      if (_logging.output && _logging.output.endsWith('ile')) {
        this.createFolderSync(fileDir);
        logParams.output = _logging.output;

        if (_logging.output === 'file') {
          logParams.logappenders = logAppenderFile;

        } else if (_logging.output === 'dailyRotatingFile') {
          logParams.logappenders = logAppenderDailyRotatingFile;

        } else if (_logging.output === 'sizeRotatingFile') {
          logParams.logappenders = logAppenderSizeRotatingFile;
        }

        // Creating a message for the console
        errorFilename = _file && _file.separateError ? ' & ' + errorFilename : '';
        logParams.consoleMessage = `Logging into files: ${ filename }${ errorFilename }`;
      }
    }

    return logParams;
  };

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
