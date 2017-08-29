'use strict';

var chai = require('chai');
var EventEmitter = require('events').EventEmitter;

chai.should();

var rawr = require('../');

function helloTest(name) {
  if(name === 'bad') {
    throw new Error('bad name !');
  }
  return 'hello, ' + name;
}

function mockSockets() {
  var clientEE = new EventEmitter();
  var serverEE = new EventEmitter();

  var client = {
    send: function(data) {
      serverEE.emit('message', data);
    }
  };
  var server = {
    send: function(data) {
      clientEE.emit('message', data);
    }
  };

  serverEE.on('message', function(data) {
    if(server.onmessage) {
      server.onmessage({data: data});
    }
  });

  clientEE.on('message', function(data) {
    if(client.onmessage) {
      client.onmessage({data: data});
    }
  });

  return {
    client: client,
    server: server
  };
}

describe('rawr', function(){

  it('should make a client', function(done){
    var sendEE = new EventEmitter();
    var client = rawr.init({sendEmitter: sendEE});
    client.should.be.a('object');
    client.rpc.should.be.a('function');
    client.addMethod.should.be.a('function');
    done();
  });


  it('client should make a successful rpc call to a server', function(done){
    var clientSendEE = new EventEmitter();
    var serverSendEE = new EventEmitter();
    var client = rawr.init({sendEmitter: clientSendEE, receiveEmitter: serverSendEE});
    var server = rawr.init({sendEmitter: serverSendEE, receiveEmitter: clientSendEE});

    server.addMethod('hello', helloTest);

    client.rpc('hello', 'luis')
      .then(function(result) {
        result.should.equal('hello, luis');
        done();
      });

  });

  it('client should make an unsuccessful rpc call to a server', function(done){
    var clientSendEE = new EventEmitter();
    var serverSendEE = new EventEmitter();
    var client = rawr.init({sendEmitter: clientSendEE, receiveEmitter: serverSendEE});
    var server = rawr.init({sendEmitter: serverSendEE, receiveEmitter: clientSendEE});

    server.addMethod('hello', helloTest);

    client.rpc('hello', 'bad')
      .catch(function(error) {
        done();
      });

  });

  it('client handle an rpc timeout', function(done){
    var clientSendEE = new EventEmitter();
    var client = rawr.init({sendEmitter: clientSendEE, timeout: 100});

    client.rpc('hello', 'bad')
      .catch(function(error) {
        done();
      });

  });

  it('client should be able to send a notification to a server', function(done){
    var sendEE = new EventEmitter();
    var client = rawr.init({sendEmitter: sendEE});
    var server = rawr.init({receiveEmitter: sendEE});

    server.notifications.on('yo', function(who, when) {
      who.should.equal('dawg');
      when.should.equal('now');
      done();
    });

    client.notify('yo', 'dawg', 'now');

  });



  it('client should make a successful rpc call to a server via ws send()', function(done){

    var mocks = mockSockets();

    var clientWS = mocks.client;
    var serverWS = mocks.server;

    var client = rawr.init({sendEmitter: rawr.createWsSender(clientWS), receiveEmitter: rawr.createWsReceiver(clientWS)});
    var server = rawr.init({sendEmitter: rawr.createWsSender(serverWS), receiveEmitter: rawr.createWsReceiver(serverWS)});

    server.addMethod('hello', helloTest);

    client.rpc('hello', 'luis')
      .then(function(result) {
        result.should.equal('hello, luis');
        server.notify('yo', 'dawg', 'now');
      });

    client.notifications.on('yo', function(who, when) {
      who.should.equal('dawg');
      when.should.equal('now');
      done();
    });




  });



});
