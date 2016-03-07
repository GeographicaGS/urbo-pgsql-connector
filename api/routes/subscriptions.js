var express = require('express');
var router = express.Router();
var request = require('request');
var _ = require('underscore');
var SubscriptionsModel = require('../models/subscriptionsmodel');
var SubscriptionsCartoDBModel = require('../models/subscriptionscartodbmodel');
var token;
var config;

function getAuthToken(subserv, cb){
  var subservAuth = JSON.parse(JSON.stringify(config.getSubServiceAuth(subserv)));
  var data = {
    'auth': {
      'identity': {
        'methods': [
          'password'
        ],
        'password': {
          'user': {
            'domain': {
             'name': subservAuth.service
            },
           'name': subservAuth.user,
           'password': subservAuth.password
          }
        }
      }
    }
  };

  var options = {
    'url': config.getData().contextBrokerUrls.urlAuthtk,
    'method': 'POST',
    'rejectUnauthorized': false,
    'json': data
  };

  request(options, function (error, response, body) {

    if (!error) {
      var resp = JSON.parse(JSON.stringify(response));
      // console.log(resp);
      cb(null,resp.headers['x-subject-token']);
    }
    else{
      cb(error,null);
    }
  });
}

function createSubscription(sub){

  createTable(sub,function(err){
    if (err)
      return console.error('Cannot create table for subscription');

    registerSubscription(sub);
  });

}

function registerSubscription(sub){

  var cfgData = config.getData();

  model = new SubscriptionsModel(config.getData().pgsql);

  model.getSubscription(sub.id,function(err,d){
    if (err){
      return console.log('Error getting subscription');
    }
    else if (d){
      updateOrionSubscription(sub, cfgData,d.subs_id);
    }
    else{
      newOrionSubscription(sub, cfgData);
    }
  });
}

function newOrionSubscription(sub, cfgData){

  var entities =  _.map(sub.entityTypes,function(type){
    return {
      'type': type,
      'isPattern' : 'true',
      'id': '.*'
    };
  });

  var attributes = _.pluck(sub.attributes,'name');

  var srv = config.getSubService(sub.subservice_id);

  console.log('CALLBACK: ' + cfgData.baseURL + '/subscriptions/' + sub.id);

  var data = {
    'entities': entities,
    'attributes': attributes,
    'reference': cfgData.baseURL + '/subscriptions/' + sub.id,
    'duration': 'P1M',
    'notifyConditions': [
        {
            'type': 'ONCHANGE',
            'condValues': attributes
        }
    ],
    'throttling': 'PT0S'
  };

  var headers = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'Fiware-Service': srv.service,
    'Fiware-ServicePath': '/' + srv.subservice,
    'x-auth-token': token
  };

  var options = {
    'url': cfgData.contextBrokerUrls.urlSbc,
    'method': 'POST',
    'rejectUnauthorized': false,
    'headers': headers,
    'json': data
  };

  // console.log(config);
  // console.log(JSON.stringify(options));

  request(options, function (error, response, body) {
    if (!error && response.statusCode == 200) {

      var resp = JSON.parse(JSON.stringify(response));
      var subscritionID = resp.body.subscribeResponse.subscriptionId;
      model = new SubscriptionsModel(config.getData().pgsql);
      model.handleSubscriptionsTable({'subs_id': subscritionID, 'id_name': sub.id},function(err){
        if (err){
          console.error('Error handiling subscription');
          return console.error(err);
        }
      });
    }
    else{
      console.error('Something went wrong')
      console.log('Request error: ' + error);
    }
  });

}

function updateOrionSubscription(sub, cfgData, subs_id){
    var srv = config.getSubService(sub.subservice_id);

    var data = {
       'subscriptionId': subs_id,
       'duration': 'P1M'
    };

    var headers = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Fiware-Service': srv.service,
      'Fiware-ServicePath': '/' + srv.subservice,
      'x-auth-token': token
    }

    var options = {
      'url': cfgData.contextBrokerUrls.urlSbcUpdate,
      'method': 'POST',
      'rejectUnauthorized': false,
      'headers': headers,
      'json': data
    };
    // console.log(config);
    // console.log(JSON.stringify(options));

    request(options, function (error, response, body) {
      if (!error && response.statusCode == 200) {
        var resp = JSON.parse(JSON.stringify(response));
        console.log('Updated subscription: ' + sub.id);
      }
      else{
        console.error('Something went wrong')
        console.log('Request error: ' + error);
      }
    });
}

function createSubscriptionCallback(sub){
  console.log('Set router: ' + sub.id);

  router.post('/' + sub.id,function(req,res,next){

    psqlmodel = new SubscriptionsModel(config.getData().pgsql);
    psqlmodel.storeData(sub,req.body.contextResponses,config.getData().cartodb);

    cdbmodel = new SubscriptionsCartoDBModel(config.getData().cartodb);
    cdbmodel.storeData(sub,req.body.contextResponses);

    res.json(req.body);
  });

}

function createTable(sub,cb){
  model = new SubscriptionsModel(config.getData().pgsql);
  model.createTable(sub,function(err){
    if (err){
      console.error('Error creating table');
      return cb(err)
    }
    cdbmodel = new SubscriptionsCartoDBModel(config.getData().cartodb);
    cdbmodel.createTable(sub,function(err){
      if (err)
        console.error('Error creating table at CartoDB');
      else
        console.log('Create table at CartoDB completed');
      cb(err);
     });
  });
}

function initialize(cfg,cb){
  config = cfg;

  var subscriptions = config.getSubs();
  for (var i=0;i<subscriptions.length;i++){
    var sub = subscriptions[i];
    getAuthToken(i, function(error,t){
      if (error){
        console.error('Cannot get access token');
        return console.error(error);
      }
      token = t;
      createSubscription(sub,config);
    });
  }

}

function routes(cfg){
  config = cfg;

  var subscriptions = config.getSubs();
  for (var i=0;i<subscriptions.length;i++){
    var sub = subscriptions[i];
    createSubscriptionCallback(sub);
  }

  return router;
}

module.exports.routes = routes;
module.exports.initialize = initialize;
