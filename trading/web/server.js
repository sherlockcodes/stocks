'use strict'

var express = require('express');
var app=express();
var bodyParser = require('body-parser');

const config = require('../config/components/server.js');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

var router = express.Router();  

// app.post('/order',function(req, res) {
//   console.log(req.body.stockId);
// });

app.listen(config.server.PORT);

var routes = require('./routes');
routes(app);

console.log('Magic happens on port ' + config.server.PORT);
