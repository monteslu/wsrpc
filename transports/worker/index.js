const { EventEmitter } = require('events');

function dom(webWorker) {
  const emitter = new EventEmitter();
  webWorker.addEventListener('message', function(msg) {
    if(msg.data && msg.data.method) {
      emitter.emit('rpc', msg.data);
    }
  });
  emitter.send = function(msg) {
    webWorker.postMessage(msg);
  };
  return emitter;
}

function worker() {
  const emitter = new EventEmitter();
  self.onmessage = function (msg) {
    if(msg.data && msg.data.method) {
      emitter.emit('rpc', msg.data);
    }
  };
  emitter.send = function(msg) {
    self.postMessage(msg);
  };
  return emitter;
}

module.exports = {
  dom,
  worker
};