define([
  'dojo/_base/lang',
  'dojo/_base/Deferred'
], function(lang, Deferred){

  var _callNum = 0;
  var _deferreds = {};

  var createRpcFunction = function(functionName, socket){
    return function(){
      var params = [],
        rpcObject,
        deferred;
      _callNum++;
      for (var i = 0; i < arguments.length; i++) {
        params.push(arguments[i]);
      }
      rpcObject = {
        method: functionName,
        params: params,
        id: _callNum
      };
      deferred = new Deferred();
      deferred.callNum = _callNum;
      _deferreds[_callNum] = deferred;
      socket.emit('rpc', rpcObject);
      return deferred;
    };
  };

  function client(sock){
      this.socket = sock;

      // Make sure we have a socket with send/emit and on
      if(!this.socket || !this.socket.on || (!this.socket.send || !this.socket.emit)){
        return console.warn('Must pass in a socket or an object with a socket property to this cosntructor. ex: {socket : mySocket}');
      }
      this.socket.emit = this.socket.emit || this.socket.send;

      this._readyDef = new Deferred();
      this._notificationHanlders = {};
      this.methods = {};

      this.addNotificationHandler = function(methodName, handlerFunction){
        this._notificationHanlders[methodName] = handlerFunction;
      };

      this.ready = function(readyHandler){
        this._readyDef.then(readyHandler);
      };


      // Make sure to hitch this because hitch is amazing -- and solves all your problems
      var smdHandler = lang.hitch(this, function(smdDefinition){
        if(smdDefinition && smdDefinition.services){
          for(var service in smdDefinition.services){
            this.methods[service] = createRpcFunction(service, this.socket);
          }
        }

        this._readyDef.callback();

      });

      var rpcCallback = lang.hitch(this, function(rpcObject){
        try{
          var id = rpcObject.id;
          if(id){
            if(_deferreds[id]){
              if(rpcObject.error){
                _deferreds[id].errback(rpcObject.error);
              } else {
                _deferreds[id].callback(rpcObject.result);
              }
              delete _deferreds[id];
            }
          }else{
            if(this.notificationHanlders[rpcObject.method]){
              this.notificationHanlders[rpcObject.method]();
            }
          }

        } catch(e){
          console.log('malformed rpc response', rpcObject, e);
        }
      });


      // Register the smd handler, then tell the server to send it
      this.socket.on('smd', smdHandler).emit('smd',{});

      // Register handler for any rpc repsonses from service
      this.socket.on('rpc', rpcCallback);
    }

    return client;

});