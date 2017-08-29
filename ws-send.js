var events = require('events');

function createSender(ws, sendObjects) {
  var topic = 'rpcSend';
  var ee = new events.EventEmitter();
  ee.on(topic, function(msg) {
    if(typeof msg === 'object' && !sendObjects){
      msg = JSON.stringify(msg);
    }
    ws.send(msg);
  });
  ee.rawrTopic = topic;
  return ee;
}

module.exports = createSender;
