var express = require('express');
var router = express.Router();

var logParams = require('../config.js').getLogOpt();
var log = require('log4js').getLogger(logParams.output);

/* GET home page. */
router.get('/', function(req, res, next) {
  res.json('URBO - PGSQL Connector');
});

module.exports = router;
