/**
 * Based on rest.js 1.0.0 <https://github.com/cujojs/rest>
 * Copyright 2012-2013 the original author or authors
 **/
(function(define, process){
  'use strict';

  define(function(require){

    // test if we are in node
    if(process && process.versions && process.versions.node){
      // build tools only parse require with strings, not variables
      var moduleId = './server';
      return require(moduleId);
    }

    return require('./client');

  });

}(
  typeof define === 'function' && define.amd ? define : function (factory) { module.exports = factory(require); },
  typeof process === 'undefined' ? undefined : process
  // Boilerplate for AMD and Node
));
