var config = require('../config.js');
var logParams = config.getLogOpt();
var log = require('log4js').getLogger(logParams.output);
var request = require('request');
var _ = require('underscore');

module.exports.getPostgresType = function(type){
  if (type === 'coords')
    return 'geometry(Point,4326)';
  else if (type === 'string')
    return 'text';
  else if (type === 'integer')
    return 'integer';
  else if (type === 'float' || type === 'percent' || type === 'outcome')
    return 'double precision';
  else if (type === 'ISO8601' || type === 'timestamp')
    return 'timestamp without time zone';
  else if (type.startsWith('list'))
    return this.getPostgresListType(type) + ' ARRAY';
  else if (type === 'json')
    return 'JSONB';
  else if (type.startsWith('geojson'))
    return 'geometry(' + this.getPostgresGeoJSONType(type) + ', 4326)';
}

module.exports.getPostgresListType = function(type) {
  if (type === 'list' || type === 'list-string')
    return 'text';
  else if (type === 'list-numeric')
    return 'numeric';
};

module.exports.getPostgresGeoJSONType = function(type) {
  if (type === 'geojson-point')
    return 'Point';
  else if (type === 'geojson-line')
    return 'LineString';
  else if (type === 'geojson-polygon')
    return 'Polygon';
  else if (type === 'geojson-multipoint')
    return 'MultiPoint';
  else if (type === 'geojson-multiline')
    return 'MultiLineString';
  else if (type === 'geojson-multipolygon')
    return 'MultiPolygon';
  else if (type === 'geojson')
    return 'Geometry';
};

module.exports.getValueForType = function(value, type, outcome){
  if (value.toLowerCase() === 'null') {
    return null;
  }

  if (type === 'coords') {
    var s = value.split(',');
    return 'ST_SetSRID(ST_MakePoint(' + s[1].trim() + ',' + s[0].trim() + '), 4326)';

  } else if (type.startsWith('geojson')) {
    if (typeof value !== 'object') {
      value = JSON.parse(value);
    }

    if (!value.hasOwnProperty('type') ||
        !value.hasOwnProperty('coordinates') ||
        value.coordinates.constructor !== Array) {
      var errorMsg = type + ' isn\'t a valid GeoJSON';
      log.error(errorMsg);
      throw Error(errorMsg);
    }

    var postgresGeoJSONType = this.getPostgresGeoJSONType(type);
    if (type !== 'geojson' && value.type !== postgresGeoJSONType) {
      var errorMsg = type + ' isn\'t a valid ' + postgresGeoJSONType + ' GeoJSON';
      log.error(errorMsg);
      throw Error(errorMsg);
    }

    return 'ST_SetSRID(ST_GeomFromGeoJSON(\'' + JSON.stringify(value) + '\'), 4326)';

  } else if (type.startsWith('list')) {
    if (!Array.isArray(value)) {
      value = [];
    }

    var sep = '';
    var cast = '';  // Casting is necesary for empty arrays

    if (type === 'list' || type === 'list-string') {
      var sep = value.length ? '\'' : '';
      var cast = 'text';

    } else if (type === 'list-numeric') {
      var cast = 'numeric';
    }

    return 'ARRAY[' + sep + value.join(sep + ', ' + sep) + sep + ']::' + cast + '[]';

  } else if (type === 'ISO8601' || type === 'timestamp') {
    if (!value || value === '' || new Date(value) == 'Invalid Date'){
      return null;
    }
    else {
      return value;
    }

  } else if (type === 'string' || type === 'integer' || type === 'float') {
    return value;

  } else if (type === 'json') {
    return JSON.stringify(value);

  } else if (type === 'percent') {
    return value * 100;

  } else if (type === 'outcome') {

    if(outcome && outcome.factor && outcome.operation){
      var operation = outcome.operation;
      if(operation==='SUM'){
        return value + outcome.factor;
      }
      else if(operation ==='PROD'){
        return value * outcome.factor;
      }
      else if(operation === 'MIN'){
        return value - outcome.factor;
      }
      else if(operation === 'DIV'){
        return value / outcome.factor;
      }
    }
    return value;

  } else {
    log.error('Unknown type: ' + type);
    throw Error('Unknown type: ' + type);
  }
};

module.exports.isTypeQuoted = function(type){
  if (type === 'coords' || type.startsWith('geojson') || type.startsWith('list') || type === 'integer' || type === 'float' || type === 'percent' || type === 'outcome') {
    return false;

  } else if (type === 'string' || type === 'ISO8601' || type === 'timestamp' || type === 'json') {
    return true;

  } else {
    log.error('Unknown type: ' + type);
    throw Error('Unknown type: ' + type);
  }
};

module.exports.wrapStrings = function(value,wrap) {
  if (wrap.length == 1)
    return [wrap[0],value,wrap[0]].join('')
  else if (wrap.length == 2)
    return [wrap[0],value,wrap[1]].join('')
  else{
    log.error('Wrap length must be 1 or 2');
    throw Error('Wrap length must be 1 or 2');
  }
}

module.exports.parseLatLon = function(subattr) {
  if (_.find(subattr,{namedb:'lat',type:'coords'}) && _.find(subattr,{namedb:'lon',type:'coords'}) &&
      (!_.find(subattr,{name:'position',type:'coords'}) || !_.find(subattr,{namedb:'position',type:'coords'}))){
        subattr.push({name:'position',type:'coords',cartodb:true});
        subattr = _.without(subattr,_.find(subattr,{namedb:'lat'}),_.find(subattr,{namedb:'lon'}));
  }
  return subattr;
}

module.exports.retryRequest = function(options, retries, cb, lastParams) {
  if (retries > 0) {
    request(options, function(error, response, body) {
      if (error) {
        log.info(`Request failed, retrying ${retries - 1} more times: ` + options);
        this.retryRequest(options, retries - 1, cb, {
          error: error,
          response: response,
          body: body
        });

      } else {
        cb(error, response, body);
      }
    }.bind(this));

  } else {
    cb(lastParams.error, lastParams.response, lastParams.body);
  }
};

module.exports.storeData = function(subscription, contextResponses) {
  var processingConfig = config.getData().processing;
  var options = {
    'url': processingConfig.url,
    'method': 'POST',
    'headers': {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    'json': {
      'type': undefined,
      'data': {
        'title': undefined,
        'contextResponses': undefined,
        'subscription': subscription
      },
      'options' : {
        'attempts': processingConfig.jobAttempts,
        'priority': processingConfig.priority
      }
    }
  };

  contextResponses.forEach(function(contextResponse) {
    var psqlOptions = JSON.parse(JSON.stringify(options));  // Cheap deep clone
    psqlOptions.json.type = processingConfig.psqlJob;
    psqlOptions.json.data.title = `${subscription.schemaname} ${subscription.id} to PSQL'`;
    psqlOptions.json.data.contextResponses = [contextResponse];
    this.retryRequest(psqlOptions, processingConfig.requestAttempts, function(error, response, body) {
      if (error) {
        log.error('Error inserting at PGSQL');
        log.error(error);
      }
    });

    var cdbActiveFields = config.cdbActiveFields(subscription);
    var cdbActive = config.getData().cartodb.active;
    if (cdbActive && cdbActiveFields) {

      var cartoOptions = JSON.parse(JSON.stringify(options));  // Cheap deep clone
      cartoOptions.json.type = processingConfig.cartoJob;
      cartoOptions.json.data.title = `${subscription.schemaname} ${subscription.id} to CARTO'`;
      cartoOptions.json.data.contextResponses = [contextResponse];
      cartoOptions.json.data.cartoUser = config.getData().cartodb.user;
      this.retryRequest(cartoOptions, processingConfig.requestAttempts, function(error, response, body) {
        if (error) {
          log.error('Error inserting at CARTO');
          log.error(error);
        }
      });

    }
  }.bind(this));
};

module.exports.toArrayOfNumbers = function(coordinates) {
  var result = [];
  for (var coordinate of coordinates) {
    if (Array.isArray(coordinate)) {
      result.push(this.toArrayOfNumbers(coordinate));
    } else {
      result.push(Number(coordinate));
    }
  }

  return result;
};

module.exports.getNotificationValueForType = function(value, type, outcome) {
  if (type === 'coords') {
    value = value.split(',');
    return {
        type: 'Point',
        coordinates: [
            Number(value[1]),
            Number(value[0])
        ]
    };

  } else if (type === 'json' || type.startsWith('geojson')) {
    if (value.constructor !== {}.constructor) {
      return JSON.parse(value);
    }

    if (type.startsWith('geojson')) {
      value.coordinates = this.toArrayOfNumbers(value.coordinates);
    }

    return value;

  } else if (type.startsWith('list')) {
    if (!Array.isArray(value)) {
      if (value.startsWith('[') && value.endsWith(']')) {
        value = value.slice(1, -1);
      }
      value = value.split(',');

      if (type === 'list-numeric') {
        value = value.map(Number);
      }
    }

    return value;

  } else if (type === 'integer') {
    return parseInt(value);

  } else if (type === 'float') {
    return parseFloat(value);

  } else if (type === 'percent') {
    return  Number(value) * 100;

  } else if (type === 'outcome') {
    if (outcome && outcome.factor && outcome.operation) {
      value = Number(value);
      if (outcome.operation === 'SUM') {
        return value + outcome.factor;

      } else if (outcome.operation === 'PROD') {
        return value * outcome.factor;

      } else if (outcome.operation === 'MIN') {
        return value - outcome.factor;

      } else if (outcome.operation === 'DIV') {
        return value / outcome.factor;
      }
    }
    return value;

  } else {  // As it comes: strings, timestamps, ...
    return value;  // As it comes
  }
};
