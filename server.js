(function(define){
  'use strict';

  define(function(require){

    var whenfn = require('when/function');

    function Rawr(server, funcs){
      var sockets = server.sockets ? server.sockets : server;

      this.functions = funcs || Rawr.prototype.functions;

      var self = this;

      sockets.on('connection', function (socket) {

        // Generate the SMD and send it on connection
        for(var func in self.functions){
          self.smd.services[func] = {};
        }
        socket.send(JSON.stringify({smd: self.smd}));

        // On rpc call, execute the function
        socket.on('message', function(data){
          function onSuccess(result){
            socket.send(JSON.stringify({
              result: result,
              error: null,
              id: data.id
            }));
          }

          function onError(error){
            error = error.message || error;
            socket.send(JSON.stringify({
              result: null,
              error: error,
              id: data.id
            }));
          }

          data = JSON.parse(data);

          if(self.functions[data.method]){
            whenfn.apply(self.functions[data.method], data.params).then(onSuccess, onError);
          } else {
            onError('method undefined');
          }

        });

      });
    }

    Rawr.prototype.functions = {};

    Rawr.prototype.smd = {
      target:"/jsonrpc", // this defines the URL to connect for the services
      transport:"POST", // We will use POST as the transport
      envelope:"JSON-RPC-1.0", // We will use JSON-RPC
      SMDVersion:"2.0",
      services: {}
    };

    return Rawr;

  });

}(
  typeof define === 'function' && define.amd ? define : function (factory) { module.exports = factory(require); }
  // Boilerplate for AMD and Node
));
