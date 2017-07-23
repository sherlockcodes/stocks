'use strict'

var mongoose = require('mongoose');
var events = require('events');

const config = require('../../config/components/mongo.js');
const Stock = require('../../models/stock/stock.js');

mongoose.createConnection('mongodb://' + config.mongo.IP + '/stocks');
var Schema = mongoose.Schema;

var tradeSchema = new Schema({
  stockId: { type: String, required: true },
  userId : { type: String, required: true },
  price : { type: String, required: true },
  updatedAt : Date,
  tradeType : { type: String, enum: ['buy', 'sell'] ,required: true},
  quantity  : { type: Number, required: true },
});

tradeSchema.pre('save', function(next) {
  var currentDate = new Date();
  this.updatedAt = currentDate;
  next();
});

var Trade = mongoose.model('Trade', tradeSchema);

Trade.prototype.placeOrder = function(orderData, success){
	var trade = new Trade(orderData);
  trade.save(function(err) {
  if (err) throw err;
  success(true);
  });   
}

module.exports = Trade;
