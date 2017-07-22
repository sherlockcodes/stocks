'use strict'

const Redis = require('redis');
const config = require('../../config/components/trade.js');
const User = require('../../models/user/user.js');
const Stock = require('../../models/stock/stock.js');


function TradeHelper(orderData){
	this.orderData = orderData;
}

TradeHelper.prototype.updateAccountBalance = function(){
  var orderData = this.orderData;
  if(orderData){
    var user = new User();
    user.getUser(orderData['userId'],function (userData){
    if(userData){
      var stock = new Stock();
      stock.getPrice(orderData['stockId'],function(price){
      var available = userData['accountValue']; // account value can be taken from zerodha user api. 
      var tradedAmount = orderData['quantity'] * price;
      var currentBalance = available;
      if(orderData["tradeType"] == "buy"){
        currentBalance = available - tradedAmount;            
      }
      else{
        currentBalance = available + tradedAmount;
      }
      console.log('currentBalance' + currentBalance);
      User.findOneAndUpdate({ userId: orderData["userId"] }, { accountValue: currentBalance }, function(err, user) {
      if (err) throw err;
        console.log(user);
      });
    });
    }
    });
  }
  return {"status":"success"}
}

TradeHelper.prototype.validateRequest = function(){
  if(this.orderData){
    var missing_fields = []
    for(var i=0;i<config.trade.MANDATORY_FIELDS.length;i++){
      if(!Object.keys(this.orderData).includes(config.trade.MANDATORY_FIELDS[i])){
        missing_fields.push(config.trade.MANDATORY_FIELDS[i]);
      }
    }
    if(missing_fields.length!=0)
      return {'status':false,'reason':'mandatory fields missing. mandatory fields are ' + config.trade.MANDATORY_FIELDS } 
  }
  return {'status':'success'}
}


TradeHelper.prototype.canPlaceOrder = function(orderData, callback){
  if(orderData){	
  	var user = new User();  
  	var stock = new Stock();	
  	user.getUser(orderData['userId'],function (userData){
  		if(userData){
        if(orderData["tradeType"] == "buy"){
          stock.getPrice(orderData['stockId'],function(price){
          var available = userData['accountValue']; // account value can be taken from zerodha user api. 
          var required = orderData['quantity'] * price;
          if(available < required){
            var errorMsg = 'required: ' + required + ' available: ' + available; 
            callback({'status':false, 'message':errorMsg});
          }
          else{
            callback({'status':true});
          }
          });
        }
        else{
          // to-do, check whether given number of stock is available to sell in portfolio
          callback({'status':true});
        }  			
  		} 
  	});
  }
  callback({'status':false});
}

module.exports = TradeHelper;