var logParams = require('../config.js').getLogOpt();
var log = require('log4js').getLogger(logParams.output);
var _ = require('underscore');

module.exports.getPostgresType = function(type){
  if (type === 'coords' || type === 'geojson')
    return 'geometry(Point,4326)';
  else if (type === 'string')
    return 'text';
  else if (type === 'integer')
    return 'integer';
  else if (type === 'float')
    return 'double precision';
  else if (type === 'ISO8601' || type === 'timestamp')
    return 'timestamp without time zone';
}

module.exports.getValueForType = function(value, type){
  if (type === 'coords') {
    var s = value.split(',');
    return 'ST_SetSRID(ST_MakePoint(' + s[1].trim() + ',' + s[0].trim() + '), 4326)';

  } else if (type == 'geojson') {
    if (typeof value !== 'object') {
      value = JSON.parse(value);
    }

    if (!value.hasOwnProperty('type') ||
        !value.hasOwnProperty('coordinates') ||
        value.coordinates.constructor !== Array) {
      log.error(type + 'isn\'t a valid GeoJSON');
      throw Error(type + 'isn\'t a valid GeoJSON');
    }

    value.coordinates = this._parseGeoJSONCoordiantes(value.coordinates);
    value = JSON.stringify(value);
    return 'ST_SetSRID(ST_GeomFromGeoJSON(\'' + value + '\'), 4326)';

  } else if (type === 'string' || type === 'ISO8601' || type === 'integer' || type === 'float' || type === 'timestamp') {
    return value;

  } else {
    log.error('Unknown type: ' + type);
    throw Error('Unknown type: ' + type);
  }
};

module.exports.isTypeQuoted = function(type){
  if (type === 'coords' || type === 'geojson' || type === 'integer' || type === 'float') {
    return false;

  } else if (type === 'string' || type === 'ISO8601' || type === 'timestamp') {
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

module.exports._parseGeoJSONCoordiantes = function(coordinates) {
  var _this = this;

  return coordinates.map(function(coordinate) {
    if (coordinate.constructor === Array) {
      return _this._parseGeoJSONCoordiantes(coordinate);
    }

    // Isn't worth it to check if they are floats...
    return parseFloat(coordinate);
  });
};
