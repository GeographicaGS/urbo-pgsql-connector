'use strict';

var request = require('supertest');
var cluster = require('cluster');
var should = require('chai').should();  // actually call the function
var process = require('process');
var app = require('../app');
var config = require('../config');
var getLargeSubscriptions = require('../orion/subscriptiondata')



console.log(config.getCtxBrUrls('query'));

describe('ORION', function(){
  it('a', function(done){
    request(app)
    .get('/')
    .expect(200)
    .expect(function(res){
      res.text.should.be.equal('"URBO - PGSQL Connector"')
    })
    .end(done);
  });
});