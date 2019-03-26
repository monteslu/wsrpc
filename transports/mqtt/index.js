const { EventEmitter } = require('events');

function adapter({connection, subTopic, pubTopic, subscribe = true}) {
  const emitter = new EventEmitter();
  if(subscribe) {
    connection.subscribe(subTopic);
  }
  connection.on('message', function (topic, message) {
    if(topic === subTopic) {
      try {
        const msg = JSON.parse(message.toString());
        if(msg.method) {
          emitter.emit('rpc', msg);
        }
      } catch(err) {
        console.error(err);
      }
    }
  });
  emitter.send = function(msg) {
    connection.publish(pubTopic, JSON.stringify(msg));
  };
  return emitter;
}

module.exports = adapter;