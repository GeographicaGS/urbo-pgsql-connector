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

var request = require('request');
var config = require('../config.js');
var SubscriptionsModel = require('../models/subscriptionsmodel');
var SubscriptionsCartoDBModel = require('../models/subscriptionscartodbmodel');
var log = require('log4js').getLogger(config.getLogOpt().output);
var utils = require('../models/utils.js');

function getDataPage(sub, headers, page, cb) {
  var pageSize = 500;
  var startOffset = 0;

  var offset = pageSize*page + startOffset;

  var entities =  sub.entityTypes.map(function(types) {
    return {
      'type': types.typeName,
      'isPattern' : 'true',
      'id': types.typePattern || '.*'
    };
  });

  var data = {'entities': entities};

  var options = {
    'url': config.getCtxBrUrls('query')+'?details=on&limit='+pageSize+'&offset='+offset,
    'method': 'POST',
    'rejectUnauthorized': false,
    'headers': headers,
    'json': data
  };

  request(options, function (error, response, body) {
    if (!error && response.statusCode == 200) {
      if (response.body.errorCode.code === "200") {
        if (config.getData().processing.active) {
          utils.storeData(sub, response.body.contextResponses);

        } else {
          psqlmodel = new SubscriptionsModel(config.getData().pgsql);
          psqlmodel.storeData(sub,response.body.contextResponses);

          var cdbActiveFields = config.cdbActiveFields(sub);
          var cdbActive = config.getData().cartodb.active;
          if (cdbActive && cdbActiveFields){
            cdbmodel = new SubscriptionsCartoDBModel(config.getData().cartodb);
            cdbmodel.storeData(sub,response.body.contextResponses);
          }
        }

        log.info('Retrieved paged %d for subscription [%s]',page,sub.id);
        getDataPage(sub, headers, page+1,cb);

      } else if (response.body.errorCode.code !== "404") {
        console.error('Couldn\'t retrieve subscription data on create:', response.body);
        cb(response.body.errorCode);
      } else {
        cb();
      }

    } else {
      log.error('Request error: ', error);
      log.debug(response);
      cb(error);
    }
  });
}

function getDataLargeSubscriptions(sub, headers, cb) {
  getDataPage(sub, headers, 0, cb)
}

module.exports.getDataLargeSubscriptions = getDataLargeSubscriptions;
