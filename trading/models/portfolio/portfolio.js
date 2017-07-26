'use strict'

var mongoose = require('mongoose');
const config = require('../../config/components/mongo.js');
const Stock = require('../stock/stock.js');

mongoose.connect('mongodb://' + config.mongo.IP + '/stocks',{ useMongoClient: true });
var Schema = mongoose.Schema;

var portfolioSchema = new Schema({
  stockId: { type: String, required: true },
  userId : String,
  avgBuyPrice : Number,
  quantity  : Number,
  created_at : Date
});

portfolioSchema.pre('save', function(next) {
  var currentDate = new Date();
  if (!this.created_at)
    this.created_at = currentDate;

  next();
});

var Portfolio = mongoose.model('Portfolio', portfolioSchema);

Portfolio.prototype.getReturns = function(userId, callback){
    Portfolio.find({'userId':userId},function(err, stocks){
      var returns = [];
      var totalStocks = stocks.length;
      for(var i=0;i<stocks.length;i++){
        var stock = Stock();
        var stockData = stocks[i].toObject();
        (function(iteration, stockData){
          stock.getPrice(stockData['stockId'],function(price){
            stockData.currentValue = stockData['quantity'] * price;
            stockData.purchaseValue = stockData['quantity'] * stockData['avgBuyPrice'];
            stockData.currentStockPrice = price;
            returns.push(stockData);  
            if(totalStocks==(iteration+1)) callback(returns);
          });
        })(i, stockData);        
      }
    });
}

module.exports = Portfolio;
