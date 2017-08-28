var events = require('events');
var base64 = require("base64-url");
var uuidV4 = require('uuid/v4');

var createNotifier = require('./notifier');

function generateId() {
  var id = uuidV4();
  id = new Buffer(id.replace(/\-/g, ''), 'hex');
  return base64.encode(id);
}

function createClient(options) {
  var pendingCalls = {};
  var notifications = new events.EventEmitter();
  var sendEmitter = options.sendEmitter;
  var sendTopic = options.sendTopic;
  if(!sendTopic && sendEmitter) {
    sendTopic = sendEmitter.rawrTopic;
  }
  if(!sendTopic) {
    sendTopic = 'rpcCall';
  }
  var receiveEmitter = options.receiveEmitter || sendEmitter;
  var receiveTopic = options.receiveTopic || 'rpcResult';
  var timeout = options.timeout || 10000;

  receiveEmitter.on(receiveTopic, function(msg) {
    if(typeof msg === 'string') {
      msg = JSON.parse(msg);
    }
    if(msg.id) {
      var promise = pendingCalls[msg.id];
      if(promise) {
        clearTimeout(promise.timeoutId);
        delete pendingCalls[msg.id];
        if (msg.error) {
          promise.reject(msg.error);
        }
        else {
          promise.resolve(msg.result);
        }
      }
    }
    else {
      msg.params.unshift(msg.method);
      notifications.emit.apply(notifications, msg.params);
    }

  });

  function rpc(methodName) {
    var id = generateId();
    var msg = {
      method: methodName,
      params: Array.prototype.slice.call(arguments, 1, arguments.length),
      id: id
    };

    var timeoutId = setTimeout(function() {
      if(pendingCalls[id]) {
        pendingCalls[id].reject('Timeout');
        delete pendingCalls[id];
      }
    }, timeout);

    var response = new Promise(function(resolve, reject) {
      pendingCalls[id] = { resolve: resolve, reject: reject, timeoutId: timeoutId };
    });

    sendEmitter.emit(sendTopic, msg);

    return response;
  }

  var notify = createNotifier(sendEmitter, sendTopic);

  return { rpc: rpc, notifications: notifications, notify: notify };

}

module.exports = createClient;
