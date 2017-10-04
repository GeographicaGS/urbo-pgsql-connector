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
var jwt = require('jwt-simple');
var logParams = config.getLogOpt();
var log = require('log4js').getLogger(logParams.output);
var moment = require('moment');
var utils = require('./utils.js');

class NotificationsApiModel {

  _isLatCoords(attribute) {
    return attribute.namedb === 'lat' && attribute.type === 'coords';
  }

  _isLngCoords(attribute) {
    return attribute.namedb === 'lng' && attribute.type === 'coords';
  }

  _isByParam(key, value) {
    return function(attribute) {
      return attribute[key] === value;
    }
  }

  _createToken(tokenSecret, tokenExpiration) {
    var tokenExpiration = tokenExpiration || 10;
    tokenExpiration = moment().add(tokenExpiration, 'seconds').valueOf();
    var token = jwt.encode({
      exp: tokenExpiration
    }, tokenSecret);
    return token;
  }

  _sendRequest(options, attempts) {
    utils.retryRequest(options, attempts,
        function(error, response, body) {
      if (error) {
        log.error('Error notifiyng to the API');
        log.error(error);
      }
    });
  }

  notifyData(subscription, contextResponses) {
    var requestOptions = {
      'url': null,
      'method': 'POST',
      'headers': {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'X-Access-Token': null
      },
      'json': null
    };

    for (var contextResponse of contextResponses) {
      var subscriptionAttributes = subscription.attributes.slice();
      var contextAttributes = contextResponse.contextElement.attributes.slice();

      if (subscriptionAttributes.find(this._isLatCoords)
          && subscriptionAttributes.find(this._isLngCoords)) {
        var latName = subscriptionAttributes.find(this._isLatCoords).name;
        var lonName = subscriptionAttributes.find(this._isLngCoords).name;
        var lat = contextAttributes.find(this._isByParam('name', latName));
        var lon = contextAttributes.find(this._isByParam('name', lonName));
        if (lat && lon) {
          contextAttributes.push({
            name: 'position',
            type: 'coords',
            value: util.format('%s, %s', lat.value, lon.value)
          });
        }
        contextAttributes = contextAttributes.filter(!this._isByParam('name', latName));
        contextAttributes = contextAttributes.filter(!this._isByParam('name', lonName));
        subscriptionAttributes.push({name:'position', type:'coords'});
      }

      var positionExists = false;
      var data = {
        id_entity: contextResponse.contextElement.id
      };

      for (var contextAttribute of contextAttributes) {
        var subscriptionAttribute = subscriptionAttributes.find(this._isByParam('name', contextAttribute.name));

        if (subscriptionAttribute) {
          var name = subscriptionAttribute.namedb || contextAttribute.name;
          var sendAttribute = subscription.notifier.attributes === 'global' ||
            (subscription.notifier.attributes === 'single' &&
              subscriptionAttribute.notifier);

          if (sendAttribute) {
            positionExists = positionExists || name === 'position';
            var outcome = ('outcome' in subscriptionAttribute) ?
              subscriptionAttribute.outcome : undefined;
            data[name] = utils.getNotificationValueForType(contextAttribute.value,
              subscriptionAttribute.type, outcome);
          }
        }
      }

      if (positionExists && subscription.notifier.asGeoJSONFeature) {
        var position = data.position;
        delete data.position;
        data = {
            type: 'Feature',
            geometry: position,
            properties: data
        };
      }

      for (var notifierConfig of config.getData().notifier) {
        var options = JSON.parse(JSON.stringify(requestOptions));  // Cheap deep clone

        options.url = notifierConfig.url;
        options.headers['X-Access-Token'] = this._createToken(
          notifierConfig.tokenSecret, notifierConfig.tokenExpiration);

        options.json = {
          namespace: subscription.notifier.namespace,
          data: data
        };

        this._sendRequest(options, notifierConfig.requestAttempts);
      }
    }
  }

}

module.exports = NotificationsApiModel;
