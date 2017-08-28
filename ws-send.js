var events = require('events');

function createSender(ws, topic) {
  topic = topic || 'sendTopic';
  var ee = new events.EventEmitter();
  ee.on(topic, function(msg) {
    if(typeof msg === 'object'){
      msg = JSON.stringify(msg);
      ws.send(msg);
    }
  });
  ee.rawrTopic = topic;
  return ee;
}

module.exports = createSender;
