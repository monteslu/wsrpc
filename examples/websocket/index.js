const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const rawr = require('rawr');
const app = express();

app.use(express.static('public'));

const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

function add(x, y) {
  return x + y;
}

wss.on('connection', function connection(ws, req) {

  var server = rawr.init({
    sendEmitter: rawr.createWsSender(ws),
    receiveEmitter: ws,
    receiveTopic: 'message'
  });

  server.addMethod('add', add);

});


server.listen(8080, function listening() {
  console.log('Listening on %d', server.address().port);
});
