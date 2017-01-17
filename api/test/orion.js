'use strict';

var request = require('supertest');
var cluster = require('cluster');
var should = require('chai').should();  // actually call the function
var process = require('process');
var app = require('../app');
var config = require('../config');
var getLargeSubscriptions = require('../orion/subscriptiondata')
var subscriptions = require('../orion/subscriptions');

var srv = config.getSubService('parking_simulations');
var headers = {
  'Content-Type': 'application/json',
  'Accept': 'application/json',
  'Fiware-Service': srv.service,
  'Fiware-ServicePath': srv.subservice
};

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
      console.log(error, subs);
      done();
    });
  })

});