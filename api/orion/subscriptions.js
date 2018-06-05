// Copyright 2017 Telefónica Digital España S.L.
//
// This file is part of URBO PGSQL connector.
//
// URBO PGSQL connector is free software: you can redistribute it and/or
// modify it under the terms of the GNU Affero General Public License as
// published by the Free Software Foundation, either version 3 of the
// License, or (at your option) any later version.
//
// URBO PGSQL connector is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU Affero
// General Public License for more details.
//
// You should have received a copy of the GNU Affero General Public License
// along with URBO PGSQL connector. If not, see http://www.gnu.org/licenses/.
//
// For those usages not covered by this license please contact with
// iot_support at tid dot es

var config = require('../config.js');
var express = require('express');
var router = express.Router();
var request = require('request');
var _ = require('underscore');
var SubscriptionsModel = require('../models/subscriptionsmodel');
var SubscriptionsCartoDBModel = require('../models/subscriptionscartodbmodel');
var NotificationsApiModel = require('../models/notificationsapimodel');
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
  log.debug('Creating subscription [%s]',sub.id);
  createTable(sub,function(err){
    if (err){
      log.error('Cannot create table for subscription [%s]',sub.id);
      return cb(err);
    }
    log.debug('Created table completed  [%s]',sub.id);
    registerSubscription(sub,cb);
  });
}

function registerSubscription(sub,cb){
  log.debug('Register subscription [%s]',sub.id);
  var cfg = config.getData(),
    model = new SubscriptionsModel(cfg.pgsql);

  model.getSubscription(sub.id,sub.schemaname,function(err,d){
    if (err){
      log.error('Error getting subscription: [%s]',sub.id);
      return cb(err);
    }
    else if (d && config.recreateSubscription(sub)){
      log.debug('Recreate subscription [%s]',sub.id);
      recreateSubscription(sub,d.subs_id,cb);
    }
    else if (d){
      log.debug('Update orion subscription [%s]',sub.id);
      updateOrionSubscription(sub,d.subs_id,cb);
    }
    else{
      log.debug('New orion subscription [%s]',sub.id);
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
    log.debug('Orion new subscription response [%s]',sub.id);
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
      log.error('Request error: ' + JSON.stringify(response, null, 2));
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
  var cfg = config.getData();

  router.post('/' + sub.id,function(req, res, next) {
    log.debug(`Received notifiction to ${ sub.schemaname } ${ sub.id }`);

    if (cfg.manageRepeatedAttributes && req.body.contextResponses) {
      req.body.contextResponses = req.body.contextResponses.map(utils.fixContextResponse);
    }

    if ((cfg.notifier && cfg.notifier.length)
        && (sub.notifier && sub.notifier.attributes !== 'none')) {
      new NotificationsApiModel().notifyData(sub, req.body.contextResponses);
    }

    if (cfg.processing.active) {
      utils.storeData(sub, req.body.contextResponses);

    } else {
      psqlmodel = new SubscriptionsModel(cfg.pgsql);
      psqlmodel.storeData(sub,req.body.contextResponses,function(err){
        if (err){
          log.error('Error inserting at PGSQL');
          log.warn('Ignoring data, not writting to Carto (alasarr idea)');
          return;
        }
        var cdbActiveFields = config.cdbActiveFields(sub);
        var cdbActive = cfg.cartodb.active;
        if (cdbActive && cdbActiveFields){
          cdbmodel = new SubscriptionsCartoDBModel(cfg.cartodb);
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
  log.debug('Creating table [%s]',sub.id);
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
      return log.error('Error, cannot create tokens for the provided credentials: ', error);
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
