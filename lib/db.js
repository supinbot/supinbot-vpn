'use strict';

const mongoose = require('mongoose');
mongoose.Promise = require('bluebird');

var config = require('../index').config;

module.exports = mongoose.createConnection(config.get('mongodb'));
