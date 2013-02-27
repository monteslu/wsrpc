define([

], function(lang){

  var WsRpc = {
    functions : {},
    listen : function(io){
      //var rpcLib = this; //socket.io events change scope in callbacks
      io.sockets.on('connection', function (socket) {

        socket.on('rpc',function(rpc){
          console.log('rpc obj: ',rpc);
          if(WsRpc.functions[rpc.method]){
            var retVal;
            var error;
            try{
              var params = [];
              if(rpc.params && rpc.params.length){
                for(var i = 0; i < rpc.params.length; i++){
                  console.log('adding param: ', i, rpc.params[i]);
                  params.push(rpc.params[i]);
                }
              }
              WsRpc.functions[rpc.method].apply({
                respond: function(result){
                  socket.emit('rpc',{result: result, error: null, id: rpc.id});
                },
                error: function(error){
                  socket.emit('rpc',{result: null, error: error, id: rpc.id});
                },
                socket: socket

                },params);
            }catch(e){
              socket.emit('rpc',{result: null, error: {'rpcError':e}, id: rpc.id});
            }
          }else{
            socket.emit('rpc',{result: null, error: 'method undefined', id: rpc.id});
          }

        });

        socket.on('smd',function(rpc){
          var smd = {
            target:"/jsonrpc", // this defines the URL to connect for the services
            transport:"POST", // We will use POST as the transport
            envelope:"JSON-RPC-1.0", // We will use JSON-RPC
            SMDVersion:"2.0",
            services: {}
          };

          for(var func in WsRpc.functions){
            smd.services[func] = {};
          }
          socket.emit('smd',smd);
        });

      });

      return this;
    }
  };

  return WsRpc;
});