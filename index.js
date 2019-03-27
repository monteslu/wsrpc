const { EventEmitter } = require('events');

function rawr({ transport, timeout = 0, handlers = {} }) {
  let callId = 0;
  const pendingCalls = {};
  const methodHandlers = {};
  const notificationEvents = new EventEmitter();
  notificationEvents.on = notificationEvents.on.bind(notificationEvents);

  transport.on('rpc', function(msg) {
    if(msg.id) {
      if(msg.params && methodHandlers[msg.method]) { //handle the request
        methodHandlers[msg.method](msg);
        return;
      }
      else { //handle the result
        const promise = pendingCalls[msg.id];
        if(promise) {
          if(promise.timeoutId) {
            clearTimeout(promise.timeoutId);
          }
          delete pendingCalls[msg.id];
          if (msg.error) {
            promise.reject(msg.error);
          }
          else {
            promise.resolve(msg.result);
          }
        }
        return;
      }
    }
    
    // handle notification
    msg.params.unshift(msg.method);
    notificationEvents.emit.apply(notificationEvents, msg.params);
  });

  function addHandler(methodName, handler) {
    methodHandlers[methodName] = function(msg) {
      Promise.resolve()
        .then(function() {
          return handler.apply(this, msg.params);
        })
        .then(function(result) {
          transport.send({
            id: msg.id,
            result: result
          });
        })
        .catch(function(error) {
          const serializedError = {message: error.message};
          if(error.code) {
            serializedError.code = error.code;
          } 
          transport.send({
            id: msg.id,
            error: serializedError
          });
        });
    }
  }

  for (const m in handlers) {
    addHandler(m, handlers[m]);
  }

  const methods = new Proxy({}, {
    get: function(target, name) {

      return function (...args) {
        const id = ++callId;
        const msg = {
          jsonrpc : '2.0',
          method: name,
          params: args,
          id
        };

        let timeoutId;
        if(timeout) {
          timeoutId = setTimeout(function() {
            if(pendingCalls[id]) {
              const err = new Error('RPC timeout');
              err.code = 504;
              pendingCalls[id].reject(err);
              delete pendingCalls[id];
            }
          }, timeout);
        }
        
        const response = new Promise(function(resolve, reject) {
          pendingCalls[id] = { resolve: resolve, reject: reject, timeoutId: timeoutId };
        });

        transport.send(msg);

        return response;
      }
    }
  });

  const notifiers = new Proxy({}, {
    get: function(target, name) {

      return function (...args) {
        const msg = {
          jsonrpc : '2.0',
          method: name,
          params: args
        };
        transport.send(msg);
        return;
      }
    }
  });

  const notifications = new Proxy({}, {
    get: function(target, name) {
      return function (callback) {
        notificationEvents.on(name.substring(2), function(...args) {
          return callback.apply(callback, args);
        });
      }
    }
  });

  return { methods, addHandler, notifications, notifiers };

}

module.exports = rawr;
