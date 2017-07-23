'use strict'

const Redis = require('redis');
const config = require('../../config/components/trade.js');
const User = require('../../models/user/user.js');
const Stock = require('../../models/stock/stock.js');
const Portfolio = require('../../models/portfolio/portfolio.js');
const Trade = require('../../models/trade/trade.js');

function TradeHelper(orderData){
	this.orderData = orderData;
}

TradeHelper.prototype.updateAccountBalance = function(){
  var orderData = this.orderData;
  if(orderData){
    var user = new User();
    user.getUser(orderData['userId'],function (userData){
    if(userData){
      var available = userData["accountValue"]; // account value can be taken from zerodha user api as well. 
      var tradedAmount = orderData['quantity'] * orderData['price'];
      var currentBalance = available;
      if(orderData['tradeType'] == 'buy'){
        currentBalance = available - tradedAmount;            
      }
      else{
        currentBalance = available + tradedAmount;
      }
      User.findOneAndUpdate({ userId: orderData['userId'] }, { accountValue: currentBalance }, function(err, user) {
      if (err) throw err;
        console.log(user);
      });
    }
    });
  }
}


TradeHelper.prototype.updatePortfolio = function(){
  var orderData = this.orderData;
  if(orderData){
    orderData['quantity'] = parseInt(orderData['quantity'])
    Portfolio.findOne({'stockId':orderData['stockId']},function(err, stock) {
      if (err) throw err;
      if(stock == null){
        orderData['avgBuyPrice'] = orderData['price'];
        var portofolio = new Portfolio(orderData);
        portofolio.save(function(err) {
          if (err) throw err;
            console.log('portofolio updated');
          });   
      }
      else{
        if(orderData['tradeType'] == 'buy'){
          stock['quantity'] += orderData['quantity'];
          Trade.find({'userId':orderData['userId'],'stockId':orderData['stockId'],"tradeType":"buy"},function(err, trades){
            var avgBuyPrice = stock["avgBuyPrice"]; 
            var total_cost = 0;
            var total_shares = 0;       
            for(var i=0;i<=trades.length-1;i++){
              total_cost += trades[i]['price'] * trades[i]['quantity'];
              total_shares += trades[i]['quantity'];
            }                                       
            stock.avgBuyPrice = total_cost / total_shares; 
            stock.save(function(err) {
              if (err)
                res.send(err);
            });
          });
        }
        else{
          stock.quantity -= orderData['quantity'];
          if(stock['quantity'] == 0){
            Portfolio.remove({'stockId':orderData['stockId']},function(err, stock) {
              if (err) throw err;
            });
          }
          else{
            stock.save(function(err) {
              if (err) throw err;
            });
          }
        }
      }
    });
  }
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
        if(orderData['tradeType'] == 'buy'){
          var available = userData['accountValue']; // account value can be taken from zerodha user api. 
          var required = orderData['quantity'] * orderData["price"];
          if(available < required){
            var errorMsg = 'required: ' + required + ' available: ' + available; 
            callback({'status':false, 'message':errorMsg});
          }
          else{
            callback({'status':true});
          }
        }
        else{
          // to-do, check whether given number of stock is available to sell in portfolio
          Portfolio.find({stockId:orderData['stockId']}, function(err, stock){
            if(err) throw err;
            if(stock && stock['quantity'] >= orderData['quantity'])
              callback({'status':false});
            else
             callback({'status':true}); 
          });
        }  			
  		} 
  	});
  }
  callback({'status':false});
}

module.exports = TradeHelper;