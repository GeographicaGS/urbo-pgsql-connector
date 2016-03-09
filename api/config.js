var yaml = require('js-yaml');
var fs   = require('fs');

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

function Config(){

  this._data = yaml.safeLoad(fs.readFileSync('config.yml', 'utf8'));
  this.getData = function(){
    return this._data;
  };

  this.getSubServiceAuth = function(subserv){
    return {user: this._data.subservices[subserv].auth.user,
        password: this._data.subservices[subserv].auth.password,
        service: this._data.subservices[subserv].service
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

  this.getSubs = function(){
    return this._data.subscriptions;
  };

}

module.exports = new Config()
