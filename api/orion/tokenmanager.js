var config = require('../config.js');
var log = require('log4js').getLogger(config.getLogOpt().output);
var request = require('request');

function getAuthToken(sub, cb){

  var data = {
    'auth': {
      'identity': {
        'methods': [
          'password'
        ],
        'password': {
          'user': {
            'domain': {
             'name': sub.service
            },
           'name': sub.auth.user,
           'password': sub.auth.password
          }
        }
      }
    }
  };

  var url = config.getCtxBrUrls('authtk');
  if(url){
    var options = {
      'url': url,
      'method': 'POST',
      'rejectUnauthorized': false,
      'json': data
    };

    request(options, function (error, response, body) {
      if (!error) {
        var resp = JSON.parse(JSON.stringify(response));
        cb(null,resp.headers['x-subject-token']);
      }
      else{
        cb(error,null);
      }
    });
  } else {
    return cb(null, undefined);
  }

}
function getSubServiceToken(idx,resp,cb){
  var subservices = config.getData().subservices;
  getAuthToken(subservices[idx],function(error,token){
    if (error)
      return cb(error);

    resp[subservices[idx].id] = token;
    idx++;
    if (idx<subservices.length)
      getSubServiceToken(idx,resp,cb);
    else
      cb(null,resp);
  });
}

function createTokens(cb){
  var subservices = config.getData().subservices;

  if (!subservices || !subservices.length){
    var error = new Error('No subservices specified.');
    return cb(error);
  }

  getSubServiceToken(0,{},cb);
}

module.exports.createTokens = createTokens
