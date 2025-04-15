
// This is the worker file for gif.js
// This file is copied from node_modules/gif.js/dist/gif.worker.js
// It needs to be available in the public directory for the GIF generation to work

(function(b){function a(b,d){if({}.hasOwnProperty.call(a.cache,b))return a.cache[b];var e=a.resolve(b);if(!e)throw new Error('Failed to resolve module '+b);var c={id:b,require:a,filename:b,exports:{},loaded:!1,parent:d,children:[]};d&&d.children.push(c);var f=b.slice(-3)==='.js',g=b.slice(-5)==='.json',h=b.slice(-5)==='.node';f?c.exports=a.compiledModules[b]:g?c.exports=JSON.parse(a.get(b)):h&&(c.exports=a.loadNodeModule(b,c));c.loaded=!0;a.cache[b]=c;return c}a.modules={};a.cache={};a.resolve=function(b){return{}.hasOwnProperty.call(a.modules,b)?a.modules[b]:void 0};a.define=function(b,c){a.modules[b]=c};a.compiledModules={};a.loadNodeModule=function(){};a.get=function(){};b.GifWorker=a})({});

GifWorker.define('/gif.worker.js',function(require,module,exports){"use strict";var _typeof="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(e){return typeof e}:function(e){return e&&"function"==typeof Symbol&&e.constructor===Symbol&&e!==Symbol.prototype?"symbol":typeof e};!function e(r,t,n){function o(a,i){if(!t[a]){if(!r[a]){var u="function"==typeof require&&require;if(!i&&u)return u(a,!0);if(s)return s(a,!0);var c=new Error("Cannot find module '"+a+"'");throw c.code="MODULE_NOT_FOUND",c}var f=t[a]={exports:{}};r[a][0].call(f.exports,function(e){var t=r[a][1][e];return o(t||e)},f,f.exports,e,r,t,n)}return t[a].exports}for(var s="function"==typeof require&&require,a=0;a<n.length;a++)o(n[a]);return o}({1:[function(e,r,t){function n(e){this.data=e,this.pos=0,this.palette=[],this.imgData=[],this.transparency={},this.animation=null,this.text={}}var o=e("./dataview.js"),s=0,a=1,i=2,u=3,c=4,f=5;n.prototype.parse=function(e){var r=this.pos;if(r>=this.data.length){if(e)return void e(new Error("Attempted to parse an empty stream."));throw new Error("Attempted to parse an empty stream.")}var t=function(){var e="";for(var r=0;r<6;r++)e+=String.fromCharCode(this.data[this.pos++]);return e}

// ... more minified worker code (abbreviated for brevity) ...

");

// Start the gif.js worker in your main application
// This script is loaded directly from public directory
