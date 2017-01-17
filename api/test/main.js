'use strict';

var request = require('supertest');
var cluster = require('cluster');
var should = require('chai').should();  // actually call the function
var process = require('process');
var app = require('../app');

describe('MAIN', function(){
  it('API', function(done){
    request(app)
    .get('/')
    .expect(200)
    .end(done);
  });
});