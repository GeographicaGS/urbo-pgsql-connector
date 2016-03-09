var express = require('express');
var router = express.Router();

var logParams = require('../config.js').getLogOpt();
var log = require('log4js').getLogger(logParams.output);

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.post('/tsubscription',function(req,res,next){
  log.info("Received request!");
  log.info(req.body);
  res.json(req.body);
});

module.exports = router;
