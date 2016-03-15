var logParams = require('../config.js').getLogOpt();
var log = require('log4js').getLogger(logParams.output);

module.exports.getPostgresType = function(type){
  if (type=='coords')
    return 'geometry(Point,4326)';
  else if (type == 'string')
    return 'text'
  else if (type == 'integer')
    return 'integer'
  else if (type == 'float')
    return 'double precision'
  else if (type == 'ISO8601')
    return 'timestamp without time zone';
}

module.exports.getValueForType = function(value,type){
  console.log(value, type);
  if (type=='coords'){
    var s = value.split(',');
    return 'ST_SetSRID(ST_MakePoint(' + s[1] + ',' + s[0] + '),4326)';
  }
  else if (type == 'string' || type == 'ISO8601' || type == 'integer' || type == 'float')
    return value;
  else{
    log.error('Unknown type: ' + type);
    throw Error('Unknown type: ' + type);
  }
}

module.exports.isTypeQuoted = function(type){
  if (type=='coords' || type == 'integer' || type == 'float')
    return false;
  else if (type == 'string' || type == 'ISO8601')
    return true;
  else{
    log.error('Unknown type: ' + type);
    throw Error('Unknown type: ' + type);
  }
}

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
