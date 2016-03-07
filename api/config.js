var yaml = require('js-yaml');
var fs   = require('fs');

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
      var urlAuthtk = this._data.contextBrokerUrls.urlAuthtk;
      var portAuthtk = this._data.contextBrokerUrls.portAuthtk;
      return urlCtxBrBase + ':' + portAuthtk + urlAuthtk
    }
    else{
      var portCtxApi = this._data.contextBrokerUrls.portCtxApi;
      var apiBase = urlCtxBrBase + ':' + portCtxApi;
      if (optype == 'subscr')
        return apiBase + this._data.contextBrokerUrls.urlSbc;
      else if (optype == 'updsbscr')
        return apiBase + this._data.contextBrokerUrls.urlSbcUpdate;
      else if (optype == 'update')
        return apiBase + this._data.contextBrokerUrls.urlUdt;
      else if (optype == 'updsbscr')
        return apiBase + this._data.contextBrokerUrls.urlQry;
      else
        return null
    }
  }

  this.getSubs = function(){
    return this._data.subscriptions;
  };

}

module.exports = new Config()
