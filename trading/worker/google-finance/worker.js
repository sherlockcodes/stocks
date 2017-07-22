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

var updateCache = function UpdateCache(stockData) {
  stockData = JSON.parse(stockData.replace('//',''));
  if(stockData.length>=1){
    currentPrice = parseFloat(stockData[0]['l_fix']);
  }
  cache.get(stockId , function(err, price) {
    if(price==null || price != currentPrice){
      cache.set(stockId, currentPrice , function(err, reply) {
        eventEmitter.emit('updateDB',{"stockId":stockId, "currentPrice":currentPrice});
      });
    }
});
}

var updateDB = function UpdateDB(stockData) {
  Stock.findOneAndUpdate({ stockId: stockData.stockId }, { currentPrice: stockData.currentPrice }, function(err, stock) {
  if (err) throw err;
    console.log(stock);
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
    eventEmitter.emit('updateCache',stockData);
  });
}

http.request(options, callback).end();