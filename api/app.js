// Load config
var bodyParser = require('body-parser');
var express = require('express');
var log4js = require('log4js');
var path = require('path');
var config = require('./config.js');
var routes = require('./routes/index');
var app = express();
var log = utils.log();

// Loading access logger
var logParams = config.getLogOpt();
app.use(log4js.connectLogger(log, logParams.access));  // Morgan substitute
log.info('Access logger successfully started');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.use('/', routes);

var subscriptions = require('./orion/subscriptions.js');
app.use('/subscriptions',subscriptions.routes());

// Catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    log.error('[%d] %s',err.status,err.message);
    res.status(err.status || 500);
    res.json({
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  log.error('[%d] %s',err.status,err.message);
  res.status(err.status || 500);
  res.json({
    message: err.message,
    error: {}
  });
});

module.exports.app = app;
module.exports.subscriptions = subscriptions;
