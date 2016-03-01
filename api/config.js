var yaml = require('js-yaml');
var fs   = require('fs');

// Get document, or throw exception on error
try {
  module.exports = yaml.safeLoad(fs.readFileSync('config.yml', 'utf8'));
} catch (e) {
  module.exports = null;
}

