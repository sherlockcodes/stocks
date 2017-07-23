var http = require('http');
var events = require('events');

const google = require('../../config/google_finance.js');
const Cache = require('../../models/redis/redis.js');
const Stock = require('../../models/stock/stock.js');

cache = new Cache();

var stockId = process.argv[2];

var options = {
  host: google.config.URL,
  path: google.config.PATH + google.config.EXCHANGE + ':' + stockId
};

var eventEmitter = new events.EventEmitter();

// If there is any price change, this function will update in both Redis and Mongo.
var updateCache = function UpdateCache(stockData) {
  console.log('updateCache');
  stockData = JSON.parse(stockData.replace('//',''));
  if(stockData.length>=1){
    currentPrice = parseFloat(stockData[0]['l_fix']);
  }
  cache.get(stockId , function(err, price) {
    if(price==null || price != currentPrice){
      cache.set(stockId, currentPrice , function(err, reply) {
        console.log('Price updated for ' + stockId);
        eventEmitter.emit('updateDB',{'stockId':stockId, 'currentPrice':currentPrice});
      });
    }
    else{
      process.exit();
    }
});
}

var updateDB = function UpdateDB(stockData) {
  Stock.findOneAndUpdate({ stockId: stockData.stockId }, { currentPrice: stockData.currentPrice }, function(err, stock) {
  if (err) throw err;
    if(stock==null){
      var stock = new Stock(stockData);
      stock.save(function(err) {
      if (err) throw err;
        console.log('stock updated');
        process.exit();
      }); 
    }
  });
}


eventEmitter.addListener('updateCache', updateCache);
eventEmitter.addListener('updateDB', updateDB);

callback = function(response) {
  var stockData = '';
  response.on('data', function (chunk) {
    stockData += chunk;
  });

  response.on('end', function () {
    eventEmitter.emit('updateCache',stockData, callback);
  });
}

http.request(options, callback).end();
