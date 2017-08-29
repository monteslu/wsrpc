var createPeer = require('./client');
var createWsSender = require('./ws-send');
var createWsReceiver = require('./ws-receive');

module.exports = {
  init: createPeer,
  createWsSender: createWsSender,
  createWsReceiver: createWsReceiver
};
