'use strict'

const TradeHelper = require('../helpers/trade/helper.js');
const Order = require('../models/trade/trade.js');

module.exports = function(app){
    app.get('/', function(req, res){
        res.json({ message: 'hooray! welcome to our smallcase!' }); 
    });

    app.post('/order', function(req, res){
      var helper = new TradeHelper(req.body)
      var resp = helper.validateRequest();
      if(resp && resp['status']){
        var orderData = {'stockId':req.body.stockId, 'userId': req.body.userId, 'tradeType':req.body.tradeType, 'quantity':req.body.quantity}        
        helper.canPlaceOrder(orderData, function(resp){
          console.log('resp'+resp);
          if(resp && resp["status"]){
            var order = Order()
            resp = order.placeOrder(orderData);
            res.json(resp);
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


    app.get('/:user_id/holdings', function(req, res){
        res.json({ message: 'hooray! welcome to our smallcase!' }); 
    });

    app.get('/:user_id/returns', function(req, res){
        res.json({ message: 'hooray! welcome to our smallcase!' }); 
    });


}