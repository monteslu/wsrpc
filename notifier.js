
function createNotifier(sendEmitter, sendTopic){
  return function notify(methodName) {
    var msg = {
      method: methodName,
      params: Array.prototype.slice.call(arguments, 1, arguments.length),
      id: null
    };
    sendEmitter.emit(sendTopic, msg);
  }
}

module.exports = createNotifier;
