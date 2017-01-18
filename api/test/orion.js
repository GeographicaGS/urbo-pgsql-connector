'use strict';

var request = require('request');
var should = require('chai').should();  // actually call the function
var config = require('../config');
var subscriptions = require('../orion/subscriptions');

var srv = config.getSubService('lighting_simulations');
var headers = {
  'Content-Type': 'application/json',
  'Accept': 'application/json',
  'Fiware-Service': srv.service,
  'Fiware-ServicePath': srv.subservice
};

var requestBody = {
  type: 'connectorPsql',
  data: {
     title: 'lighting_stcabinet_state to PSQL',
     "contextResponses":[
        {
           "contextElement":{
              "type":"ht_6",
              "isPattern":"false",
              "id":"sepulveda-01",
              "attributes":[
                 {
                    "name":"energyConsumed",
                    "type":"Number",
                    "value":"0",
                    "metadatas":[
                       {
                          "name":"TimeInstant",
                          "type":"DateTime",
                          "value":"2017-01-17T11:30:30.828Z"
                       },
                       {
                          "name":"dateUpdated",
                          "type":"DateTime",
                          "value":"2017-01-17T11:30:30.828Z"
                       },
                       {
                          "name":"uom",
                          "type":"Text",
                          "value":"kVArh"
                       }
                    ]
                 },
                 {
                    "name":"reactiveEnergyConsumed",
                    "type":"Number",
                    "value":"0",
                    "metadatas":[
                       {
                          "name":"TimeInstant",
                          "type":"DateTime",
                          "value":"2017-01-17T11:30:30.837Z"
                       },
                       {
                          "name":"dateUpdated",
                          "type":"DateTime",
                          "value":"2017-01-17T11:30:30.837Z"
                       },
                       {
                          "name":"uom",
                          "type":"Text",
                          "value":"kVArh"
                       }
                    ]
                 },
                 {
                    "name":"timeInstant",
                    "type":"DateTime",
                    "value":"2017-01-17T11:30:30.876Z"
                 },
                 {
                    "name":"totalActivePower",
                    "type":"Number",
                    "value":"0",
                    "metadatas":[
                       {
                          "name":"TimeInstant",
                          "type":"DateTime",
                          "value":"2017-01-17T11:30:30.818Z"
                       },
                       {
                          "name":"dateUpdated",
                          "type":"DateTime",
                          "value":"2017-01-17T11:30:30.818Z"
                       }
                    ]
                 }
              ]
           },
           "statusCode":{
              "code":"200",
              "reasonPhrase":"OK"
           }
        }
     ],
     "subscription":{
        "id":"lighting_stcabinet_state",
        "subservice_id":"lighting_simulations",
        "schemaname":"distrito_telefonica",
        "subsduration":"P8M",
        "substhrottling":"PT0S",
        "fetchDataOnCreated":false,
        "entityTypes":[
           {
              "typeName":"ht_6"
           }
        ],
        "mode":"append",
        "attributes":[
           {
              "name":"timeInstant",
              "namedb":"TimeInstant",
              "type":"ISO8601",
              "indexdb":true,
              "cartodb":true,
              "constraint":true
           },
           {
              "name":"energyConsumed",
              "namedb":"energyconsumed",
              "type":"float",
              "cartodb":true
           },
           {
              "name":"reactiveEnergyConsumed",
              "namedb":"reactiveenergyconsumed",
              "type":"float",
              "cartodb":true
           },
           {
              "name":"totalActivePower",
              "namedb":"totalactivepower",
              "type":"float",
              "cartodb":true
           }
        ],
        "trigger_attributes":[
           "totalActivePower"
        ]
     }
  },
  options:{
     attempts: 3,
     priority: 'critical'
  }
}

var reku = {
  headers: headers,
  url: config.getCtxBrUrls('subscr'),
  method: 'POST',
  rejectUnauthorized: false,
  json: requestBody.data

}

describe('ORION', function(){

  it('Dummy headers check', function(done){
    headers['Content-Type'].should.be.equal('application/json');
    headers['Fiware-Service'].should.be.equal('urbo');
    headers['Fiware-ServicePath'].should.be.equal('/geographica_dev');
    done();
  });


  it('Initialize subscriptions', function(done){
    this.timeout(0);
    subscriptions.initialize(function(error, subs){
      if(error instanceof Array) {
        should.equal(error[0], null);
      }
      else {
        should.equal(error, null);
      }

      request(reku, function(error, response, body){
        console.log(error);
        console.log(body);
        console.log(response);
        done();

      })

    });
  });

});