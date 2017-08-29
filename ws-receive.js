var events = require('events');

function createReceiver(ws) {
  var topic = 'rpcReceive';
  var ee = new events.EventEmitter();
  ws.onmessage = function(evt) {
    ee.emit(topic, evt.data);
  }
  ee.rawrTopic = topic;
  return ee;
}

module.exports = createReceiver;
