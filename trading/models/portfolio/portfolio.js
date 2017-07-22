'use strict'

var mongoose = require('mongoose');
const config = require('../../config/components/mongo.js');

mongoose.connect('mongodb://' + config.mongo.IP + '/stocks');
var Schema = mongoose.Schema;

var portofolioSchema = new Schema({
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

module.exports = Portfolio;
