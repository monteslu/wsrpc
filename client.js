(function(factory){
  /*jshint strict:false */
  if(typeof define != "undefined"){
    define(['when'], factory);
  }else if(typeof module != "undefined"){
    module.exports = factory(require('when'));
  }else{
    Nodoze = factory();
  }
})(function(when){

  'use strict';

  function Rawr(socket){
    // Make sure we have a socket with send and on
    if(!(socket && (socket.on || socket.hasOwnProperty('onmessage')) && socket.send)){
      return console.warn('Must pass in a socket or an object with a socket property to this cosntructor. ex: {socket : mySocket}');
    }

    var self = this;
    var defer = when.defer();
    this.promise = defer.promise;
    this.then = defer.promise.then;
    this.socket = socket;
    this.methods = {};

    var _callNum = 0;
    var _deferreds = {};

    function generateRpc(name, socket){
      return function(){
        var deferred = when.defer();
        _deferreds[++_callNum] = deferred;
        socket.send(JSON.stringify({
          method: name,
          params: Array.prototype.slice.call(arguments),
          id: _callNum
        }));
        return deferred.promise;
      };
    }

    // TODO: implement notifications

    function smdHandler(smd){
      if(!(smd && smd.services)){
        return defer.reject('Malformed SMD - missing services');
      }

      for(var service in smd.services){
        self.methods[service] = generateRpc(service, self.socket);
      }

      return defer.resolve(self.methods);
    }

    function rpcHandler(rpc){
      if(!(rpc.id && (rpc.error || rpc.result))){
        return;
      }

      var id = rpc.id;
      if(_deferreds[id]){
        var defer = _deferreds[id];
        if(rpc.error){
          defer.reject(rpc.error);
        } else {
          defer.resolve(rpc.result);
        }
        delete _deferreds[id];
      }
    }

      function handleMessage(data){
        if(data.smd){
          smdHandler(data.smd);
        } else {
          rpcHandler(data);
        }
      }

      if(!this.socket.on){
        this.socket.addEventListener('message', function(evt){
          var data = JSON.parse(evt.data);
          handleMessage(data);
        });
      } else {
        this.socket.on('message', function(data){
          data = JSON.parse(data);
          handleMessage(data);
        });
      }

    }

    return Rawr;

});
