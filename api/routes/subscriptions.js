var express = require('express');
var router = express.Router();
var request = require('request');
var _ = require('underscore');
var SubscriptionsModel = require('../models/subscriptionsmodel');
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

  var cfgData = config.getData();

  // create the subscription callback
  createSubscriptionCallback(sub);
  registerSubscription(sub, cfgData);
  createTable(sub,function(err){
    if (err)
      return console.error('Cannot create table for subscription');
    // registerSubscription(sub);
  });
}

function registerSubscription(sub, cfgData){
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
    if (!error && response.statusCode == 200) {
      var resp = JSON.parse(JSON.stringify(response));
      var subscritionID = resp.body.subscribeResponse.subscriptionId;
      var data = {subs_id: subscritionID, id_name: sub.id};
      handleSubscriptionsTable('SELECT COUNT(*) FROM subscriptions', null, data);
    }
    else{
      console.error('Something went wrong')
      console.log('Request error: ' + error);
    }
  });

}

function handleSubscriptionsTable(sql, bindings, data){
    model = new SubscriptionsModel(config.getData().pgsql);
    model.query(sql, bindings, function(err, r){
      if (err)
        return console.error('Cannot execute sql query');

      console.log(r.rows[0].count);
      if (r.rows[0].count === '0') {
          insertDataTable('subscriptions', [data]);
      }
      else{
          updateDataTable('subscriptions', data);
      }
    });
}

function insertDataTable(table, data){
    model = new SubscriptionsModel(config.getData().pgsql);
    model.insertData(table, data, function(err){
      if (err)
        return console.error('Cannot create insert subscription data');
    });
}

function updateDataTable(table, data){
    model = new SubscriptionsModel(config.getData().pgsql);
    model.updateData(table, data, function(err){
      if (err)
        return console.error('Cannot create update subscription data');
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

  var subscriptions = config.getSubs();
  for (var i=0;i<subscriptions.length;i++){
    var subscrData = subscriptions[i];

    getAuthToken(i, function(error,t){
      if (error){
        console.error('Cannot get access token');
        return console.error(error);
      }
      token = t;
      console.log(token);
      // console.log(subscrData);
      createSubscription(subscrData,config);
      });
  }

  return router;
}

module.exports = initialize;
