module.exports.getPostgresType = function(type){
  if (type=='coords')
    return 'geometry(Point,4326)';
  else if (type == 'string')
    return 'text'
  else if (type == 'ISO8601')
    return 'timestamp without time zone';
}
