const { EventEmitter } = require('events');

function adapter({connection, subTopic, pubTopic}) {
  const emitter = new EventEmitter();
  connection.on(subTopic, function (msg) {
    if(msg.method || (msg.id && msg.hasOwnProperty('result'))) {
      emitter.emit('rpc', msg);
    }
  });
  emitter.send = function(msg) {
    connection.emit(pubTopic, msg);
  };
  return emitter;
}

module.exports = adapter;