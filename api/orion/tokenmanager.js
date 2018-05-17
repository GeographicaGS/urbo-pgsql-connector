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
           'name': sub.auth && sub.auth.user || '',
           'password': sub.auth && sub.auth.password || ''
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
