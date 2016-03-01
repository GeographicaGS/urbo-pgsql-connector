var express = require('express');
var router = express.Router();
var request = require('request');

function createSubscription(sub,config){

  // create the subscription callback
  createSubscriptionCallback(sub);
  
  var data = {
    "entities": [
        {
          "type": "geoEntTest",
          "isPattern": "true",
          "id": "10*"
        }
    ],
    "attributes": [
            "position","timeinstant","valor_01", "valor_02"
    ],
    "reference": 'http://blabla' + sub.callback,
    "duration": "P1M",
    "notifyConditions": [
        {
            "type": "ONCHANGE",
            "condValues": [
                "position","timeinstant","valor_01", "valor_02"
            ]
        }
    ],
    "throttling": "PT0S"
  };

  var headers = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'Fiware-Service': sub.service,
    'Fiware-ServicePath': '/' + sub.servicePath,
    'x-auth-token': config.fiwareAccessToken
  }

  var options = {
    url: config.contextBroker.base + config.contextBroker.subscription,
    method: 'POST',
    headers: headers,
    json: data
  };

  console.log(options);

  request(options, function (error, response, body) {
    if (!error && response.statusCode == 200) {
      var resp = JSON.parse(body);
      if (resp.ok){
        console.log('OK! ' + sub.callback);
      }
      else{
        console.error(resp);
      }
    }
    else{
      console.error('Something went wrong')
    }
  });
  
}

function createSubscriptionCallback(sub){
  router.post(sub.callback,function(req,res,next){
    console.log("Received request " + sub.callback);
    console.log(req.body);
    res.json(req.body);
  });
}

function initialize(config){

  for (var i=0;i<config.subscriptions.length;i++){
    createSubscription(config.subscriptions[i],config);
  }
  return router;  
}

module.exports = initialize;