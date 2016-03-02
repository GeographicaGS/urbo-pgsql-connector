var express = require('express');
var router = express.Router();
var request = require('request');
var _ = require('underscore');
var SubscriptionsModel = require('../models/subscriptionsmodel');
var token;
var config;

function getAuthToken(cb){

  var data = {
    'auth': {
      'identity': {
        'methods': [
          'password'
        ],
        'password': {
          'user': {
            'domain': {
             'name': 'sc_smart_region_andalucia'
           },
           'name': 'and_sr_cdm_admin',
           'password': '33j4vBWJ95'
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

  //console.log(config);
  //console.log(options);

  request(options, function (error, response, body) {
    
    if (!error) {
      var resp = JSON.parse(JSON.stringify(response));
      cb(null,resp.headers['x-subject-token']);
    }
    else{
      cb(error,null);
    }
  });
}

function createSubscription(sub){

  var cfgData = config.getData();

  // create the subscription callback
  createSubscriptionCallback(sub);
  createTable(sub,function(err){
    if (err)
      return console.error('Cannot create table for subscription');
    registerSubscription(sub);
  });
}

function registerSubscription(sub){

  var entities =  _.map(sub.entityTypes,function(type){
    return {
      'type': type,
      'isPattern' : 'true',
      'id': '*'
    };
  });

  var attributes = _.pluck(sub.attributes,'name');

  var srv = config.getSubService(sub.subservice_id);

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
  }

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
    console.log(JSON.parse(JSON.stringify(response)));
    if (!error && response.statusCode == 200) {
      var resp = JSON.parse(JSON.stringify(response));
      console.log(resp);
    }
    else{
      console.error('Something went wrong')
      console.log('Request error: ' + error);
    }
  });

}

function createSubscriptionCallback(sub){
  router.post(sub.id,function(req,res,next){
    console.log('Received request ' + sub.callback);
    console.log(req.body);
    model = new SubscriptionsModel(config.getData().pgsql);
    //model.insert(sub.id,{})
    res.json(req.body);
  });
}

function createTable(sub,cb){
  model = new SubscriptionsModel(config.getData().pgsql);
  model.createTable(sub,cb);
}

function initialize(cfg){
  config = cfg;
  getAuthToken(function(error,t){
    if (error){
      console.error('Cannot get access token');
      return console.error(error);
    }
    token = t;
    var subscriptions = config.getSubs();
    for (var i=0;i<subscriptions.length;i++){
      createSubscription(subscriptions[i],config);
    }
  });

  return router;  
}

module.exports = initialize;
