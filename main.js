define([

], function(){

  var getSMD = function(){
    var smd = {
      target:"/jsonrpc", // this defines the URL to connect for the services
      transport:"POST", // We will use POST as the transport
      envelope:"JSON-RPC-1.0", // We will use JSON-RPC
      SMDVersion:"2.0",
      services: {}
    };

    for(var func in rpcFunctions){
      smd.services[func] = {};
    }
    return smd;
  };

  var WsRpc = function(){
    this.rpcFunctions = {};
    this.listen = function(io){
      io.sockets.on('connection', function (socket) {

        console.log('newsocket',socket);

        socket.on('rpc',function(rpc){
          console.log('rpc obj: ',rpc);
          if(this.rpcFunctions[rpc.method]){
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
              this.rpcFunctions[rpc.method].apply({
                resultCB: function(result){
                  socket.emit('rpc',{result: result, error: null, id: rpc.id});
                },
                errorCB: function(error){
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
          socket.emit('smd',getSMD());
        });

      });

    };
  };

  return WsRpc;
});