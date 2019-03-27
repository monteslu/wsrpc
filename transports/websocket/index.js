const { EventEmitter } = require('events');

function transport(socket) {
  const emitter = new EventEmitter();
  socket.addEventListener('message', (evt) => {
    if(typeof evt.data === 'string') {
      try {
        const msg = JSON.parse(evt.data);
        if(msg.method || (msg.id && msg.hasOwnProperty('result'))) {
          emitter.emit('rpc', msg);
        }
      } catch (err) {};
    }
  });
  emitter.send = function(msg) {
    socket.send(JSON.stringify(msg));
  };
  return emitter;
}

module.exports = transport;