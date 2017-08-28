var events = require('events');


function createServer(options) {
  var methodHandlers = {};
  var sendEmitter = options.sendEmitter;
  var sendTopic = options.sendTopic || 'rpcResult';
  var receiveEmitter = options.receiveEmitter || sendEmitter;
  var receiveTopic = options.receiveTopic || 'rpcCall';


  receiveEmitter.on(receiveTopic, function(msg) {
    if(methodHandlers[msg.method]){
      methodHandlers[msg.method](msg);
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

  return { addMethod: addMethod };

}

module.exports = createServer;
