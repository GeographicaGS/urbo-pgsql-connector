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

var express = require('express');
var router = express.Router();

var logParams = require('../config.js').getLogOpt();
var log = require('log4js').getLogger(logParams.output);

/* GET home page. */
router.get('/', function(req, res, next) {
  res.json('URBO - PGSQL Connector');
});

module.exports = router;
