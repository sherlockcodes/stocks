'use strict'

const Redis = require('redis');
const config = require('../../config/components/redis.js');

function Cache(){
  this.client = Redis.createClient({host:config.redis.IP, port:config.redis.PORT});
  this.client.auth(config.redis.PWD, function (err) { if (err) throw err; });
  return this.client;
}

module.exports = Cache;