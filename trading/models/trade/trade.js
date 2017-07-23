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
  status    : { type: String, enum: ['queued', 'pending', 'processed', 'cancelled', 'deleted']}
});

tradeSchema.pre('save', function(next) {
  var currentDate = new Date();
  this.updatedAt = currentDate;
  next();
});

var Trade = mongoose.model('Trade', tradeSchema);

Trade.prototype.placeOrder = function(orderData, success){
  // make zerodha order api call to place an order.
  orderData['status'] = 'processed';
	var trade = new Trade(orderData);
  trade.save(function(err, orderId) {   
  if (err) throw err; 
  success(true, trade._id);
  });   
}

module.exports = Trade;
