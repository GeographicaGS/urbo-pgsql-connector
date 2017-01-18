'use strict';

var request = require('request');
var should = require('chai').should();  // actually call the function
var config = require('../config');
var subscriptions = require('../orion/subscriptions');

var SQL = require('../models/pgsqlmodel');

var srv = config.getSubService('lighting_simulations');
var headers = {
  'Content-Type': 'application/json',
  'Accept': 'application/json',
  'Fiware-Service': srv.service,
  'Fiware-ServicePath': srv.subservice
};

var requestBody = {
 updateAction: 'APPEND',
 contextElements:
 [
  {
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
  }
]
}

var reku = {
  headers: headers,
  url: config.getCtxBrUrls('update'),
  method: 'POST',
  json: requestBody

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
        should.equal(error, null);
        body.contextResponses[0].statusCode.code.should.be.equal('200');
        var sql = new SQL();
        var query = "SELECT COUNT(*) FROM distrito_telefonica.lighting_stcabinet_state";
        sql.query(query, null, function(error, data){
          console.log(data);
          done();
        });
      });
    });
  });

});