var events = require('events');

var createNotifier = require('./notifier');

function createServer(options) {
  var methodHandlers = {};
  var notifications = new events.EventEmitter();
  var sendEmitter = options.sendEmitter;
  var sendTopic = options.sendTopic;
  if(!sendTopic && sendEmitter) {
    sendTopic = sendEmitter.rawrTopic;
  }
  if(!sendTopic) {
    sendTopic = 'rpcResult';
  }
  var receiveEmitter = options.receiveEmitter || sendEmitter;
  var receiveTopic = options.receiveTopic || 'rpcCall';


  receiveEmitter.on(receiveTopic, function(msg) {
    if(typeof msg === 'string') {
      msg = JSON.parse(msg);
    }
    if(msg.id) {
      if(methodHandlers[msg.method]){
        methodHandlers[msg.method](msg);
      }
    } else {
      msg.params.unshift(msg.method);
      notifications.emit.apply(notifications, msg.params);
    }
  });

  function addMethod(methodName, handler) {
    methodHandlers[methodName] = function(msg) {
      Promise.resolve()
        .then(function() {
          return handler.apply(this, msg.params || []);
        })
        .then(function(result) {
          sendEmitter.emit(sendTopic, {
            id: msg.id,
            result: result
          });
        })
        .catch(function(error) {
          sendEmitter.emit(sendTopic, {
            id: msg.id,
            error: error
          });
        });
    }
  }

  var notify = createNotifier(sendEmitter, sendTopic);

  return { addMethod: addMethod, notifications: notifications, notify: notify };

}

module.exports = createServer;
