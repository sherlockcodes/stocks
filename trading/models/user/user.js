'use strict'

var mongoose = require('mongoose');
const config = require('../../config/components/mongo.js');

mongoose.connect('mongodb://' + config.mongo.IP + '/stocks');
var Schema = mongoose.Schema;

var userSchema = new Schema({
  userId : { type: String, required: true, unique: true},
  accountValue  : Number,
  relasedProfit : Number
});

userSchema.pre('save', function(next) {
  var currentDate = new Date();
  if (!this.created_at)
    this.created_at = currentDate;

  next();
});

var User = mongoose.model('User', userSchema);

User.prototype.getUser = function(userId, callback){
  User.findOne({ userId: userId }, function(err, user) {
	  if (err) throw err;  
    callback(user);
	  });
}


module.exports = User;