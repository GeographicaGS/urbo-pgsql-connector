module.exports.getPostgresType = function(type){
  if (type=='coords')
    return 'geometry(Point,4326)';
  else if (type == 'string')
    return 'text'
  else if (type == 'ISO8601')
    return 'timestamp without time zone';
}

module.exports.getValueForType = function(value,type){
  if (type=='coords'){
    var s = value.split(',');
    return 'ST_SetSRID(ST_MakePoint(' + s[1] + ',' + s[0] + '),4326)';
  }
  else if (type == 'string' || type == 'ISO8601')
    return value;
  else{
    console.log('Unknown type: ' + type);
    throw Error('Unknown type: ' + type);
  }
}

module.exports.isTypeQuoted = function(type){
  if (type=='coords')
    return false;
  else if (type == 'string' || type == 'ISO8601')
    return true;
  else{
    console.log('Unknown type: ' + type);
    throw Error('Unknown type: ' + type);
  }
}