'use strict'

var mongoose = require('mongoose');
const config = require('../../config/components/mongo.js');
const Stock = require('../../models/stock/stock.js');
const TradeHelper = require('../../helpers/trade/helper.js');

mongoose.connect('mongodb://' + config.mongo.IP + '/stocks');
var Schema = mongoose.Schema;

var tradeSchema = new Schema({
  stockId: { type: String, required: true },
  userId : String,
  price : Number,
  updatedAt : Date,
  tradeType : { type: String, enum: ['buy', 'sell'] },
  quantity  : Number
});

tradeSchema.pre('save', function(next) {
  var currentDate = new Date();
  this.updatedAt = currentDate;
  next();
});

var Trade = mongoose.model('Trade', tradeSchema);

Trade.prototype.placeOrder = function(orderData){
  console.log('placeOrder');
	var trade = new Trade(orderData);
  trade.save(function(err) {
  if (err) throw err;
  var helper = new TradeHelper(orderData);
  helper.updateAccountBalance();
  // helper.updatePortfolio();
  // helper.updateAveragePrice();
  return {"status":true}
  });   
}

module.exports = Trade;
