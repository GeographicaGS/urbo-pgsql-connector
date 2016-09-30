// Load config
var config = require('./config.js');
var express = require('express');
var path = require('path');
var logger = require('morgan');
var bodyParser = require('body-parser');
var routes = require('./routes/index');
var app = express();
var log4js = require('log4js');


// Loading logging configuration
var logParams = config.getLogOpt();
log4js.configure({
  appenders: logParams.logappenders,
  replaceConsole: true
});
var log = log4js.getLogger(logParams.output);
log.setLevel(logParams.level);
log.info('Logger successfully started');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.use('/', routes);

var subscriptions = require('./orion/subscriptions.js');
app.use('/subscriptions',subscriptions.routes());
subscriptions.initialize();


// catch 404 and forward to error handler
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


module.exports = app;
