var config = require('../config.js');
var express = require('express');
var router = express.Router();
var request = require('request');
var _ = require('underscore');
var SubscriptionsModel = require('../models/subscriptionsmodel');
var SubscriptionsCartoDBModel = require('../models/subscriptionscartodbmodel');
var log = require('log4js').getLogger(config.getLogOpt().output);
var util = require('util');
var tokenManager = require('./tokenmanager.js');
var servicesTokens;
var subscriptionData = require('./subscriptiondata.js');
var utils = require('../models/utils.js');

function createSubscriptionSerial(idx,cb){
  var subscriptions = config.getSubs();

  createSubscription(subscriptions[idx],function(err){
    if (err)
      return cb(err);

    idx++;
    if (idx < subscriptions.length)
      createSubscriptionSerial(idx,cb);
    else
      cb();
  });
}

function createSubscription(sub,cb){
  createTable(sub,function(err){
    if (err){
      log.error('Cannot create table for subscription [%s]',sub.id);
      return cb(err);
    }
    registerSubscription(sub,cb);
  });
}

// function getRandomInt(min, max) {
//     return Math.floor(Math.random() * (max - min + 1)) + min;
// }

function registerSubscription(sub,cb){

  var cfg = config.getData(),
    model = new SubscriptionsModel(cfg.pgsql);

  model.getSubscription(sub.id,sub.schemaname,function(err,d){
    if (err){
      log.error('Error getting subscription: [%s]',sub.id);
      return cb(err);
    }
    else if (d && config.recreateSubscription(sub)){
      recreateSubscription(sub,d.subs_id,cb);
    }
    else if (d){
      updateOrionSubscription(sub,d.subs_id,cb);
    }
    else{
      newOrionSubscription(sub,cb);
    }
  });
}

function newOrionSubscription(sub, cb){

  var cfgData = config.getData();

  var entities =  _.map(sub.entityTypes,function(types){
    return {
      'type': types.typeName,
      'isPattern' : 'true',
      'id': types.typePattern || '.*'
    };
  });

  var attributes = _.pluck(sub.attributes,'name');
  var triggerAttributes = sub.trigger_attributes;

  var srv = config.getSubService(sub.subservice_id);

  log.info('CALLBACK: ' + cfgData.baseURL + '/subscriptions/' + sub.id);

  var data = {
    'entities': entities,
    'attributes': attributes,
    'reference': cfgData.baseURL + '/subscriptions/' + sub.id,
    'duration': sub.subsduration || 'P2M',
    'notifyConditions': [
        {
            'type': 'ONCHANGE',
            'condValues': triggerAttributes
        }
    ],
    'throttling': sub.substhrottling || 'PT0S'
  };

  var headers = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'Fiware-Service': srv.service,
    'Fiware-ServicePath': srv.subservice,
    'x-auth-token': servicesTokens[sub.subservice_id]
  };

  var options = {
    'url': config.getCtxBrUrls('subscr'),
    'method': 'POST',
    'rejectUnauthorized': false,
    'headers': headers,
    'json': data
  };

  request(options, function (error, response, body) {
    if (!error && response.statusCode == 200) {

      var cfg = config.getData(),
        subscriptionID = response.body.subscribeResponse.subscriptionId;
        model = new SubscriptionsModel(cfg.pgsql);

      model.handleSubscriptionsTable({'subs_id': subscriptionID, 'id_name': sub.id, 'schema': sub.schemaname},function(err){
        if (err){
          log.error('Error handling subscription');
          return cb(err);
        }
        if (sub.fetchDataOnCreated)
          subscriptionData.getDataLargeSubscriptions(sub, headers,cb);
        else
          cb();
      });
      log.info(util.format('New subscription [%s] created successfully',sub.id));

    }
    else{
      log.error(util.format('New subscription [%s] cannot be created',sub.id));
      log.error('Request error: ' + JSON.stringify(response));
      cb(error);
    }
  });
}

function updateOrionSubscription(sub, subs_id,cb){
    var srv = config.getSubService(sub.subservice_id);

    var data = {
       'subscriptionId': subs_id,
       'duration': sub.subsduration || 'P2M'
    };

    var headers = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Fiware-Service': srv.service,
      'Fiware-ServicePath': srv.subservice,
      'x-auth-token': servicesTokens[sub.subservice_id]
    }

    var options = {
      'url': config.getCtxBrUrls('updsbscr'),
      'method': 'POST',
      'rejectUnauthorized': false,
      'headers': headers,
      'json': data
    };

    request(options, function (error, response, body) {
      if (!error && response.statusCode == 200) {
        log.info(util.format('Updated subscription [%s] completed successfully',sub.id));
        cb();
      }
      else{
        log.error(util.format('Subscription [%s] cannot be updated',sub.id));
        log.error('Request error: ' + error);
        //log.debug(response);
        cb(error);
      }
    });
}

function recreateSubscription(sub, subs_id, cb) {
  var srv = config.getSubService(sub.subservice_id);

  var headers = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'Fiware-Service': srv.service,
    'Fiware-ServicePath': srv.subservice,
    'x-auth-token': servicesTokens[sub.subservice_id]
  };

  var data = {
    'subscriptionId': subs_id
  };

  var options = {
    'url': config.getCtxBrUrls('dltsbscr'),
    'method': 'POST',
    'rejectUnauthorized': false,
    'headers': headers,
    'json': data
  };

  log.info(util.format('Recreating subscription [%s] for \'%s\'', subs_id, sub.id));
  // Deleting from Orion
  request(options, function (error, response, body) {
    if (error || response.statusCode !== 200  || body.statusCode.code !== '200') {
      log.error(util.format('Error deleting subscription from Orion: [%s]', subs_id));
      log.error('Request error: ' + error);
      return cb(error);
    }

    // Deleting from PSQL
    model = new SubscriptionsModel(config.getData().pgsql);
    model.deleteSubscription(subs_id, function(err, data) {
      if (err) {
        log.error(util.format('Error deleting subscription from PSQL: [%s]', subs_id));
        return cb(err);
      }

      newOrionSubscription(sub, cb);
    });
  });
}

function createSubscriptionCallback(sub) {
  log.info('Set router: ' + sub.id);

  router.post('/' + sub.id,function(req, res, next) {
    if (config.getData().processing.active) {
      utils.storeData(sub, req.body.contextResponses);

    } else {
      psqlmodel = new SubscriptionsModel(config.getData().pgsql);
      psqlmodel.storeData(sub,req.body.contextResponses,function(err){
        if (err){
          log.error('Error inserting at PGSQL');
          log.warn('Ignoring data, not writting to Carto (alasarr idea)');
          return;
        }
        var cdbActiveFields = config.cdbActiveFields(sub);
        var cdbActive = config.getData().cartodb.active;
        if (cdbActive && cdbActiveFields){
          cdbmodel = new SubscriptionsCartoDBModel(config.getData().cartodb);
          cdbmodel.storeData(sub,req.body.contextResponses,function(err){
            if (err)
              log.error('Error inserting at CARTO');
          });
        }
      });
    }

    res.json({
      ok: 1
    });
  });
}

function createSchemas(schemanames, cb){
  var totalCreated = 0;
  for (var i=0; i<schemanames.length;i++){
    var sch = schemanames[i];
    model = new SubscriptionsModel(config.getData().pgsql);
    model.createSchema(sch,function(err){
      if (err){
         log.error('Cannot create schema [%s]',sch);
         return cb(err);
      }
      totalCreated++;
      if (totalCreated == schemanames.length)
        cb();
    });
  }
}

function createTable(sub,cb){
  model = new SubscriptionsModel(config.getData().pgsql);
  model.createTable(sub,function(err){
    if (err){
      log.error('Error creating table');
      return cb(err);
    }
    else{
      log.info('Subscriptions table [%s] at PostgreSQL: successfully checked', sub.id)
    }

    var cdbActiveFields = config.cdbActiveFields(sub);
    var cdbActive = config.getData().cartodb.active;
    if (cdbActive && cdbActiveFields){
      cdbmodel = new SubscriptionsCartoDBModel(config.getData().cartodb);
      cdbmodel.createTable(sub,function(err){
        if (err){
          log.error('Error creating table at CartoDB');
          cb(err);
        }
        else{
          log.info('Subscriptions table [%s] at CartoDB: successfully checked', sub.id);
          cb();
        }
       });
    }
    else{
      log.debug('CartoDB is disabled');
      cb()
    }

  });
}

function initialize(cb){
  tokenManager.createTokens(function(error,tokens){
    if (error) {
      return log.error('Error, cannot create tokens for the provided credentials: '+error);
      if(cb) return cb(error);
    }

    servicesTokens = tokens;
    var subscriptions = config.getSubs();
    var schemas = _.uniq(_.pluck(subscriptions,'schemaname'));
    createSchemas(schemas,function(error){
      if (error) {
        return log.error('Error, cannot create schemas stopping:'+error);
        if(cb) return cb(error);
      }

      createSubscriptionSerial(0,function(err){
        if (err) {
          log.error('Cannot created all subscriptions. Something went wrong.');
          if(cb) return cb(err);
        }
        else {
          log.info('All subscriptions created succesfully');
          if(cb) return cb(null, subscriptions);
        }
      });
    });
  });
}

function routes(){
  var subscriptions = config.getSubs();
  for (var i=0;i<subscriptions.length;i++){
    var sub = subscriptions[i];
    createSubscriptionCallback(sub);
  }

  return router;
}

module.exports.routes = routes;
module.exports.initialize = initialize;
