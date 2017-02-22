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

  notifyData(subscription, contextResponses) {
    var notifierConfig = config.getData().notifier;

    var tokenExpiration = notifierConfig.tokenExpiration || 10;
    tokenExpiration = moment().add(tokenExpiration, 'seconds').valueOf();
    var token = jwt.encode({
      exp: tokenExpiration
    }, notifierConfig.tokenSecret);

    var options = {
      'url': notifierConfig.url,
      'method': 'POST',
      'headers': {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'X-Access-Token': token
      },
      'json': null
    };

    for (var contextResponse of contextResponses) {
      var apiOptions = JSON.parse(JSON.stringify(options));  // Cheap deep clone
      var data = {};
      var positionExists = false;

      var subscriptionAttributes = subscription.attributes.slice();
      var contextAttributes = contextResponse.contextElement.attributes.slice();

      if (subscriptionAttributes.find(this._isLatCoords)
          && subscriptionAttributes.find(this._isLngCoords)) {
        var latName = subscriptionAttributes.find(this._isLatCoords).name;
        var lonName = subscriptionAttributes.find(this._isLngCoords).name;
        var lat = contextAttributes.find(this._isByParam('name', latName));
        var lon = contextAttributes.find(this._isByParam('name', lonName));
        if (lat && lon){
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

      apiOptions.json = {
        namespace: subscription.notifier.namespace,
        data: data
      };

      utils.retryRequest(apiOptions, notifierConfig.requestAttempts,
          function(error, response, body) {
        if (error) {
          log.error('Error notifiyng to the API');
          log.error(error);
        }
      });
    }
  }

}

module.exports = NotificationsApiModel;
