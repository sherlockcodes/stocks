'use strict'

var mongoose = require('mongoose');
const config = require('../../config/components/mongo.js');
const Cache = require('../redis/redis.js');

mongoose.connect('mongodb://' + config.mongo.IP + '/stocks');
var Schema = mongoose.Schema;

var cache = new Cache();

var stockSchema = new Schema({
  stockId: { type: String, required: true, unique: true },
  name : String,
  currentPrice: Number,
  updatedAt: Date
});

stockSchema.pre('save', function(next) {
  var currentDate = new Date();
  this.updatedAt = currentDate;
  next();
});

var Stock = mongoose.model('Stock', stockSchema);

Stock.prototype.getPrice = function(stockId, callback){
  cache.get(stockId , function(err, price) {
    if(price==null){
      Stock.findOne({ stockId: stockId }, function(err, stock) {
		  if (err) throw err;
        cache.set(stockId, stock["price"] , function(err, reply) {
		    callback(stock["price"]);
		  });
      });
    }
    else{
      callback(price);
    }
});
}


module.exports = Stock;
