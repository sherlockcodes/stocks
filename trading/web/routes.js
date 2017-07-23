'use strict'

var mongoose = require('mongoose');

const TradeHelper = require('../helpers/trade/helper.js');
const Order = require('../models/trade/trade.js');
const Portofolio = require('../models/portfolio/portfolio.js');
const User = require('../models/user/user.js');
const Stock = require('../models/stock/stock.js');


module.exports = function(app){
    // home page
    app.get('/', function(req, res){
        res.json({ message: 'hooray! welcome to smallcase!' }); 
    });

    // Api to return holding of the user
    // /<user_id>/holdings/ => get current holdings of the given user.

    app.get('/:user_id/holdings', function(req, res){
        var userId = req.params.user_id;
        Portofolio.find({userId:userId},function(err, trades){
          if(err) res.json({'status':false})
          var data = {'data':trades, 'status':true};
          res.json(data);
        });
    });

    // Api to return cumulative returns of all the trades of user.
    // /<user_id>/returns/
    // It takes initial price of the trade and current price of the stock traded.

    app.get('/:user_id/returns', function(req, res){
        var userId = req.params.user_id;
        var portfolio = new Portofolio()
        portfolio.getReturns(userId, function(returns){
          var data = {'status':true, 'data': returns}
          res.send(data);
        });
    });

    // Portfolio api to get list of trades user performed.
    // /<user_id>/portfolio => it will return list of trades user performed in descending order.
    // attributes: 
    //    limit => number of trades to rendered
    //    page  => Page which needs to skiped.

    app.get('/:user_id/portfolio', function(req, res){
        var limit = parseInt(req.query.limit || 10);
        var skip = (parseInt(req.query.page || 1)-1) * limit;   
        Order.find({})
            .sort({'updatedAt':-1})
            .limit(limit)
            .skip(skip)
            .exec(function(err,trades){
              if(err) res.send(err);
              var data = {'status':true, 'trades':trades};
              res.json(data);
            });
    });

    // User api to get user information.
    // /user/<user_id> => it will return account value and released profit.

    app.get('/user/:user_id', function(req, res){
        var userId = req.params.user_id;
        User.find({'userId':userId}, function(err, user){
          if(err) res.send(err);
          var data = {'status':true, 'data': user}
          res.send(data);
        });
    });

    // Stock api to get stock information.
    // /stock/<stock_id> => it will return current price and last update time information.

    app.get('/stock/:stock_id', function(req, res){
        var stockId = req.params.stock_id;
        Stock.find({'stockId':stockId}, function(err, stock){
          if(err) res.send(err);
          var data = {'status':true, 'data': stock}
          res.send(data);
        });
    });

    // order api to either to buy or sell stock in the market.
    // mandatory params : 
    //      stockId    : Id of the stock
    //      userId     : User's Id
    //      tradeType  : Either buy or sell
    //      quantity   : Number of Quantity to buy or sell
    //      price      : Price in which user wish to trade.   

    app.post('/order', function(req, res){
      var helper = new TradeHelper(req.body)
      var resp = helper.validateRequest(); // validate whether all the mandatory parameters are present. 
      if(resp && resp['status']){
        var orderData = {
                        'stockId':req.body.stockId, 'userId': req.body.userId, 'tradeType':req.body.tradeType,
                        'quantity':req.body.quantity, 'price':req.body.price, 'status':'queued'
                        }         
        helper.canPlaceOrder(orderData, function(resp){
          if(resp && resp['status']){
            var order = Order()
            // to-do:  create order id and push order data into Queue. then, wait till given price matches current price.
            order.placeOrder(orderData,function(status, orderId){
              // send socket update saying order is completed. 
              if(status){
                helper.updateAccountBalance();    // once order is processed, Update Account Balance.
                helper.updatePortfolio();         // convert trade to portfolio.
                res.json({'status':true, 'orderId':orderId});  
              }                      
              else{
                res.json({'status':false, 'reason':'problem placing an order'});  
              }   
            });
          }
          else{
            res.json(resp);
          }          
        });        
      }
      else{
        res.json(resp);
      }
    });

    // Order api to manage other operations such as delete or update an existing order
    // /order/<order-id>/delete  => to delete given order id. if it is already not processed. If processed, it will send failure response.
    // /order/<order-id>/update  =>> to update attributes like price, quantity, tradeType mof existing order.
    app.post('/order/:order_id/:action', function(req, res){
      var orderId = mongoose.Types.ObjectId(req.params.order_id);
      var action = req.params.action;    
      Order.findById(orderId,function(err, order){
        if (err) res.send(err);
        if(order){
          var status = order.status;
          if(status=='processed'){
            res.send({'status':false,'reason':'Order is already processed.'})
          }
          else{
            if(action=='delete'){
              order.remove(function(err) {
                if (err) res.send({'status':false, 'reason':'Problem deleted an order.'});
                res.send({'status':true})
              });
            }
            if(action=='update'){
              if(req.body.tradeType) 
                order.tradeType = req.body.tradeType;
              if(req.body.price)
                order.price = req.body.price;
              if(req.body.quantity)
                order.quantity = req.body.quantity
              order.save(function(err){
                if(err)res.send({'status':false, 'reason':'failed to updated'});
                res.send({'status':true})
              });
            }
          }
        }
      });
    });

}