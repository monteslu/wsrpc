# rawr (a.k.a. RAWRpc)

[![NPM](https://nodei.co/npm/rawr.png?compact=true)](https://nodei.co/npm/rawr/)

[![Build Status](https://travis-ci.org/iceddev/rawr.svg?branch=master)](https://travis-ci.org/iceddev/rawr) [![Coverage Status](https://coveralls.io/repos/iceddev/rawr/badge.svg?branch=master)](https://coveralls.io/r/iceddev/rawr?branch=master)



Remote Procedure Calls ([JSON-RPC](http://json-rpc.org/wiki/specification)) sent over any [EventEmitter](https://nodejs.org/dist/latest-v8.x/docs/api/events.html#events_class_eventemitter) transport.

![RAWRpc](https://rawgithub.com/phated/badart/master/reptar_rawr.jpg)




## Installation

`npm install rawr`

## Using the RPC client

```javascript
var createClient = require('rawr/client');

var client = createClient({
  sendEmitter : anEventEmitter,
  sendTopic : 'rpcCall',
  receiveEmitter : anEventEmitter,
  receiveTopic : 'rpcResponse',
  timeout: 5000 // timeout the call after 5 seconds, default is 10
});

// call an rpc method with a parameter and get a promise:
client.rpc('talk', 'luis')
  .then(function(result) {
    console.log(result); // prints 'hello, luis'
  });

```


## Making an RPC server

```javascript
var createServer = require('rawr/server');

var server = createServer({
  sendEmitter : anEventEmitter,
  sendTopic : 'rpcResponse', // the opposite of client
  receiveEmitter : anEventEmitter,
  receiveTopic : 'rpcCall' // the opposite of the client
});

function talkToMe(name) {
  // could return a value, a promise, or throw an error
  return 'hello, ' + name;
}

server.addMethod('talk', talkToMe);

```

## Handling Notifications

Both the client and server can send each other notifications

From the server:
```javascript

client.notifications.on('yo', function(who) {
  console.log(who); //prints 'dawg'
});

server.notify('yo', 'dawg');

```

OR

From the client:
```javascript

server.notifications.on('yo', function(who) {
  console.log(who); //prints 'dawg'
});

client.notify('yo', 'dawg');

```
