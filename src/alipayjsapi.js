/*
 * @Description: In User Settings Edit
 * @Author: your name
 * @Date: 2019-08-18 19:36:14
 * @LastEditTime: 2019-08-18 19:51:27
 * @LastEditors: Please set LastEditors
 */
/**
 * AlipayJSAPI
 * @author wangyou.ly
 * @version 3.1.1
 * @todo
 **/
;(function (self) {

    function PromisePolyfillImpl() {
      /*!
   * @overview es6-promise - a tiny implementation of Promises/A+.
   * @copyright Copyright (c) 2014 Yehuda Katz, Tom Dale, Stefan Penner and contributors (Conversion to ES6 API by Jake Archibald)
   * @license   Licensed under MIT license
   *            See https://raw.githubusercontent.com/stefanpenner/es6-promise/master/LICENSE
   * @version   4.1.0+f9a5575b
   */
  
  (function (global, factory) {
      typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
      typeof define === 'function' && define.amd ? define(factory) :
      (global.ES6Promise = factory());
  }(this, (function () { 'use strict';
  
  function objectOrFunction(x) {
    return typeof x === 'function' || typeof x === 'object' && x !== null;
  }
  
  function isFunction(x) {
    return typeof x === 'function';
  }
  
  var _isArray = undefined;
  if (!Array.isArray) {
    _isArray = function (x) {
      return Object.prototype.toString.call(x) === '[object Array]';
    };
  } else {
    _isArray = Array.isArray;
  }
  
  var isArray = _isArray;
  
  var len = 0;
  var vertxNext = undefined;
  var customSchedulerFn = undefined;
  
  var asap = function asap(callback, arg) {
    queue[len] = callback;
    queue[len + 1] = arg;
    len += 2;
    if (len === 2) {
      // If len is 2, that means that we need to schedule an async flush.
      // If additional callbacks are queued before the queue is flushed, they
      // will be processed by this flush that we are scheduling.
      if (customSchedulerFn) {
        customSchedulerFn(flush);
      } else {
        scheduleFlush();
      }
    }
  };
  
  function setScheduler(scheduleFn) {
    customSchedulerFn = scheduleFn;
  }
  
  function setAsap(asapFn) {
    asap = asapFn;
  }
  
  var browserWindow = typeof window !== 'undefined' ? window : undefined;
  var browserGlobal = browserWindow || {};
  var BrowserMutationObserver = browserGlobal.MutationObserver || browserGlobal.WebKitMutationObserver;
  var isNode = typeof self === 'undefined' && typeof process !== 'undefined' && ({}).toString.call(process) === '[object process]';
  
  // test for web worker but not in IE10
  var isWorker = typeof Uint8ClampedArray !== 'undefined' && typeof importScripts !== 'undefined' && typeof MessageChannel !== 'undefined';
  
  // node
  function useNextTick() {
    // node version 0.10.x displays a deprecation warning when nextTick is used recursively
    // see https://github.com/cujojs/when/issues/410 for details
    return function () {
      return process.nextTick(flush);
    };
  }
  
  // vertx
  function useVertxTimer() {
    if (typeof vertxNext !== 'undefined') {
      return function () {
        vertxNext(flush);
      };
    }
  
    return useSetTimeout();
  }
  
  function useMutationObserver() {
    var iterations = 0;
    var observer = new BrowserMutationObserver(flush);
    var node = document.createTextNode('');
    observer.observe(node, { characterData: true });
  
    return function () {
      node.data = iterations = ++iterations % 2;
    };
  }
  
  // web worker
  function useMessageChannel() {
    var channel = new MessageChannel();
    channel.port1.onmessage = flush;
    return function () {
      return channel.port2.postMessage(0);
    };
  }
  
  function useSetTimeout() {
    // Store setTimeout reference so es6-promise will be unaffected by
    // other code modifying setTimeout (like sinon.useFakeTimers())
    var globalSetTimeout = setTimeout;
    return function () {
      return globalSetTimeout(flush, 1);
    };
  }
  
  var queue = new Array(1000);
  function flush() {
    for (var i = 0; i < len; i += 2) {
      var callback = queue[i];
      var arg = queue[i + 1];
  
      callback(arg);
  
      queue[i] = undefined;
      queue[i + 1] = undefined;
    }
  
    len = 0;
  }
  
  function attemptVertx() {
    try {
      var r = require;
      var vertx = r('vertx');
      vertxNext = vertx.runOnLoop || vertx.runOnContext;
      return useVertxTimer();
    } catch (e) {
      return useSetTimeout();
    }
  }
  
  var scheduleFlush = undefined;
  // Decide what async method to use to triggering processing of queued callbacks:
  if (isNode) {
    scheduleFlush = useNextTick();
  } else if (BrowserMutationObserver) {
    scheduleFlush = useMutationObserver();
  } else if (isWorker) {
    scheduleFlush = useMessageChannel();
  } else if (browserWindow === undefined && typeof require === 'function') {
    scheduleFlush = attemptVertx();
  } else {
    scheduleFlush = useSetTimeout();
  }
  
  function then(onFulfillment, onRejection) {
    var _arguments = arguments;
  
    var parent = this;
  
    var child = new this.constructor(noop);
  
    if (child[PROMISE_ID] === undefined) {
      makePromise(child);
    }
  
    var _state = parent._state;
  
    if (_state) {
      (function () {
        var callback = _arguments[_state - 1];
        asap(function () {
          return invokeCallback(_state, child, callback, parent._result);
        });
      })();
    } else {
      subscribe(parent, child, onFulfillment, onRejection);
    }
  
    return child;
  }
  
  /**
    `Promise.resolve` returns a promise that will become resolved with the
    passed `value`. It is shorthand for the following:
  
    ```javascript
    let promise = new Promise(function(resolve, reject){
      resolve(1);
    });
  
    promise.then(function(value){
      // value === 1
    });
    ```
  
    Instead of writing the above, your code now simply becomes the following:
  
    ```javascript
    let promise = Promise.resolve(1);
  
    promise.then(function(value){
      // value === 1
    });
    ```
  
    @method resolve
    @static
    @param {Any} value value that the returned promise will be resolved with
    Useful for tooling.
    @return {Promise} a promise that will become fulfilled with the given
    `value`
  */
  function resolve(object) {
    /*jshint validthis:true */
    var Constructor = this;
  
    if (object && typeof object === 'object' && object.constructor === Constructor) {
      return object;
    }
  
    var promise = new Constructor(noop);
    _resolve(promise, object);
    return promise;
  }
  
  var PROMISE_ID = Math.random().toString(36).substring(16);
  
  function noop() {}
  
  var PENDING = void 0;
  var FULFILLED = 1;
  var REJECTED = 2;
  
  var GET_THEN_ERROR = new ErrorObject();
  
  function selfFulfillment() {
    return new TypeError("You cannot resolve a promise with itself");
  }
  
  function cannotReturnOwn() {
    return new TypeError('A promises callback cannot return that same promise.');
  }
  
  function getThen(promise) {
    try {
      return promise.then;
    } catch (error) {
      GET_THEN_ERROR.error = error;
      return GET_THEN_ERROR;
    }
  }
  
  function tryThen(then, value, fulfillmentHandler, rejectionHandler) {
    try {
      then.call(value, fulfillmentHandler, rejectionHandler);
    } catch (e) {
      return e;
    }
  }
  
  function handleForeignThenable(promise, thenable, then) {
    asap(function (promise) {
      var sealed = false;
      var error = tryThen(then, thenable, function (value) {
        if (sealed) {
          return;
        }
        sealed = true;
        if (thenable !== value) {
          _resolve(promise, value);
        } else {
          fulfill(promise, value);
        }
      }, function (reason) {
        if (sealed) {
          return;
        }
        sealed = true;
  
        _reject(promise, reason);
      }, 'Settle: ' + (promise._label || ' unknown promise'));
  
      if (!sealed && error) {
        sealed = true;
        _reject(promise, error);
      }
    }, promise);
  }
  
  function handleOwnThenable(promise, thenable) {
    if (thenable._state === FULFILLED) {
      fulfill(promise, thenable._result);
    } else if (thenable._state === REJECTED) {
      _reject(promise, thenable._result);
    } else {
      subscribe(thenable, undefined, function (value) {
        return _resolve(promise, value);
      }, function (reason) {
        return _reject(promise, reason);
      });
    }
  }
  
  function handleMaybeThenable(promise, maybeThenable, then$) {
    if (maybeThenable.constructor === promise.constructor && then$ === then && maybeThenable.constructor.resolve === resolve) {
      handleOwnThenable(promise, maybeThenable);
    } else {
      if (then$ === GET_THEN_ERROR) {
        _reject(promise, GET_THEN_ERROR.error);
        GET_THEN_ERROR.error = null;
      } else if (then$ === undefined) {
        fulfill(promise, maybeThenable);
      } else if (isFunction(then$)) {
        handleForeignThenable(promise, maybeThenable, then$);
      } else {
        fulfill(promise, maybeThenable);
      }
    }
  }
  
  function _resolve(promise, value) {
    if (promise === value) {
      _reject(promise, selfFulfillment());
    } else if (objectOrFunction(value)) {
      handleMaybeThenable(promise, value, getThen(value));
    } else {
      fulfill(promise, value);
    }
  }
  
  function publishRejection(promise) {
    if (promise._onerror) {
      promise._onerror(promise._result);
    }
  
    publish(promise);
  }
  
  function fulfill(promise, value) {
    if (promise._state !== PENDING) {
      return;
    }
  
    promise._result = value;
    promise._state = FULFILLED;
  
    if (promise._subscribers.length !== 0) {
      asap(publish, promise);
    }
  }
  
  function _reject(promise, reason) {
    if (promise._state !== PENDING) {
      return;
    }
    promise._state = REJECTED;
    promise._result = reason;
  
    asap(publishRejection, promise);
  }
  
  function subscribe(parent, child, onFulfillment, onRejection) {
    var _subscribers = parent._subscribers;
    var length = _subscribers.length;
  
    parent._onerror = null;
  
    _subscribers[length] = child;
    _subscribers[length + FULFILLED] = onFulfillment;
    _subscribers[length + REJECTED] = onRejection;
  
    if (length === 0 && parent._state) {
      asap(publish, parent);
    }
  }
  
  function publish(promise) {
    var subscribers = promise._subscribers;
    var settled = promise._state;
  
    if (subscribers.length === 0) {
      return;
    }
  
    var child = undefined,
        callback = undefined,
        detail = promise._result;
  
    for (var i = 0; i < subscribers.length; i += 3) {
      child = subscribers[i];
      callback = subscribers[i + settled];
  
      if (child) {
        invokeCallback(settled, child, callback, detail);
      } else {
        callback(detail);
      }
    }
  
    promise._subscribers.length = 0;
  }
  
  function ErrorObject() {
    this.error = null;
  }
  
  var TRY_CATCH_ERROR = new ErrorObject();
  
  function tryCatch(callback, detail) {
    try {
      return callback(detail);
    } catch (e) {
      TRY_CATCH_ERROR.error = e;
      return TRY_CATCH_ERROR;
    }
  }
  
  function invokeCallback(settled, promise, callback, detail) {
    var hasCallback = isFunction(callback),
        value = undefined,
        error = undefined,
        succeeded = undefined,
        failed = undefined;
  
    if (hasCallback) {
      value = tryCatch(callback, detail);
  
      if (value === TRY_CATCH_ERROR) {
        failed = true;
        error = value.error;
        value.error = null;
      } else {
        succeeded = true;
      }
  
      if (promise === value) {
        _reject(promise, cannotReturnOwn());
        return;
      }
    } else {
      value = detail;
      succeeded = true;
    }
  
    if (promise._state !== PENDING) {
      // noop
    } else if (hasCallback && succeeded) {
        _resolve(promise, value);
      } else if (failed) {
        _reject(promise, error);
      } else if (settled === FULFILLED) {
        fulfill(promise, value);
      } else if (settled === REJECTED) {
        _reject(promise, value);
      }
  }
  
  function initializePromise(promise, resolver) {
    try {
      resolver(function resolvePromise(value) {
        _resolve(promise, value);
      }, function rejectPromise(reason) {
        _reject(promise, reason);
      });
    } catch (e) {
      _reject(promise, e);
    }
  }
  
  var id = 0;
  function nextId() {
    return id++;
  }
  
  function makePromise(promise) {
    promise[PROMISE_ID] = id++;
    promise._state = undefined;
    promise._result = undefined;
    promise._subscribers = [];
  }
  
  function Enumerator(Constructor, input) {
    this._instanceConstructor = Constructor;
    this.promise = new Constructor(noop);
  
    if (!this.promise[PROMISE_ID]) {
      makePromise(this.promise);
    }
  
    if (isArray(input)) {
      this._input = input;
      this.length = input.length;
      this._remaining = input.length;
  
      this._result = new Array(this.length);
  
      if (this.length === 0) {
        fulfill(this.promise, this._result);
      } else {
        this.length = this.length || 0;
        this._enumerate();
        if (this._remaining === 0) {
          fulfill(this.promise, this._result);
        }
      }
    } else {
      _reject(this.promise, validationError());
    }
  }
  
  function validationError() {
    return new Error('Array Methods must be provided an Array');
  };
  
  Enumerator.prototype._enumerate = function () {
    var length = this.length;
    var _input = this._input;
  
    for (var i = 0; this._state === PENDING && i < length; i++) {
      this._eachEntry(_input[i], i);
    }
  };
  
  Enumerator.prototype._eachEntry = function (entry, i) {
    var c = this._instanceConstructor;
    var resolve$ = c.resolve;
  
    if (resolve$ === resolve) {
      var _then = getThen(entry);
  
      if (_then === then && entry._state !== PENDING) {
        this._settledAt(entry._state, i, entry._result);
      } else if (typeof _then !== 'function') {
        this._remaining--;
        this._result[i] = entry;
      } else if (c === Promise) {
        var promise = new c(noop);
        handleMaybeThenable(promise, entry, _then);
        this._willSettleAt(promise, i);
      } else {
        this._willSettleAt(new c(function (resolve$) {
          return resolve$(entry);
        }), i);
      }
    } else {
      this._willSettleAt(resolve$(entry), i);
    }
  };
  
  Enumerator.prototype._settledAt = function (state, i, value) {
    var promise = this.promise;
  
    if (promise._state === PENDING) {
      this._remaining--;
  
      if (state === REJECTED) {
        _reject(promise, value);
      } else {
        this._result[i] = value;
      }
    }
  
    if (this._remaining === 0) {
      fulfill(promise, this._result);
    }
  };
  
  Enumerator.prototype._willSettleAt = function (promise, i) {
    var enumerator = this;
  
    subscribe(promise, undefined, function (value) {
      return enumerator._settledAt(FULFILLED, i, value);
    }, function (reason) {
      return enumerator._settledAt(REJECTED, i, reason);
    });
  };
  
  /**
    `Promise.all` accepts an array of promises, and returns a new promise which
    is fulfilled with an array of fulfillment values for the passed promises, or
    rejected with the reason of the first passed promise to be rejected. It casts all
    elements of the passed iterable to promises as it runs this algorithm.
  
    Example:
  
    ```javascript
    let promise1 = resolve(1);
    let promise2 = resolve(2);
    let promise3 = resolve(3);
    let promises = [ promise1, promise2, promise3 ];
  
    Promise.all(promises).then(function(array){
      // The array here would be [ 1, 2, 3 ];
    });
    ```
  
    If any of the `promises` given to `all` are rejected, the first promise
    that is rejected will be given as an argument to the returned promises's
    rejection handler. For example:
  
    Example:
  
    ```javascript
    let promise1 = resolve(1);
    let promise2 = reject(new Error("2"));
    let promise3 = reject(new Error("3"));
    let promises = [ promise1, promise2, promise3 ];
  
    Promise.all(promises).then(function(array){
      // Code here never runs because there are rejected promises!
    }, function(error) {
      // error.message === "2"
    });
    ```
  
    @method all
    @static
    @param {Array} entries array of promises
    @param {String} label optional string for labeling the promise.
    Useful for tooling.
    @return {Promise} promise that is fulfilled when all `promises` have been
    fulfilled, or rejected if any of them become rejected.
    @static
  */
  function all(entries) {
    return new Enumerator(this, entries).promise;
  }
  
  /**
    `Promise.race` returns a new promise which is settled in the same way as the
    first passed promise to settle.
  
    Example:
  
    ```javascript
    let promise1 = new Promise(function(resolve, reject){
      setTimeout(function(){
        resolve('promise 1');
      }, 200);
    });
  
    let promise2 = new Promise(function(resolve, reject){
      setTimeout(function(){
        resolve('promise 2');
      }, 100);
    });
  
    Promise.race([promise1, promise2]).then(function(result){
      // result === 'promise 2' because it was resolved before promise1
      // was resolved.
    });
    ```
  
    `Promise.race` is deterministic in that only the state of the first
    settled promise matters. For example, even if other promises given to the
    `promises` array argument are resolved, but the first settled promise has
    become rejected before the other promises became fulfilled, the returned
    promise will become rejected:
  
    ```javascript
    let promise1 = new Promise(function(resolve, reject){
      setTimeout(function(){
        resolve('promise 1');
      }, 200);
    });
  
    let promise2 = new Promise(function(resolve, reject){
      setTimeout(function(){
        reject(new Error('promise 2'));
      }, 100);
    });
  
    Promise.race([promise1, promise2]).then(function(result){
      // Code here never runs
    }, function(reason){
      // reason.message === 'promise 2' because promise 2 became rejected before
      // promise 1 became fulfilled
    });
    ```
  
    An example real-world use case is implementing timeouts:
  
    ```javascript
    Promise.race([ajax('foo.json'), timeout(5000)])
    ```
  
    @method race
    @static
    @param {Array} promises array of promises to observe
    Useful for tooling.
    @return {Promise} a promise which settles in the same way as the first passed
    promise to settle.
  */
  function race(entries) {
    /*jshint validthis:true */
    var Constructor = this;
  
    if (!isArray(entries)) {
      return new Constructor(function (_, reject) {
        return reject(new TypeError('You must pass an array to race.'));
      });
    } else {
      return new Constructor(function (resolve, reject) {
        var length = entries.length;
        for (var i = 0; i < length; i++) {
          Constructor.resolve(entries[i]).then(resolve, reject);
        }
      });
    }
  }
  
  /**
    `Promise.reject` returns a promise rejected with the passed `reason`.
    It is shorthand for the following:
  
    ```javascript
    let promise = new Promise(function(resolve, reject){
      reject(new Error('WHOOPS'));
    });
  
    promise.then(function(value){
      // Code here doesn't run because the promise is rejected!
    }, function(reason){
      // reason.message === 'WHOOPS'
    });
    ```
  
    Instead of writing the above, your code now simply becomes the following:
  
    ```javascript
    let promise = Promise.reject(new Error('WHOOPS'));
  
    promise.then(function(value){
      // Code here doesn't run because the promise is rejected!
    }, function(reason){
      // reason.message === 'WHOOPS'
    });
    ```
  
    @method reject
    @static
    @param {Any} reason value that the returned promise will be rejected with.
    Useful for tooling.
    @return {Promise} a promise rejected with the given `reason`.
  */
  function reject(reason) {
    /*jshint validthis:true */
    var Constructor = this;
    var promise = new Constructor(noop);
    _reject(promise, reason);
    return promise;
  }
  
  function needsResolver() {
    throw new TypeError('You must pass a resolver function as the first argument to the promise constructor');
  }
  
  function needsNew() {
    throw new TypeError("Failed to construct 'Promise': Please use the 'new' operator, this object constructor cannot be called as a function.");
  }
  
  /**
    Promise objects represent the eventual result of an asynchronous operation. The
    primary way of interacting with a promise is through its `then` method, which
    registers callbacks to receive either a promise's eventual value or the reason
    why the promise cannot be fulfilled.
  
    Terminology
    -----------
  
    - `promise` is an object or function with a `then` method whose behavior conforms to this specification.
    - `thenable` is an object or function that defines a `then` method.
    - `value` is any legal JavaScript value (including undefined, a thenable, or a promise).
    - `exception` is a value that is thrown using the throw statement.
    - `reason` is a value that indicates why a promise was rejected.
    - `settled` the final resting state of a promise, fulfilled or rejected.
  
    A promise can be in one of three states: pending, fulfilled, or rejected.
  
    Promises that are fulfilled have a fulfillment value and are in the fulfilled
    state.  Promises that are rejected have a rejection reason and are in the
    rejected state.  A fulfillment value is never a thenable.
  
    Promises can also be said to *resolve* a value.  If this value is also a
    promise, then the original promise's settled state will match the value's
    settled state.  So a promise that *resolves* a promise that rejects will
    itself reject, and a promise that *resolves* a promise that fulfills will
    itself fulfill.
  
  
    Basic Usage:
    ------------
  
    ```js
    let promise = new Promise(function(resolve, reject) {
      // on success
      resolve(value);
  
      // on failure
      reject(reason);
    });
  
    promise.then(function(value) {
      // on fulfillment
    }, function(reason) {
      // on rejection
    });
    ```
  
    Advanced Usage:
    ---------------
  
    Promises shine when abstracting away asynchronous interactions such as
    `XMLHttpRequest`s.
  
    ```js
    function getJSON(url) {
      return new Promise(function(resolve, reject){
        let xhr = new XMLHttpRequest();
  
        xhr.open('GET', url);
        xhr.onreadystatechange = handler;
        xhr.responseType = 'json';
        xhr.setRequestHeader('Accept', 'application/json');
        xhr.send();
  
        function handler() {
          if (this.readyState === this.DONE) {
            if (this.status === 200) {
              resolve(this.response);
            } else {
              reject(new Error('getJSON: `' + url + '` failed with status: [' + this.status + ']'));
            }
          }
        };
      });
    }
  
    getJSON('/posts.json').then(function(json) {
      // on fulfillment
    }, function(reason) {
      // on rejection
    });
    ```
  
    Unlike callbacks, promises are great composable primitives.
  
    ```js
    Promise.all([
      getJSON('/posts'),
      getJSON('/comments')
    ]).then(function(values){
      values[0] // => postsJSON
      values[1] // => commentsJSON
  
      return values;
    });
    ```
  
    @class Promise
    @param {function} resolver
    Useful for tooling.
    @constructor
  */
  function Promise(resolver) {
    this[PROMISE_ID] = nextId();
    this._result = this._state = undefined;
    this._subscribers = [];
  
    if (noop !== resolver) {
      typeof resolver !== 'function' && needsResolver();
      this instanceof Promise ? initializePromise(this, resolver) : needsNew();
    }
  }
  
  Promise.all = all;
  Promise.race = race;
  Promise.resolve = resolve;
  Promise.reject = reject;
  Promise._setScheduler = setScheduler;
  Promise._setAsap = setAsap;
  Promise._asap = asap;
  
  Promise.prototype = {
    constructor: Promise,
  
    /**
      The primary way of interacting with a promise is through its `then` method,
      which registers callbacks to receive either a promise's eventual value or the
      reason why the promise cannot be fulfilled.
  
      ```js
      findUser().then(function(user){
        // user is available
      }, function(reason){
        // user is unavailable, and you are given the reason why
      });
      ```
  
      Chaining
      --------
  
      The return value of `then` is itself a promise.  This second, 'downstream'
      promise is resolved with the return value of the first promise's fulfillment
      or rejection handler, or rejected if the handler throws an exception.
  
      ```js
      findUser().then(function (user) {
        return user.name;
      }, function (reason) {
        return 'default name';
      }).then(function (userName) {
        // If `findUser` fulfilled, `userName` will be the user's name, otherwise it
        // will be `'default name'`
      });
  
      findUser().then(function (user) {
        throw new Error('Found user, but still unhappy');
      }, function (reason) {
        throw new Error('`findUser` rejected and we're unhappy');
      }).then(function (value) {
        // never reached
      }, function (reason) {
        // if `findUser` fulfilled, `reason` will be 'Found user, but still unhappy'.
        // If `findUser` rejected, `reason` will be '`findUser` rejected and we're unhappy'.
      });
      ```
      If the downstream promise does not specify a rejection handler, rejection reasons will be propagated further downstream.
  
      ```js
      findUser().then(function (user) {
        throw new PedagogicalException('Upstream error');
      }).then(function (value) {
        // never reached
      }).then(function (value) {
        // never reached
      }, function (reason) {
        // The `PedgagocialException` is propagated all the way down to here
      });
      ```
  
      Assimilation
      ------------
  
      Sometimes the value you want to propagate to a downstream promise can only be
      retrieved asynchronously. This can be achieved by returning a promise in the
      fulfillment or rejection handler. The downstream promise will then be pending
      until the returned promise is settled. This is called *assimilation*.
  
      ```js
      findUser().then(function (user) {
        return findCommentsByAuthor(user);
      }).then(function (comments) {
        // The user's comments are now available
      });
      ```
  
      If the assimliated promise rejects, then the downstream promise will also reject.
  
      ```js
      findUser().then(function (user) {
        return findCommentsByAuthor(user);
      }).then(function (comments) {
        // If `findCommentsByAuthor` fulfills, we'll have the value here
      }, function (reason) {
        // If `findCommentsByAuthor` rejects, we'll have the reason here
      });
      ```
  
      Simple Example
      --------------
  
      Synchronous Example
  
      ```javascript
      let result;
  
      try {
        result = findResult();
        // success
      } catch(reason) {
        // failure
      }
      ```
  
      Errback Example
  
      ```js
      findResult(function(result, err){
        if (err) {
          // failure
        } else {
          // success
        }
      });
      ```
  
      Promise Example;
  
      ```javascript
      findResult().then(function(result){
        // success
      }, function(reason){
        // failure
      });
      ```
  
      Advanced Example
      --------------
  
      Synchronous Example
  
      ```javascript
      let author, books;
  
      try {
        author = findAuthor();
        books  = findBooksByAuthor(author);
        // success
      } catch(reason) {
        // failure
      }
      ```
  
      Errback Example
  
      ```js
  
      function foundBooks(books) {
  
      }
  
      function failure(reason) {
  
      }
  
      findAuthor(function(author, err){
        if (err) {
          failure(err);
          // failure
        } else {
          try {
            findBoooksByAuthor(author, function(books, err) {
              if (err) {
                failure(err);
              } else {
                try {
                  foundBooks(books);
                } catch(reason) {
                  failure(reason);
                }
              }
            });
          } catch(error) {
            failure(err);
          }
          // success
        }
      });
      ```
  
      Promise Example;
  
      ```javascript
      findAuthor().
        then(findBooksByAuthor).
        then(function(books){
          // found books
      }).catch(function(reason){
        // something went wrong
      });
      ```
  
      @method then
      @param {Function} onFulfilled
      @param {Function} onRejected
      Useful for tooling.
      @return {Promise}
    */
    then: then,
  
    /**
      `catch` is simply sugar for `then(undefined, onRejection)` which makes it the same
      as the catch block of a try/catch statement.
  
      ```js
      function findAuthor(){
        throw new Error('couldn't find that author');
      }
  
      // synchronous
      try {
        findAuthor();
      } catch(reason) {
        // something went wrong
      }
  
      // async with promises
      findAuthor().catch(function(reason){
        // something went wrong
      });
      ```
  
      @method catch
      @param {Function} onRejection
      Useful for tooling.
      @return {Promise}
    */
    'catch': function _catch(onRejection) {
      return this.then(null, onRejection);
    }
  };
  
  function polyfill() {
      var local = undefined;
  
      if (typeof global !== 'undefined') {
          local = global;
      } else if (typeof self !== 'undefined') {
          local = self;
      } else {
          try {
              local = Function('return this')();
          } catch (e) {
              throw new Error('polyfill failed because global object is unavailable in this environment');
          }
      }
  
      var P = local.Promise;
  
      if (P) {
          var promiseToString = null;
          try {
              promiseToString = Object.prototype.toString.call(P.resolve());
          } catch (e) {
              // silently ignored
          }
  
          if (promiseToString === '[object Promise]' && !P.cast) {
              return;
          }
      }
  
      local.Promise = Promise;
  }
  
  // Strange compat..
  Promise.polyfill = polyfill;
  Promise.Promise = Promise;
  
  Promise.polyfill();
  
  return Promise;
  
  })));
  
    }
  
    function shouldIgnorePolyfill(self) {
      var isSupport = false;
      var P = self.Promise;
  
      if (P) {
        var promise = null;
        var then = null;
        try {
          promise = P.resolve();
          then = promise.then;
        } catch (e) {
          // silently ignored
        }
        if (promise instanceof P && typeof then === 'function' && !P.cast) {
          isSupport = true;
        }
      }
      return isSupport;
    }
  
    if (!shouldIgnorePolyfill(self)) {
      PromisePolyfillImpl();
    }
  })(self);
  /**
   * AP SOURCE
   */
  ;(function (self) {
    'use strict';
    /********************* JSAPI functions ********************/
    // AlipayJSBridge
  
    var _JS_BRIDGE_NAME = 'AlipayJSBridge';
    var _JS_BRIDGE = self[_JS_BRIDGE_NAME];
    var _UA = navigator.userAgent || navigator.swuserAgent;
    var _MEDIA_BUSINESS = 'apm-h5';
    var _IS_SUPPORT_PROMISE;
    var window = self.window;
    var document = self.document;
    var console = self.console;
    var parseInt = self.parseInt;
    /**
     * 寰呮墽琛岄槦鍒楋紝澶勭悊 ready 鍓嶇殑鎺ュ彛璋冪敤
     */
    var _WAITING_QUEUE = [];
  
    //缂撳瓨
    var _CACHE = {
      getBAPSI: {
        isListening: false,
        lastState: 2,
        on: function on() {
          if (!_CACHE.getBAPSI.isListening) {
            _JS_BRIDGE.call('startMonitorBackgroundAudio');
            _CACHE.getBAPSI.isListening = true;
            AP.on('getBackgroundAudioPlayedStateInfo', _CACHE.getBAPSI.listener);
          }
        },
        off: function off() {
          AP.off('getBackgroundAudioPlayedStateInfo', _CACHE.getBAPSI.listener);
          _JS_BRIDGE.call('stopMonitorBackgroundAudio');
          _CACHE.getBAPSI.isListening = false;
        },
        listener: function listener(evt) {
          var data = evt.data || {};
          var state = data.status;
          var triggerEvent = ['backgroundAudioPause', 'backgroundAudioPlay', 'backgroundAudioStop'][state];
          if (triggerEvent && state !== _CACHE.getBAPSI.lastState) {
            AP.trigger(triggerEvent);
            _CACHE.getBAPSI.lastState = state;
          }
        }
      }
    };
    /**
     * JSAPI 寮傛鎺ュ彛鍒楄〃锛屼笅闈㈡槸鍒楄〃涓叿浣撲唬鐮佺粨鏋勭殑璇存槑
     * @type {Object}
     *
     * @String   m => mapping                   JSAPI 鍚嶇О鏄犲皠锛屽嵆瀵瑰簲鐨� AlipayJSBridge 鐨勬帴鍙ｅ悕锛屾柟渚跨洿鎺ユ敼鍚�
     * @Object   e => extra                     JSAPI 鎵╁睍淇℃伅锛屾柟渚胯拷鍔犺嚜瀹氫箟鏍囪瘑
     *                                          handleResultSuccess: Boolean 鏄惁澶勭悊 success 瀛楁
     *                                          handleEventData: Boolean 鏄惁澶勭悊浜嬩欢鎼哄甫鐨勬暟鎹紝鍗宠繃婊ゆ帀 event 瀵硅薄鍙繑鍥� data
     *                                          optionModifier: Function 瀵瑰師鏈� option 鍏ュ弬鍋氳繘涓€姝ュ鐞�
     * 
     * @Function b => before(opt, cb)           鍓嶇疆澶勭悊锛屽鐞嗗叆鍙�
     *           @param  {Object}     opt       鍘熷鍏ュ弬锛屽叾涓� opt._ 鏄皟鐢ㄦ帴鍙ｆ椂鍙洿鎺ヤ紶鍏ョ殑鏌愪釜鍙傛暟
     *           @return {Object}               澶勭悊杩囩殑鍏ュ弬
     * @Function d => doing(_opt, cb, opt)      浠ｆ浛鎵ц锛屼唬鏇垮師鏈� api 鐩存帴鎵ц锛屼細蹇界暐 AlipayJSBridge.call 鎺ュ彛
        *        @param  {Object}    opt        鍘熷鍏ュ弬
     *           @param  {Object}    _opt       before 澶勭悊杩囩殑鍏ュ弬
     *           @param  {Function}   cb        鎺ュ彛鍥炶皟鍑芥暟锛屽凡鍦� AP.call 涓鐞嗭紝鎵€浠ユ澶勪竴瀹氭槸涓€涓� Function 鏃犻渶鍒ゆ柇
     * @Function a => after(res, _opt, opt)     鍚庣疆澶勭悊锛屽鐞嗗嚭鍙傦紝鍗虫帴鍙ｈ繑鍥炵粰鍥炶皟鍑芥暟鐨勫€�
     *           @param  {Object}     opt       鍘熷鍏ュ弬
     *           @param  {Object}     _opt      缁� before 澶勭悊杩囩殑鍏ュ弬
     *           @param  {Object}     res       JSAPI 鎺ュ彛鐨勫師濮嬭繑鍥炲€�
     *           @return {Object}               澶勭悊杩囩殑鎺ュ彛杩斿洖鍊�
     *
     */
    var _JSAPI = {
      /************************* alipayjsapi-inc 鍐呴儴鎺ュ彛锛屼笅涓哄崰浣嶇锛屽閮ㄥ彂甯冩椂浼氳鍒犻櫎 *************************/
  
      /*<<< inc >>>*/
      // onResourceLost: {
      //   m: 'h5ResourceLost'
      // },
      fetchCDP: {
        m: 'getCdpSpaceInfo'
      },
      feedbackCDP: {
        m: 'cdpFeedback'
      },
      snapshot: {},
  
      saveBizServiceResult: {},
      setStorage: {
        m: 'setAPDataStorage',
        b: function b(opt) {
          var business = _getStorageBusiness();
          _mapping(opt, {
            data: 'value',
            bizType: 'business'
          });
          opt.value = __superToString({ APDataStorage: opt.value });
          opt.key = __superToString(opt.key);
          opt.type = __isUndefined(opt.type) ? 'user' : opt.type;
          if (__isUndefined(opt.business) && business) {
            opt.business = business;
          }
          return opt;
        }
      },
      getStorage: {
        m: 'getAPDataStorage',
        b: function b(opt) {
          var business = _getStorageBusiness();
          _mapping(opt, {
            _: 'key',
            bizType: 'business'
          });
          opt.key = __superToString(opt.key);
          opt.type = __isUndefined(opt.type) ? 'user' : opt.type;
          if (__isUndefined(opt.business) && business) {
            opt.business = business;
          }
          return opt;
        },
        a: function a(res) {
          if (res.error === 11) {
            res.data = null;
            delete res.error;
            delete res.errorMessage;
            delete res.success;
          }
          if (__hasOwnProperty(res, 'data')) {
            var data = __parseJSON(res.data);
            res.data = __isObject(data) ? data.APDataStorage : data;
          }
  
          return res;
        }
      },
      removeStorage: {
        m: 'removeAPDataStorage',
        b: function b(opt) {
          var business = _getStorageBusiness();
          _mapping(opt, {
            _: 'key',
            bizType: 'business'
          });
          opt.key = __superToString(opt.key);
          opt.type = __isUndefined(opt.type) ? 'user' : opt.type;
          if (__isUndefined(opt.business) && business) {
            opt.business = business;
          }
          return opt;
        }
      },
      clearStorage: {
        m: 'clearAPDataStorage',
        b: function b(opt) {
          var business = _getStorageBusiness();
          _mapping(opt, {
            bizType: 'business'
          });
          opt.type = __isUndefined(opt.type) ? 'user' : opt.type;
          if (__isUndefined(opt.business) && business) {
            opt.business = business;
          }
          return opt;
        }
      },
      httpRequest: {
        /**
         * 鎺ュ彛鍙洿鎺ヤ紶鍏ヤ竴涓瓧绗︿覆锛坥pt.url锛�
         * 鍙傛暟 opt.data 鏀寔瀵硅薄锛屼細杞垚 queryString
         * 鍏ュ弬鏀归€� opt.dataType => opt.responseType锛�
         * opt.dataType 鏀寔 json|text|base64锛宩son 鏃朵細瀵硅繑鍥炴暟鎹皟鐢ㄤ竴娆� JSON.parse
         */
        b: function b(opt) {
          var get = 'GET';
          //method 榛樿 'GET'
          opt.method = __tuc(opt.method) || get;
          //dataType 榛樿 'json'
          opt.dataType = __tlc(opt.dataType) || 'json';
          //鐩存帴浼犲叆涓€涓瓧绗︿覆鏃跺綋浣� url 鍙傛暟
          _mapping(opt, {
            _: 'url',
            dataType: 'responseType'
          });
          //濡傛灉 data 鏄璞★紝鍒欒浆鎴� queryString锛�
          if (__isObject(opt.data)) {
            opt.data = __toQueryString(opt.data);
          }
          //鎵€浠ヨ澶勭悊 GET 鏃讹紝鎵嬪姩鎷艰涓� queryString
          if (opt.method === get && __isString(opt.data)) {
            opt.url = __buildUrl(opt.url, opt.data);
          }
          //澶勭悊 responseType锛岄潪 base64 鍏ㄥ綋 text 瀵瑰緟
          opt.responseType = __tlc(opt.responseType) !== 'base64' ? 'text' : 'base64';
          //澶勭悊 contentType锛屽苟寮哄埗 headers 涓� object
          opt.headers = opt.headers || {};
          // opt.headers = (__isObject(opt.headers) && opt.headers['Content-Type']) ?
          //               opt.headers :
          //               { 'Content-Type': 'application/x-www-form-urlencoded' };
  
          //澶勭悊 android headers 杞崲涓� JSONArray 鏍煎紡
          if (__isAndroid()) {
            var androidHeaders = [];
            var androidHeader = void 0;
            for (var header in opt.headers) {
              if (__hasOwnProperty(opt.headers, header)) {
                androidHeader = {};
                androidHeader[header] = opt.headers[header];
                androidHeaders.push(androidHeader);
              }
            }
            opt.headers = androidHeaders;
          }
  
          return opt;
        },
        a: function a(res, _opt, opt) {
          opt.dataType = __tlc(opt.dataType) || 'json';
          //澶勭悊 json
          if (opt.dataType === 'json' && res.data) {
            res.data = __parseJSON(res.data);
          }
          //澶勭悊 base64
          if (opt.dataType === 'base64' && res.data && res.headers) {
            res.data = __addBase64Head(res.data, res.headers['Content-Type']);
          }
          //澶勭悊閿欒
          if (!__isUndefined(res.status)) {
            var status = res.status + '';
            if (/^[45]/.test(status)) {
              res.error = 19;
              res.errorMessage = 'http status error';
            }
          }
          return res;
        }
      },
      //verifyIdentity: {},
      startApp: {
        b: function b(opt) {
          return _mapping(opt, {
            _: 'appId',
            params: 'param'
          });
        }
      },
      setClipboard: {
        b: function b(opt) {
          return _mapping(opt, {
            _: 'content',
            content: 'text'
          });
        }
      },
      getClipboard: {
        a: function a(res) {
          _mapping(res, {
            text: 'content'
          });
          delete res.text;
          return res;
        }
      },
      getUserInfo: {
        a: function a(res) {
          return _mapping(res, {
            iconUrl: 'avatar'
          });
        }
      },
      getConfig: {
        b: function b(opt) {
          _mapping(opt, {
            _: 'configKeys',
            keys: 'configKeys'
          });
          if (__isString(opt.configKeys)) {
            opt.configKeys = [opt.configKeys];
          }
          __forEach(opt.configKeys, function (key, value) {
            if (value === 'mgw') {
              opt.configKeys[key] = 'rpcUrl';
            }
          });
          return opt;
        },
        a: function a(res) {
          if (res.data) {
            if (__hasOwnProperty(res.data, 'rpcUrl')) {
              res.data.mgw = res.data.rpcUrl;
              delete res.data.rpcUrl;
            }
            __forEach(res.data, function (key, value) {
              res[key] = value;
            });
            delete res.data;
          }
          return res;
        }
      },
      remoteLog: {},
      //蹇嵎鏂瑰紡
      isSupportShortCut: {
        a: function a(res) {
          return _mapping(res, {
            result: 'isSupport'
          });
        }
      },
      setShortCut: {
        b: function b(opt) {
          return _mapping(opt, {
            title: 'appName',
            icon: 'iconBitmap'
          });
        }
      },
      removeShortCut: {
        b: function b(opt) {
          return _mapping(opt, {
            title: 'appName',
            icon: 'iconBitmap'
          });
        }
      },
      //閫€鍑哄簲鐢�
      exitApp: {},
      login: {},
      sendSMS: {
        a: function a(res) {
          if (res.status) {
            switch (res.status) {
              case 'Success':
                res = {};
                break;
              case 'Failed':
                res.error = 21;
                res.errorMessage = '鍙戦€佸け璐�';
                break;
              case 'Canceled':
                res.error = 22;
                res.errorMessage = '鐢ㄦ埛鍙栨秷鍙戦€�';
                break;
              default:
            }
            delete res.status;
          }
          return res;
        }
      },
      getAllContacts: {
        a: function a(res) {
          var contacts = [];
          if (res && !__hasOwnProperty(res, 'error')) {
            __forEach(res, function (key, value) {
              contacts.push({
                mobile: key,
                name: value
              });
            });
            res = {
              contacts: contacts
            };
          }
          return res;
        }
      },
      setScreenBrightness: {
        b: function b(opt) {
          return _mapping(opt, {
            _: 'brightness'
          });
        }
      },
      getScreenBrightness: {},
      isInstalledApp: {
        b: function b(opt) {
          return _mapping(opt, {
            packageName: 'packagename'
          });
        },
        a: function a(res) {
          return _mapping(res, {
            installed: 'isInstalled'
          });
        }
      },
      preRender: {
        /**
         * 澧炲姞 opt.data 浣滀负 queryString 鎷煎湪 url 鍚庨潰
         */
        b: function b(opt) {
          _mapping(opt, {
            _: 'url'
          });
          if (!__isObject(opt.windowParams)) {
            opt.windowParams = {};
          }
          if (opt.url && __isUndefined(opt.windowParams.url)) {
            opt.windowParams.url = opt.url;
          }
          delete opt.url;
          if (opt.params && __isUndefined(opt.windowParams.param)) {
            opt.windowParams.param = opt.params;
          }
          delete opt.params;
          if (opt.windowParams.url.indexOf('?') > -1) {
            console.warn('try opt.' + 'data' + ' instead of querystring');
          }
          if (opt.windowParams.url.indexOf('__webview_options__') > -1) {
            console.warn('try opt.' + 'params' + ' instead of ' + '__webview_options__');
          }
          if (__isObject(opt.data)) {
            opt.windowParams.url = __buildUrl(opt.windowParams.url, opt.data);
            delete opt.data;
          }
          return opt;
        }
      },
      clearRender: {
        b: function b(opt) {
          if (!__isObject(opt.range)) {
            opt.range = {};
          }
          if (opt.start && __isUndefined(opt.range.location)) {
            opt.range.location = opt.start;
          }
          delete opt.start;
          if (opt.length && __isUndefined(opt.range.length)) {
            opt.range.length = opt.length;
          }
          delete opt.length;
          return opt;
        }
      },
      finishRender: {},
      rpc: {
        b: function b(opt) {
          _mapping(opt, {
            _: 'operationType'
          });
          if (opt.requestData && !__isArray(opt.requestData) && __isObject(opt.requestData) && !__hasOwnProperty(opt, 'type')) {
            opt.requestData = [opt.requestData];
          }
          return opt;
        },
  
        e: {
          handleResultSuccess: false
        }
      },
      /*<<< endinc >>>*/
      /**
       * 鏂扮増钃濈墮鐩稿叧鎺ュ彛
       */
      openBluetoothAdapter: {},
      closeBluetoothAdapter: {},
      getBluetoothAdapterState: {},
      startBluetoothDevicesDiscovery: {
        b: function b(opt) {
          if (__isString(opt._)) {
            opt._ = [opt._];
          }
          _mapping(opt, {
            _: 'services'
          });
          return opt;
        }
      },
      stopBluetoothDevicesDiscovery: {},
      getBluetoothDevices: {
        b: function b(opt) {
          if (__isString(opt._)) {
            opt._ = [opt._];
          }
          _mapping(opt, {
            _: 'services'
          });
          return opt;
        },
        a: function a(res) {
          if (__isArray(res.devices)) {
            __forEach(res.devices, function (key, val) {
              _mapping(val, {
                manufacturerData: 'advertisData'
              });
            });
          }
  
          return res;
        }
      },
      getConnectedBluetoothDevices: {
        a: function a(res) {
          if (__isArray(res.devices)) {
            __forEach(res.devices, function (key, val) {
              _mapping(val, {
                manufacturerData: 'advertisData'
              });
            });
          }
  
          return res;
        }
      },
      connectBLEDevice: {
        b: function b(opt) {
          _mapping(opt, {
            _: 'deviceId'
          });
          return opt;
        }
      },
      disconnectBLEDevice: {},
      writeBLECharacteristicValue: {},
      readBLECharacteristicValue: {},
      notifyBLECharacteristicValueChange: {},
      getBLEDeviceServices: {
        b: function b(opt) {
          _mapping(opt, {
            _: 'deviceId'
          });
          return opt;
        }
      },
      getBLEDeviceCharacteristics: {},
      onBLECharacteristicValueChange: {
        //鐪熸鐨勪簨浠跺悕锛屼細鎶婇瀛楁瘝鑷姩杞垚灏忓啓锛屽洜姝よ繖閲屼娇鐢� map 鍙伩鍏嶈繖涓棶棰�
        m: 'BLECharacteristicValueChange'
  
      },
      offBLECharacteristicValueChange: {
        m: 'BLECharacteristicValueChange'
      },
      onBluetoothAdapterStateChange: {},
      offBluetoothAdapterStateChange: {},
      onBLEConnectionStateChanged: {
        m: 'BLEConnectionStateChanged'
  
      },
      offBLEConnectionStateChanged: {
        m: 'BLEConnectionStateChanged'
      },
      onBluetoothDeviceFound: {
        a: function a(res) {
          return _mapping(res, {
            manufacturerData: 'advertisData'
          });
        }
      },
      offBluetoothDeviceFound: {},
      /**
       * end 鏂扮増钃濈墮鐩稿叧鎺ュ彛
       */
  
      pushBizWindow: {},
      compressImage: {
        b: function b(opt) {
          opt.level = __isUndefined(opt.level) ? 4 : opt.level;
          return _mapping(opt, {
            _: 'apFilePaths',
            level: 'compressLevel%d'
          });
        },
        d: function d(_opt, cb) {
          if (__isAndroid()) {
            _JS_BRIDGE.call('compressImage', _opt, cb);
          } else {
            _fakeCallBack(cb, {
              apFilePaths: _opt.apFilePaths || []
            });
          }
        }
      },
  
      /**
      * 鑾峰彇鍚姩鍙傛暟锛屽苟璁板綍鍦� AP.launchParams
      * @method getLaunchParams
      * @param  {String}   null
      * @param  {Function} fn  鍥炶皟
      */
      getLaunchParams: {
        d: function d(opt, cb) {
          AP.launchParams = window.ALIPAYH5STARTUPPARAMS || _JS_BRIDGE.startupParams || {};
          if (__isFunction(cb)) {
            cb(AP.launchParams);
          }
        }
      },
      //鏃х増钃濈墮鎺ュ彛绉婚櫎
  
      onTabClick: {},
      offTabClick: {},
      onShare: {
        m: 'onShare'
  
      },
      offShare: {
        m: 'onShare'
      },
      connectSocket: {
        b: function b(opt) {
          return _mapping(opt, {
            headers: 'header'
          });
        }
      },
      sendSocketMessage: {
        b: function b(opt) {
          return _mapping(opt, {
            _: 'data'
          });
        }
      },
      closeSocket: {},
      onSocketOpen: {},
      offSocketOpen: {},
      onSocketMessage: {},
      offSocketMessage: {},
      onSocketError: {},
      offSocketError: {},
      onSocketClose: {},
      offSocketClose: {},
  
      ////////////////////////////// [AlipayJSAPI/ui] ////////////////////////////
      /**
       * 鎺ュ彛鍙洿鎺ヤ紶鍏ヤ竴涓瓧绗︿覆锛坥pt.content锛�
       * 缁熶竴 alert 鍜� confirm 鐨勫唴瀹瑰瓧娈典负 content
       */
      alert: {
        b: function b(opt) {
          opt = _mapping(opt, {
            _: 'content',
            content: 'message%s',
            buttonText: 'button%s'
          });
          if (!__isUndefined(opt.title)) {
            opt.title = _toType('%s', opt.title);
          }
          return opt;
        }
      },
      /**
       * 鎺ュ彛鍙洿鎺ヤ紶鍏ヤ竴涓瓧绗︿覆锛坥pt.content锛�
       * 缁熶竴 alert 鍜� confirm 鐨勫唴瀹瑰瓧娈典负 content
       */
      confirm: {
        b: function b(opt) {
          opt = _mapping(opt, {
            _: 'content%s',
            content: 'message%s',
            confirmButtonText: 'okButton%s',
            cancelButtonText: 'cancelButton%s'
          });
          if (!__isUndefined(opt.title)) {
            opt.title = _toType('%s', opt.title);
          }
          return opt;
        },
        a: function a(res) {
          return _mapping(res, {
            ok: 'confirm' //鏇存敼涔嬪墠杩斿洖鍊奸噷鐨� ok 涓� confirm
          });
        }
      },
      /**
       * 鎺ュ彛鍙洿鎺ヤ紶鍏ヤ竴涓瓧绗︿覆锛坥pt.content锛�
       */
      showToast: {
        m: 'toast',
        b: function b(opt) {
          //toast 鍐呭瀛楁鏈潵灏辨槸 content
          _mapping(opt, {
            _: 'content%s'
          });
          if (!__isString(opt.content)) {
            opt.content = _toType('%s', opt.content);
          }
          //opt.duration = opt.duration || 2000;
          return opt;
        }
      },
      hideToast: {},
      /**
       * 鎺ュ彛鍙洿鎺ヤ紶鍏ヤ竴涓瓧绗︿覆锛坥pt.content锛�
       * 鎺ュ彛鏀归€� opt.content => opt.text
       */
      showLoading: {
        b: function b(opt) {
          return _mapping(opt, {
            _: 'content', // %s 娌″繀瑕佸姞缁� content锛�
            content: 'text%s' // 鍥犱负鏈€鍚庤皟鐢ㄦ帴鍙ｆ椂鐪熸鍏ュ弬鏄� text
          });
        }
      },
      hideLoading: {},
      showNavigationBarLoading: {
        m: 'showTitleLoading'
      },
      hideNavigationBarLoading: {
        m: 'hideTitleLoading'
      },
      /**
       * 鏁村悎浜� setTitle, setTitleColor, setBarBottomLineColor 涓変釜鎺ュ彛
       * @type {Object}
       */
      setNavigationBar: {
        b: function b(opt) {
          // JSAPI 鍚嶇О澶暱鍙堝娆″紩鐢紝涓嶅埄浜庝唬鐮佸帇缂╋紝鍥哄崟鐙褰�
          var st = 'setTitle';
          var stc = 'setTitleColor';
          var sblc = 'setBarBottomLineColor';
          var _opt = {};
  
          _opt[st] = {};
          _opt[stc] = {};
          _opt[sblc] = {};
  
          // 鏄犲皠涓嶅悓 JSAPI 鐨勫叆鍙�
          _opt[st] = _mapping(_opt[st], {
            _: 'title', //鎺ュ彛鍙洿鎺ヤ紶鍏ヤ竴涓瓧绗︿覆锛坥pt.title锛�
            title: 'title%s',
            image: 'image%b' //澶勭悊 image 涓� base64 鐨勬儏鍐碉紝涓� native 绉婚櫎鏍煎紡澶�
          }, opt);
          _opt[stc] = _mapping(_opt[stc], {
            backgroundColor: 'color%c',
            reset: 'reset'
          }, opt);
          _opt[sblc] = _mapping(_opt[sblc], {
            borderBottomColor: 'color%c'
          }, opt);
  
          return _opt;
        },
        d: function d(_opt, cb) {
          var st = 'setTitle';
          var stc = 'setTitleColor';
          var sblc = 'setBarBottomLineColor';
          var res = {};
          //setTitle
          if (!__isEmptyObject(_opt[st])) {
            _JS_BRIDGE.call(st, _opt[st]);
          }
          //setBarBottomLineColor
          if (!__isEmptyObject(_opt[sblc])) {
            _JS_BRIDGE.call(sblc, _opt[sblc]);
            if (__isNaN(_opt[sblc].color)) {
              res.error = 2;
              res.errorMessage = '棰滆壊鍊间笉鍚堟硶';
            }
          }
          //setTitleColor
          if (!__isEmptyObject(_opt[stc])) {
            _JS_BRIDGE.call(stc, _opt[stc], function (result) {
              res = __extend(result, res);
              cb(res);
            });
          } else {
            //setTitle 鍜� setBarBottomLineColor 鏈韩娌℃湁鍥炶皟
            //涓轰繚鎸佹帴鍙ｄ竴鑷存€ц妯℃嫙涓€涓紓姝ュ洖璋�
            _fakeCallBack(cb, res);
          }
        }
      },
      showTabBar: {
        b: function b(opt) {
          //鍒涘缓 tabBar
          opt.action = 'create';
          //榛樿婵€娲荤涓€涓� tab
          opt.activeIndex = opt.activeIndex || 0;
          //鍏朵粬灞炴€ф槧灏�
          _mapping(opt, {
            color: 'textColor%c',
            activeColor: 'selectedColor%c',
            activeIndex: 'selectedIndex%d'
          });
  
          if (__isArray(opt.items)) {
            var items = opt.items;
            //闇€瑕佸鍒朵竴浠斤紝涓嶈兘鍦ㄥ師鏁扮粍涓婁慨鏀癸紝浼氱牬鍧忕敤鎴锋暟鎹�
            opt.items = [];
            items.forEach(function (item, i) {
              item = _mapping(__extend({}, item), {
                title: 'name%s',
                tag: 'tag%s',
                icon: 'icon%b',
                activeIcon: 'activeIcon%b',
                badge: 'redDot%s'
              }, {
                tag: i,
                // title: item.title,
                // icon: item.icon,
                // activeIcon: item.activeIcon,
                badge: __isUndefined(item.badge) ? '-1' : item.badge
              });
              item.icon = _toType('%b', item.icon);
              item.activeIcon = _toType('%b', item.activeIcon);
              opt.items.push(item);
            });
          }
          return opt;
        },
        d: function d(_opt, cb, opt) {
          var apiName = 'showTabBar';
          if (!__isUndefined(_CACHE.showTabBar)) {
            console.error(apiName + ' must be called at most once');
          } else {
            _CACHE.showTabBar = {
              opt: opt
            };
          }
          //鐩戝惉鐐瑰嚮浜嬩欢
          AP.on('tabClick', function (evt) {
            var res = {};
            _mapping(res, {
              tag: 'index%d'
            }, {
              tag: __isObject(evt.data) && evt.data.tag ? evt.data.tag : '0'
            });
            cb(res);
          });
          //璋冪敤鏂规硶
          _JS_BRIDGE.call('tabBar', _opt, function (result) {
            //result 骞堕潪鐪熸鐨勮繑鍥炲€硷紝浣嗘槸瑕佸鐞嗘帴鍙ｉ敊璇�
            _handleApiError(apiName, result);
          });
        }
      },
      setTabBarBadge: {
        m: 'tabBar',
        b: function b(opt) {
          opt.action = 'redDot';
          _mapping(opt, {
            index: 'tag%s',
            badge: 'redDot%s'
          }, {
            index: opt.index
          });
          return opt;
        }
      },
      showActionSheet: {
        m: 'actionSheet',
        b: function b(opt) {
          _mapping(opt, {
            items: 'btns',
            cancelButtonText: 'cancelBtn%s'
          });
          //鎶婃寜閽瓧娈佃浆鎴愬瓧绗︿覆锛岄潪瀛楃涓蹭細瀵艰嚧閽卞寘闂€€
          if (__isArray(opt.btns)) {
            var btns = opt.btns;
            opt.btns = [];
            btns.forEach(function (item) {
              return opt.btns.push(item + '');
            });
          }
          //鎶婂彇娑堟寜閽瓧娈佃浆鎴愬瓧绗︿覆锛岄潪瀛楃涓蹭細瀵艰嚧 actionSheet 鍏ㄥ睆
          if (__isUndefined(opt.cancelBtn)) {
            opt.cancelBtn = '鍙栨秷';
          }
  
          return opt;
        },
        a: function a(res, _opt) {
          if (__isArray(_opt.btns) && res.index === _opt.btns.length) {
            res.index = -1;
          }
          return res;
        }
      },
      redirectTo: {
        /**
         * 澧炲姞 opt.data 浣滀负 queryString 鎷煎湪 url 鍚庨潰
         */
        b: function b(opt) {
          //鐩存帴浼犲叆涓€涓瓧绗︿覆鏃跺綋浣� opt.url 鍙傛暟
          _mapping(opt, {
            _: 'url'
          });
          //濡傛灉鏈� data 鍙傛暟鍒欐瀯閫犳湁 queryString 鐨� url
          if (__isObject(opt.data)) {
            opt.url = __buildUrl(opt.url, opt.data);
          }
          return opt;
        },
        d: function d(_opt) {
          if (_opt.url) {
            window.location.replace(_opt.url);
          }
        }
      },
      pushWindow: {
        /**
         * 澧炲姞 opt.data 浣滀负 queryString 鎷煎湪 url 鍚庨潰
         */
        b: function b(opt) {
          //鐩存帴浼犲叆涓€涓瓧绗︿覆鏃跺綋浣� opt.url 鍙傛暟
          _mapping(opt, {
            _: 'url',
            params: 'param'
          });
          if (opt.url.indexOf('?') > -1) {
            console.warn('try opt.' + 'data' + ' instead of querystring');
          }
          if (opt.url.indexOf('__webview_options__') > -1) {
            console.warn('try opt.' + 'params' + ' instead of ' + '__webview_options__');
          }
          //濡傛灉鏈� data 鍙傛暟鍒欐瀯閫犳湁 queryString 鐨� url
          if (__isObject(opt.data)) {
            opt.url = __buildUrl(opt.url, opt.data);
            delete opt.data;
          }
          return opt;
        }
      },
      popWindow: {
        b: function b(opt) {
          opt = _fixOptData(opt);
          if (!__isObject(opt.data)) {
            opt.data = {
              ___forResume___: opt.data
            };
          }
          return opt;
        }
      },
      popTo: {
        /**
         * 鎺ュ彛鍙洿鎺ヤ紶鍏ヤ竴涓暟瀛楋紙opt.index锛夋垨鑰呬竴涓瓧绗︿覆锛坥pt.urlPattern锛�
         */
        b: function b(opt) {
          _mapping(opt, {
            _: function () {
              var key = void 0;
              if (__isNumber(opt._)) {
                key = 'index';
              }
              if (__isString(opt._)) {
                key = 'urlPattern';
              }
              return key;
            }()
          });
          if (!__isObject(opt.data)) {
            opt.data = {
              ___forResume___: opt.data
            };
          }
          return opt;
        }
      },
      allowPullDownRefresh: {
        d: function d(opt) {
          var onPDR = 'onPullDownRefresh';
          _mapping(opt, {
            _: 'allow'
          });
          opt.allow = __isUndefined(opt.allow) ? true : !!opt.allow;
  
          if (__isObject(_CACHE[onPDR])) {
            _CACHE[onPDR].allow = opt.allow;
          } else {
            _CACHE[onPDR] = {
              allow: opt.allow
            };
            //鐩戝惉浜嬩欢锛岄€氳繃 event.preventDefault() 闃绘涓嬫媺鍒锋柊
            //婊¤冻鐢ㄦ埛鍦ㄦ病鏈夌洃鍚簨浠剁殑鎯呭喌涓嬭皟鐢� AP.allowPullDownRefresh(false) 浠嶇劧鐢熸晥
            AP.onPullDownRefresh();
          }
          if (_CACHE[onPDR].allow) {
            _JS_BRIDGE.call('restorePullToRefresh');
          } else {
            if (_CACHE[onPDR].event) {
              _CACHE[onPDR].event.preventDefault();
            }
          }
        }
      },
  
      choosePhoneContact: {
        m: 'contact'
      },
      /**
       * 鏈€澶氶€夋嫨10涓仈绯讳汉锛屽彧闇插嚭 count 鍙傛暟锛屽叾浠栧睆钄�
       */
      chooseAlipayContact: {
        m: 'chooseContact',
        b: function b(opt) {
          var multi = 'multi';
          var single = 'single';
          _mapping(opt, {
            _: 'count'
          });
          if (__isUndefined(opt.count)) {
            opt.count = 1;
          }
          if (opt.count === 1) {
            opt.type = single;
          } else {
            opt.type = multi;
            if (opt.count <= 0 || opt.count > 10) {
              opt.multiMax = 10;
            } else {
              opt.multiMax = opt.count;
            }
          }
          delete opt.count;
          return opt;
        },
        a: function a(res) {
          if (__isArray(res.contacts)) {
            res.contacts.forEach(function (contact) {
              _mapping(contact, {
                headImageUrl: 'avatar',
                name: 'realName'
              });
              delete contact.from;
            });
          }
          return res;
        }
      },
      share: {
        b: function b(opt) {
          var startShareOpt = {};
          var shareToChannelOpt = {};
          startShareOpt.onlySelectChannel = ['ALPContact', 'ALPTimeLine', 'ALPCommunity', 'Weibo', 'DingTalkSession', 'SMS', 'Weixin', 'WeixinTimeLine', 'QQ', 'QQZone'];
          if (__hasOwnProperty(opt, 'bizType')) {
            startShareOpt.bizType = opt.bizType;
          }
  
          shareToChannelOpt = __extend({}, opt);
          delete shareToChannelOpt.bizType;
          delete shareToChannelOpt.onlySelectChannel;
          _mapping(shareToChannelOpt, {
            image: 'imageUrl'
          });
  
          _CACHE.share = {
            startShare: startShareOpt,
            shareToChannel: shareToChannelOpt
          };
          return opt;
        },
        d: function d(opt, cb) {
          //闅愯棌绗簩琛�
          if (opt.showToolBar === false) {
            _JS_BRIDGE.call('setToolbarMenu', {
              menus: [],
              override: true
            });
          }
          //鍞よ捣鍒嗕韩闈㈡澘
          _JS_BRIDGE.call('startShare', _CACHE.share.startShare, function (info) {
            var stcOpt = _CACHE.share.shareToChannel;
            if (info.channelName) {
              _JS_BRIDGE.call('shareToChannel', {
                name: info.channelName,
                param: stcOpt
              }, cb);
            } else {
              cb(info);
            }
          });
        }
      },
      datePicker: {
        b: function b(opt) {
          _mapping(opt, {
            _: 'formate',
            formate: 'mode',
            currentDate: 'beginDate',
            startDate: 'minDate',
            endDate: 'maxDate'
          });
          switch (opt.mode) {
            case 'HH:mm:ss':
              opt.mode = 0;
              break;
            case 'yyyy-MM-dd':
              opt.mode = 1;
              break;
            case 'yyyy-MM-dd HH:mm:ss':
              opt.mode = 2;
              break;
            default:
              opt.mode = 1;
          }
          return opt;
        },
        a: function a(res) {
          if (__isString(res.date)) {
            //杩斿洖鏍煎紡涓簓yyy-MM-dd
            res.date = res.date.replace(/\//g, '-').trim();
          }
          // if (res.error === 2 ) {
          //   const currentDate = _opt.currentDate || Date.now();
          //   const startDate = _opt.startDate;
          // }
          return res;
        }
      },
      chooseCity: {
        m: 'getCities',
        b: function b(opt) {
          var customCities;
          var customHotCities;
          _mapping(opt, {
            showHotCities: 'needHotCity',
            cities: 'customCities',
            hotCities: 'customHotCities'
          });
          //鏄剧ず瀹氫綅鍩庡競
          if (opt.showLocatedCity === true) {
            opt.currentCity = '';
            opt.adcode = '';
          } else {
            delete opt.currentCity;
            delete opt.adcode;
          }
          delete opt.showLocatedCity;
  
          //鑷畾涔夊煄甯�
          customCities = opt.customCities;
          if (!__isUndefined(opt.customCities)) {
            opt.customCities = mapArray(customCities);
          }
          //鑷畾涔夌儹闂ㄥ煄甯�
          customHotCities = opt.customHotCities;
          if (!__isUndefined(opt.customHotCities)) {
            opt.customHotCities = mapArray(customHotCities);
          }
  
          function mapArray(arr) {
            var tempArr;
            if (__isArray(arr)) {
              tempArr = [];
              arr.forEach(function (city) {
                tempArr.push(_mapping({}, {
                  city: 'name',
                  adCode: 'adcode%s',
                  spell: 'pinyin'
                }, city));
              });
              arr = tempArr;
            }
            return arr;
          }
  
          return opt;
        },
        a: function a(res) {
          _mapping(res, {
            adcode: 'adCode'
          });
          return res;
        }
      },
  
      ////////////////////////////// 浜嬩欢 /////////////////////////////////
      onBack: {
        a: function a(evt) {
          var res = {};
          var onBack = 'onBack';
          if (__isObject(_CACHE[onBack])) {
            _CACHE[onBack].event = evt;
          } else {
            _CACHE[onBack] = {
              event: evt,
              allowButton: true
            };
          }
          if (_CACHE[onBack].allowButton === false) {
            evt.preventDefault();
          }
          res.backAvailable = _CACHE[onBack].allowButton;
          return res;
        },
  
        e: {
          handleEventData: false
        }
      },
      offBack: {},
  
      onResume: {
        a: function a(evt) {
          var res = {};
          if (!__isUndefined(evt.data)) {
            res.data = evt.data;
          }
          if (__hasOwnProperty(evt.data, '___forResume___')) {
            res.data = evt.data.___forResume___;
          }
          return res;
        },
  
        e: {
          handleEventData: false
        }
      },
      offResume: {},
  
      onPause: {},
      offPause: {},
  
      onPageResume: {
        a: function a(evt) {
          var res = {};
          if (!__isUndefined(evt.data)) {
            res.data = evt.data;
          }
          if (__hasOwnProperty(evt.data, '___forResume___')) {
            res.data = evt.data.___forResume___;
          }
          return res;
        },
  
        e: {
          handleEventData: false
        }
      },
      offPageResume: {},
      onPagePause: {},
      offPagePause: {},
  
      onTitleClick: {},
      offTitleClick: {},
  
      //onSubTitleClick: {},
      onPullDownRefresh: {
        m: 'firePullToRefresh',
        a: function a(evt) {
          var res = {};
          var onPDR = 'onPullDownRefresh';
          if (__isObject(_CACHE[onPDR])) {
            _CACHE[onPDR].event = evt;
          } else {
            _CACHE[onPDR] = {
              event: evt,
              allow: true
            };
          }
          if (_CACHE[onPDR].allow === false) {
            _CACHE[onPDR].event.preventDefault();
          }
          res.refreshAvailable = _CACHE[onPDR].allow;
          return res;
        },
  
        e: {
          handleEventData: false
        }
      },
      offPullDownRefresh: {
        m: 'firePullToRefresh'
      },
  
      onNetworkChange: {
        d: function d(_opt, _cb, opt, cb) {
          //鐩存帴璋冪敤涓€娆� getNetworkType 鍚愬洖褰撳墠缃戠粶鐘舵€�
          var handler = function handler() {
            return AP.getNetworkType(_cb);
          };
          _cacheEventHandler('h5NetworkChange', cb, handler);
          AP.on('h5NetworkChange', handler);
        }
      },
      offNetworkChange: {
        d: function d(_opt, _cb, opt, cb) {
          _removeEventHandler('h5NetworkChange', cb);
        }
      },
      onAccelerometerChange: {
        b: function b() {
          _JS_BRIDGE.call('watchShake', { monitorAccelerometer: true });
        },
        a: function a(evt) {
          var res = {};
          _mapping(res, {
            x: 'x',
            y: 'y',
            z: 'z'
          }, __isObject(evt.data) ? evt.data : evt);
          return res;
        },
  
        e: {
          handleEventData: false
        }
      },
      offAccelerometerChange: {
        b: function b() {
          _JS_BRIDGE.call('watchShake', { monitorAccelerometer: false });
        }
      },
      onCompassChange: {
        b: function b() {
          _JS_BRIDGE.call('watchShake', { monitorCompass: true });
        },
        a: function a(evt) {
          var res = {};
          _mapping(res, {
            direction: 'direction'
          }, __isObject(evt.data) ? evt.data : evt);
          return res;
        },
  
        e: {
          handleEventData: false
        }
      },
      offCompassChange: {
        b: function b() {
          _JS_BRIDGE.call('watchShake', { monitorCompass: false });
        }
      },
  
      onBackgroundAudioPlay: {
        b: function b(opt) {
          _CACHE.getBAPSI.on();
          return opt;
        }
      },
      offBackgroundAudioPlay: {},
  
      onBackgroundAudioPause: {
        b: function b(opt) {
          _CACHE.getBAPSI.on();
          return opt;
        }
      },
      offBackgroundAudioPause: {},
  
      onBackgroundAudioStop: {
        b: function b(opt) {
          _CACHE.getBAPSI.on();
          return opt;
        }
      },
      offBackgroundAudioStop: {},
  
      onAppResume: {},
      offAppResume: {},
      onAppPause: {},
      offAppPause: {},
  
      ///////////////////////////// device /////////////////////////////
      getNetworkType: {
        a: function a(res) {
          if (!__isUndefined(res.networkInfo)) {
            res.networkType = __tuc(res.networkInfo);
          }
          //鏃犻渶杩欎箞澶氬瓧娈�
          delete res.err_msg;
          delete res.networkInfo;
          return res;
        }
      },
      scan: {
        b: function b(opt) {
          _mapping(opt, {
            _: 'type'
          });
          opt.type = opt.type || 'qr';
          return opt;
        },
        a: function a(res) {
          if (res.qrCode || res.barCode) {
            res.code = res.qrCode || res.barCode;
            delete res.qrCode;
            delete res.barCode;
          }
  
          return res;
        }
      },
      watchShake: {
        b: function b(opt) {
          //鐢ㄦ埛鐪熸浣跨敤姝ゆ帴鍙ｆ椂涓嶉渶瑕佷紶鍏ヤ换浣曞弬鏁�
          //绉婚櫎鎵€鏈夊叆鍙傦紝鍏ュ弬琚紶鎰熷櫒浜嬩欢鐩戝惉寮€鍏冲崰鐢�
          //濡傛灉鏈夊叆鍙傦紝ios 涓嶄細璋冪敤鍥炶皟锛宎ndroid 浼氱洿鎺ヨ皟鐢ㄥ洖璋冦€�
          if (__isEmptyObject(opt)) {
            opt = null;
          }
          return opt;
        }
      },
      getLocation: {
        b: function b(opt) {
          _mapping(opt, {
            accuracy: 'horizontalAccuracy',
            type: 'requestType%d'
          });
          if (__isUndefined(opt.requestType)) {
            opt.requestType = 2;
          }
          if (__isAndroid()) {
            if (__isUndefined(opt.isHighAccuracy)) {
              opt.isHighAccuracy = true;
            }
            if (__isUndefined(opt.isNeedSpeed)) {
              opt.isNeedSpeed = true;
            }
          }
          return opt;
        },
        a: function a(res) {
          _mapping(res, {
            citycode: 'cityCode',
            adcode: 'adCode'
          });
          if (__isUndefined(res.city) && res.province) {
            res.city = res.province;
          }
          if (res.latitude) {
            res.latitude = _toType('%s', res.latitude);
          }
          if (res.longitude) {
            res.longitude = _toType('%s', res.longitude);
          }
          if (res.accuracy) {
            res.accuracy = _toType('%f', res.accuracy);
          }
          if (res.speed) {
            res.speed = _toType('%f', res.speed);
          }
          return res;
        }
      },
      getSystemInfo: {
        a: function a(res) {
          var pixelRatio = 'pixelRatio';
          var windowWidth = 'windowWidth';
          var windowHeight = 'windowHeight';
          var language = 'language';
          if (!__hasOwnProperty(res, 'error')) {
            res[pixelRatio] = _toType('%f', res[pixelRatio]);
            res[windowWidth] = _toType('%d', res[windowWidth]);
            res[language] = (res[language] || '').replace(/\s?\w+\/((?:\w|-)+)$/, '$1');
            res[windowHeight] = _toType('%d', res[windowHeight]);
            try {
              if (__isIOS() && AP.compareVersion('10.0.12') < 0) {
                res[windowHeight] = window.screen.height - 64;
              }
            } catch (err) {}
          }
          return res;
        }
      },
      vibrate: {},
      getServerTime: {},
  
      /////////////////////////// media //////////////////////////
      previewImage: {
        m: 'imageViewer',
        /**
         * 鎺ュ彛鏀归€� opt.current => opt.init
         *        opt.urls => opt.images
         *        榛樿鏀寔鐩存帴浼犲叆涓€涓暟缁勪綔涓� opt.urls
         */
        b: function b(opt) {
          _mapping(opt, {
            _: 'urls',
            current: 'init%d'
          });
          //澶勭悊榛樿绱㈠紩
          if (__isUndefined(opt.init)) {
            opt.init = 0;
          }
          //澶勭悊鍥剧墖閾炬帴
          opt.images = [];
          (opt.urls || []).forEach(function (url) {
            opt.images.push({
              u: url
            });
          });
          delete opt.urls;
  
          return opt;
        }
      },
      chooseImage: {
        b: function b(opt) {
          _mapping(opt, {
            _: 'count%d'
          });
          if (__isUndefined(opt.count)) {
            opt.count = 1;
          }
          if (__isString(opt.sourceType)) {
            opt.sourceType = [opt.sourceType];
          }
          return opt;
        },
        a: function a(res) {
          _mapping(res, {
            errorCode: 'error',
            errorDesc: 'errorMessage',
            localIds: 'apFilePaths',
            tempFilePaths: 'apFilePaths'
          });
          //鍒犻櫎鏃犵敤灞炴€�
          delete res.scene;
          delete res.localIds;
          delete res.tempFilePaths;
  
          //android 杩斿洖瀛楃涓�
          if (__isString(res.apFilePaths)) {
            res.apFilePaths = __parseJSON(res.apFilePaths);
          }
  
          return res;
        }
      },
      chooseVideo: {
        b: function b(opt) {
          _mapping(opt, {
            _: 'maxDuration%d'
          });
          if (__isString(opt.sourceType)) {
            opt.sourceType = [opt.sourceType];
          }
          if (__isString(opt.camera)) {
            opt.camera = [opt.camera];
          }
          return opt;
        },
        a: function a(res) {
          _mapping(res, {
            errorCode: 'error', //android errorCode
            errorDesc: 'errorMessage', // android errorDesc
            msg: 'errorMessage', // ios msg
            localId: 'apFilePath',
            tempFilePath: 'apFilePath',
            tempFile: 'apFilePath'
          });
          //鍒犻櫎鏃犵敤灞炴€�
          delete res.localId;
          delete res.tempFilePath;
          delete res.tempFile;
  
          switch (res.error) {
            case 0:
              //ios 鎴愬姛
              delete res.error;
              break;
            case 1:
              //ios 鍙傛暟鍑洪敊
              res.error = 2; //閫氱敤鍙傛暟鏃犳晥
              break;
            case 2:
              //ios 鐢ㄦ埛鍙栨秷
              res.error = 10; //android 鐢ㄦ埛鍙栨秷
              break;
            case 3:
              //ios 鎿嶄綔澶辫触
              res.error = 11; //android 鎿嶄綔澶辫触
              break;
            case 4:
              //ios 鏁版嵁澶勭悊澶辫触
              res.error = 12;
              break;
            default:
          }
  
          return res;
        }
      },
      uploadFile: {
        b: function b(opt) {
          _mapping(opt, {
            headers: 'header',
            fileName: 'name',
            fileType: 'type'
          });
          if (_isLocalId(opt.filePath)) {
            opt.localId = opt.filePath;
            delete opt.filePath;
          }
          return opt;
        },
        a: function a(res) {
          if (res.error === 2) {
            res.error = 11;
          }
          return res;
        }
      },
      saveImage: {
        b: function b(opt, cb) {
          _mapping(opt, {
            _: 'url',
            url: 'src'
          });
          if (__isFunction(cb)) {
            opt.cusHandleResult = true;
          }
          return opt;
        }
      },
      downloadFile: {
        b: function b(opt) {
          _mapping(opt, {
            headers: 'header'
          });
          return opt;
        },
        a: function a(res) {
          _mapping(res, {
            tempFilePath: 'apFilePath',
            errorCode: 'error'
          });
          delete res.tempFilePath;
          return res;
        }
      },
  
      ///////////////////////////////// 鏁版嵁 ////////////////////////////////
      setSessionData: {
        b: function b(opt) {
          opt = _fixOptData(opt);
          if (!__isObject(opt.data)) {
            opt.data = {
              data: opt.data
            };
          }
          __forEach(opt.data, function (key, value) {
            opt.data[key] = JSON.stringify(value);
          });
          return opt;
        }
      },
      getSessionData: {
        b: function b(opt) {
          //鐩存帴浼犲叆涓€涓� key
          if (__isString(opt._)) {
            opt.keys = [opt._];
          }
          //鐩存帴浼犲叆涓€涓暟缁�
          if (__isArray(opt._)) {
            opt.keys = opt._;
          }
          delete opt._;
          return opt;
        },
        a: function a(res) {
          __forEach(res.data, function (key, value) {
            res.data[key] = __parseJSON(value);
          });
          return res;
        }
      },
      ////////////////////////////// 寮€鏀炬帴鍙� ////////////////////////////////
      startBizService: {
        b: function b(opt) {
          _mapping(opt, {
            _: 'name',
            params: 'param%s'
          });
          return opt;
        }
      },
      tradePay: {
        b: function b(opt) {
          _mapping(opt, {
            _: 'orderStr'
          });
          return opt;
        }
      },
      getAuthCode: {
        b: function b(opt) {
          _mapping(opt, {
            _: 'scopes'
          });
          if (__isString(opt.scopes)) {
            opt.scopeNicks = [opt.scopes];
          } else if (__isArray(opt.scopes)) {
            opt.scopeNicks = opt.scopes;
          } else {
            opt.scopeNicks = ['auth_base'];
          }
          delete opt.scopes;
  
          return opt;
        },
        a: function a(res) {
          _mapping(res, {
            authcode: 'authCode'
          });
          return res;
        }
      },
      getAuthUserInfo: {
        a: function a(res) {
          _mapping(res, {
            nick: 'nickName',
            userAvatar: 'avatar'
          });
          return res;
        }
      },
      ////////////////////////// v0.1.3+ ///////////////////////////////
      openInBrowser: {
        /**
         * 鎺ュ彛鍙洿鎺ヤ紶鍏ヤ竴涓瓧绗︿覆锛坥pt.url锛�
         */
        b: function b(opt) {
          return _mapping(opt, {
            _: 'url'
          });
        }
      },
      openLocation: {
        b: function b(opt) {
          if (__isUndefined(opt.scale)) {
            opt.scale = 15; //榛樿缂╂斁15绾�
          }
          return opt;
        }
      },
      showPopMenu: {
        b: function b(opt) {
          //鍏朵粬灞炴€ф槧灏�
          _mapping(opt, {
            _: 'items',
            items: 'menus'
          });
  
          //popMenuClick浜嬩欢鍙洃鍚竴娆★紝闃叉澶氭鍥炶皟
          if (__isObject(_CACHE.showPopMenu)) {
            _CACHE.showPopMenu.menus = {};
          } else {
            _CACHE.showPopMenu = {
              menus: {}
            };
          }
          if (__isArray(opt.menus)) {
            var menus = opt.menus;
            //闇€瑕佸鍒朵竴浠斤紝涓嶈兘鍦ㄥ師鏁扮粍涓婁慨鏀癸紝浼氱牬鍧忕敤鎴锋暟鎹�
            opt.menus = [];
            menus.forEach(function (item, i) {
              //鏀寔鑿滃崟鐩存帴鏄釜瀛楃涓叉暟缁�
              if (__isString(item)) {
                item = {
                  title: item
                };
              }
              item = _mapping(__extend({}, item), {
                title: 'name%s',
                tag: 'tag%s',
                badge: 'redDot%s'
              }, {
                tag: i,
                title: item.title,
                badge: __isUndefined(item.badge) ? '-1' : item.badge
              });
              if (!__isUndefined(item.icon)) {
                item.icon = _toType('%b', item.icon);
              }
              opt.menus.push(item);
              _CACHE.showPopMenu.menus[item.name] = i;
            });
          }
          return opt;
        },
        d: function d(_opt, cb) {
          var apiName = 'showPopMenu';
          if (_CACHE.showPopMenu.onEvent !== true) {
            _CACHE.showPopMenu.onEvent = true;
            //鐩戝惉鐐瑰嚮浜嬩欢
            AP.on('popMenuClick', function (evt) {
              var res = {};
              _mapping(res, {
                title: 'index%d'
              }, {
                title: __isObject(evt.data) && evt.data.title ? _CACHE.showPopMenu.menus[evt.data.title] : '-1'
              });
              cb(res);
            });
          }
  
          //璋冪敤鏂规硶
          _JS_BRIDGE.call(apiName, _opt, function (result) {
            //result 骞堕潪鐪熸鐨勮繑鍥炲€硷紝浣嗘槸瑕佸鐞嗘帴鍙ｉ敊璇�
            _handleApiError(apiName, result);
          });
        }
      },
      setOptionButton: {
        m: 'setOptionMenu',
        b: function b(opt) {
          if (__isString(opt._)) {
            opt.title = opt._;
            delete opt._;
          }
          if (__isArray(opt._)) {
            opt.items = opt._;
            delete opt._;
          }
          _mapping(opt, {
            items: 'menus',
            type: 'iconType',
            badge: 'redDot%s'
          });
          if (!__isUndefined(opt.icon)) {
            opt.icon = _toType('%b', opt.icon);
          }
          //optionMenu浜嬩欢鍙洃鍚竴娆★紝闃叉澶氭鍥炶皟
          if (__isObject(_CACHE.setOptionButton)) {
            _CACHE.setOptionButton.menus = [];
          } else {
            _CACHE.setOptionButton = {
              menus: []
            };
          }
          if (__isArray(opt.menus)) {
            var menus = opt.menus;
            //闇€瑕佸鍒朵竴浠斤紝涓嶈兘鍦ㄥ師鏁扮粍涓婁慨鏀癸紝浼氱牬鍧忕敤鎴锋暟鎹�
            opt.menus = [];
            menus.forEach(function (item, i) {
              item = _mapping(__extend({}, item), {
                type: 'icontype',
                badge: 'redDot%s'
              }, {
                badge: __isUndefined(item.badge) ? '-1' : item.badge
              });
              if (!__isUndefined(item.icon)) {
                item.icon = _toType('%b', item.icon);
              }
              opt.menus.unshift(item);
              _CACHE.setOptionButton.menus[menus.length - 1 - i] = i;
            });
            if (opt.menus.length > 0 && __isUndefined(opt.override)) {
              opt.override = true;
            }
          }
          //姣忔 setOptionMenu 瑕佹敞鍐屾柊鐨勪簨浠�
          if (__isFunction(_CACHE.setOptionButton.onEvent)) {
            AP.off('optionMenu', _CACHE.setOptionButton.onEvent);
          }
          if (__isFunction(opt.onClick)) {
            var onClick = opt.onClick;
            var eventHandler = function eventHandler(evt) {
              var index = 0;
              var res = {};
              if (__isObject(evt.data) && __isNumber(evt.data.index) && _CACHE.setOptionButton.menus.length > 0) {
                index = _CACHE.setOptionButton.menus[evt.data.index];
              }
              res.index = _toType('%d', index);
              onClick(res);
            };
            _CACHE.setOptionButton.onEvent = eventHandler;
            //鐩戝惉鐐瑰嚮浜嬩欢
            if (opt.reset !== true) {
              AP.on('optionMenu', eventHandler);
            }
            delete opt.onClick;
          }
          return opt;
        },
        d: function d(_opt, cb) {
          _JS_BRIDGE.call('setOptionMenu', _opt, cb);
          //iOS 娌℃湁鍥炶皟, 10.0.8
          if (__isIOS()) {
            _fakeCallBack(cb, {});
          }
          AP.showOptionButton();
        }
      },
      showOptionButton: {
        m: 'showOptionMenu'
      },
      hideOptionButton: {
        m: 'hideOptionMenu'
      },
      showBackButton: {},
      hideBackButton: {},
      allowBack: {
        d: function d(opt) {
          var onBack = 'onBack';
          _mapping(opt, {
            _: 'allowButton'
          });
          opt.allowButton = __isUndefined(opt.allowButton) ? true : !!opt.allowButton;
  
          if (__isBoolean(opt.allowGesture)) {
            _JS_BRIDGE.call('setGestureBack', {
              val: opt.allowGesture
            });
          }
          if (__isObject(_CACHE[onBack])) {
            _CACHE[onBack].allowButton = opt.allowButton;
          } else {
            _CACHE[onBack] = {
              allowButton: opt.allowButton
            };
            AP.onBack();
          }
          if (opt.allowButton === false && _CACHE[onBack].event) {
            _CACHE[onBack].event.preventDefault();
          }
        }
      },
      startRecord: {
        m: 'startAudioRecord',
        b: function b(opt) {
          _mapping(opt, {
            maxDuration: 'maxRecordTime%f',
            minDuration: 'minRecordTime%f',
            bizType: 'business'
          }, {
            maxDuration: opt.maxDuration || 60,
            minDuration: opt.minDuration || 1
          });
          if (__isUndefined(opt.business)) {
            opt.business = _MEDIA_BUSINESS;
          }
          // 10.0.5缁熶竴鎴愮
          // opt.maxRecordTime *= 1000;
          // opt.minRecordTime *= 1000;
          return opt;
        },
        a: function a(res) {
          _mapping(res, {
            tempFilePath: 'apFilePath',
            identifier: 'apFilePath'
          });
          return res;
        }
      },
      stopRecord: {
        m: 'stopAudioRecord'
      },
      cancelRecord: {
        m: 'cancelAudioRecord'
      },
      playVoice: {
        m: 'startPlayAudio',
        b: function b(opt) {
          _mapping(opt, {
            _: 'filePath',
            filePath: 'identifier',
            bizType: 'business'
          });
          if (__isUndefined(opt.business)) {
            opt.business = _MEDIA_BUSINESS;
          }
          return opt;
        },
        a: function a(res) {
          _mapping(res, {
            identifier: 'filePath'
          });
          return res;
        }
      },
      pauseVoice: {
        m: 'pauseAudioPlay'
      },
      resumeVoice: {
        m: 'resumeAudioPlay'
      },
      stopVoice: {
        m: 'stopAudioPlay'
      },
      makePhoneCall: {
        d: function d(opt, cb) {
          var url = 'tel:';
          _mapping(opt, {
            _: 'number'
          });
          url += opt.number;
          _JS_BRIDGE.call('openInBrowser', { url: url }, cb);
        }
      },
      playBackgroundAudio: {
        b: function b(opt) {
          _mapping(opt, {
            _: 'url',
            url: 'audioDataUrl%s',
            title: 'audioName%s',
            singer: 'singerName%s',
            describe: 'audioDescribe%s',
            logo: 'audioLogoUrl%s',
            cover: 'coverImgUrl%s',
            bizType: 'business'
          }, {
            bizType: opt.bizType || _MEDIA_BUSINESS
          });
          return opt;
        },
        a: function a(res) {
          _mapping(res, {
            describe: 'errorMessage'
          });
          _handleResultSuccess(res, 12, 0);
          return res;
        }
      },
      pauseBackgroundAudio: {
        a: function a(res) {
          _mapping(res, {
            describe: 'errorMessage'
          });
          _handleResultSuccess(res, 12, 0);
          return res;
        }
      },
      stopBackgroundAudio: {
        a: function a(res) {
          _mapping(res, {
            describe: 'errorMessage'
          });
          _handleResultSuccess(res, 12, 0);
          return res;
        }
      },
      seekBackgroundAudio: {
        b: function b(opt) {
          _mapping(opt, {
            _: 'position',
            bizType: 'business'
          }, {
            bizType: opt.bizType || _MEDIA_BUSINESS
          });
          opt.position = _toType('%f', opt.position);
          return opt;
        },
        a: function a(res) {
          _mapping(res, {
            describe: 'errorMessage'
          });
          _handleResultSuccess(res, 12, 0);
          return res;
        }
      },
      getBackgroundAudioPlayerState: {
        a: function a(res) {
          _mapping(res, {
            audioDataUrl: 'url',
            describe: 'errorMessage'
          });
          _handleResultSuccess(res, 12, 0);
          return res;
        }
      }
  
      //////////////////////////// 鏈紑鏀炬柟娉� //////////////////////////////
  
      //numInput: {},
      //inputFocus: {},
      //inputBackFill: {},
      //numInputReset: {},
      //inputBlur: {},
      //downloadApp: {},
      //getSwitchControlStatus: {},
      //setToolbarMenu: {},
  
  
      //uploadImage: {}, 锛焌pFilePath
      //downloadImage: {}, 锛焌pFilePath
      //saveFile: {},
      //rpc: {},
      //startApp: {},
      //remoteLog: {},
      //getConfig: {},
      //getUserInfo: {},
      //setSharedData: {},
      //getSharedData: {},
      //removeSharedData: {},
      //setClipboard: {},
      //getClipboard: {},
      //login: {},
      //sendSMS: {},
      //isSupportShortCut: {},
      //setShortCut: {},
      //removeShortCut: {},
      //registerSync: {},
      //responseSyncNotify: {},
      //unregisterSync: {},
      //refreshSyncSkey: {},
      //getScreenBrightness: {},
      //setScreenBrightness: {},
      //isInstalledApp: {},
      //getAllContacts: {},
      //preRender: {},
      //finishRender: {},
      //clearRender: {},
  
  
      //setPullDownText: {},
      //hideTransBack: {},
      //limitAlert: {},
      //startPackage: {},
      //getClientInfo: {},
      //reportData: {},
      //getSceneStackInfo: {},
      //getAppInfo: {},
      //rsa: {},
      //shareToken: {},
      //snapshot: {},
      //getAppToken: {},
      //ping: {},
      //checkJSAPI: {},
      //checkApp: {},
      //commonList: {},
      //beehiveOptionsPicker: {},
      //beehiveGetPOI: {},
      //addEventCal: {},
      //removeEventCal: {},
      //speech: {},
      //selectAddress: {},
      //nfch5plugin: {},
    };
    /********************* AP 瀵硅薄鍏朵粬闈欐€佸睘鎬у強鍚屾鏂规硶 ************************/
  
    //Alipay 缂╁啓
    var AP = {
      version: '3.1.1',
      ua: _UA,
      isAlipay: __inUA(/AlipayClient/),
      alipayVersion: function () {
        var version = _UA.match(/AlipayClient[a-zA-Z]*\/(\d+(?:\.\d+)+)/);
        return version && version.length ? version[1] : '';
      }(),
      /////////////////////////////// AP 鍚屾鏂规硶 /////////////////////////////
      /**
       * 鐗堟湰姣旇緝
       * @method compareVersion
       * @param  {String}       targetVersion 鐩爣鐗堟湰
       * @return {Number}                     姣旇緝缁撴灉锛�1浠ｈ〃褰撳墠鐗堟湰澶т簬鐩爣鐗堟湰锛�-1鐩稿弽锛岀浉鍚屼负0
       */
      compareVersion: function compareVersion(targetVersion) {
        var alipayVersion = AP.alipayVersion.split('.');
  
        targetVersion = targetVersion.split('.');
        for (var i = 0, n1, n2; i < alipayVersion.length; i++) {
          n1 = parseInt(targetVersion[i], 10) || 0;
          n2 = parseInt(alipayVersion[i], 10) || 0;
          if (n1 > n2) return -1;
          if (n1 < n2) return 1;
        }
        return 0;
      },
  
      /**
       * 鑾峰彇 url 涓婄殑鍏ㄩ儴浼犲弬骞惰浆鎴愬璞�
       * @method parseQueryString
       * @param  {String}          queryString
       * @return {Object}          location.search 瀵瑰簲鐨勯敭鍊煎璞�
       */
      parseQueryString: function parseQueryString(queryString) {
        var result = {};
        var searchStr = queryString || window.location.search;
        var bool = {
          true: true,
          false: false
        };
        var kv;
        searchStr = searchStr.indexOf('?') === 0 ? searchStr.substr(1) : searchStr;
        searchStr = searchStr ? searchStr.split('&') : '';
        for (var i = 0; i < searchStr.length; i++) {
          kv = searchStr[i].split('=');
          kv[1] = decodeURIComponent(kv[1]);
          //Boolean
          kv[1] = __isUndefined(bool[kv[1]]) ? kv[1] : bool[kv[1]];
          //Number
          //kv[1] = +kv[1] + '' === kv[1] ? +kv[1] : kv[1];
          result[kv[0]] = kv[1];
        }
        _apiRemoteLog('parseQueryString');
        return result;
      },
  
      /**
       * 寮€鍚� debug 妯″紡锛屾帶鍒跺彴鎵撳嵃鎺ュ彛璋冪敤鏃ュ織
       * @type {Object}
       */
      enableDebug: function enableDebug() {
        AP.debug = true;
      },
  
  
      /**
       * 缁戝畾鍏ㄥ眬浜嬩欢
       * @method on
       * @param  {String}   evts 浜嬩欢绫诲瀷锛屽涓簨浠剁敤绌烘牸鍒嗛殧
       * @param  {Function} fn     浜嬩欢鍥炶皟
       */
      on: function on(evts, fn) {
        var isReady = evts === 'ready';
        var isSimple = isReady || evts === 'back';
  
        if (isSimple) {
          document.addEventListener(isReady ? _JS_BRIDGE_NAME + 'Ready' : evts, fn, false);
        } else {
          evts = evts.replace(/ready/, _JS_BRIDGE_NAME + 'Ready');
          evts.split(/\s+/g).forEach(function (eventName) {
            document.addEventListener(eventName, fn, false);
          });
        }
      },
  
      /**
       * 绉婚櫎浜嬩欢鐩戝惉
       * @method off
       * @param  {String}   evt    浜嬩欢绫诲瀷
       * @param  {Function} fn     浜嬩欢鍥炶皟
       */
      off: function off(evt, fn) {
        document.removeEventListener(evt, fn, false);
      },
      trigger: function trigger(evtName, data) {
        var evt = document.createEvent('Events');
        evt.initEvent(evtName, false, true);
        evt.data = data || {};
        document.dispatchEvent(evt);
        return evt;
      },
  
  
      /**
       * ready浜嬩欢鐙珛鏂规硶
       * @method ready
       * @param  {Function} fn ready 鍥炶皟
       */
      ready: function ready(fn) {
        if (__isSupportPromise()) {
          return new Promise(realReady);
        } else {
          realReady();
        }
  
        function realReady(resolve) {
          if (_isBridgeReady()) {
            if (__isFunction(fn)) {
              fn();
            }
            if (__isFunction(resolve)) {
              resolve();
            }
          } else {
            AP.on('ready', function () {
              //闃叉 jsbridge 鏅氭敞鍏�
              _isBridgeReady();
  
              if (__isFunction(fn)) {
                fn();
              }
              if (__isFunction(resolve)) {
                resolve();
              }
            });
          }
        }
      },
  
      /*<<< inc >>>*/
      localLog: function localLog() {
        var args = __argumentsToArg(arguments);
        args.forEach(function (arg, i) {
          args[i] = __superToString(arg);
        });
        if (__isIOS()) {
          AP.ready(function () {
            _JS_BRIDGE.call('H5APLog', {
              content: args.join('  ')
            });
          });
        }
        // android
        console.log.apply(console, args);
        // 鍩嬬偣
        _apiRemoteLog('localLog');
      },
  
      /*<<< endinc >>>*/
  
      /**
       * 閫氱敤鎺ュ彛锛岃皟鐢ㄦ柟寮忕瓑鍚孉lipayJSBridge.call
       * 鏃犻渶鑰冭檻ready浜嬩欢锛屼細鑷姩鍔犲叆鍒板緟鎵ц闃熷垪
       * @method call
       */
      call: function call() {
        var args = __argumentsToArg(arguments);
        if (__isSupportPromise()) {
          return AP.ready().then(function () {
            return new Promise(realCall);
          });
        } else {
          //濡傛灉鐩存帴鍔犲埌 ready 浜嬩欢閲屼細鏈変笉瑙﹀彂璋冪敤鐨勬儏鍐�
          //AP.ready(realCall);
  
          if (_isBridgeReady()) {
            realCall();
          } else {
            //淇濆瓨鍦ㄥ緟鎵ц闃熷垪
            _WAITING_QUEUE.push(args);
          }
        }
  
        function realCall(resolve, reject) {
          var apiName;
          var opt; //鍘熷 option
          var cb; //鍘熷 callback
          var _opt; //澶勭悊杩囩殑 option
          var _cbSFC; //涓嶅悓鐘舵€佸洖璋�
          var _cb; //澶勭悊杩囩殑 callback
          var onEvt;
          var offEvt;
          var doingFn;
          var logOpt;
          //寮哄埗杞负 name + object + function 褰㈠紡鐨勫叆鍙�
          apiName = args[0] + '';
          opt = args[1];
          cb = args[2];
          //澶勭悊 cb 鍜� opt 鐨勯『搴�
          if (__isUndefined(cb) && __isFunction(opt)) {
            cb = opt;
            opt = {};
          }
          //鎺ュ彛鏈夐潪瀵硅薄鍏ュ弬锛岃涓哄揩鎹峰叆鍙�
          if (!__isObject(opt) && args.length >= 2) {
            //before銆乨oing銆乤fter 鏂规硶涓洿鎺ュ彇 opt._ 浣滀负鍙傛暟
            opt = {
              _: opt
            };
          }
          //鍏滃簳
          if (__isUndefined(opt)) {
            opt = {};
          }
  
          //澶勭悊鍏ュ弬
          _opt = _getApiOption(apiName, opt, cb);
  
          //鑾峰彇鍥炶皟
          _cbSFC = _getApiCallBacks(apiName, _opt);
  
          if (__isUndefined(_opt)) {
            console.error('please confirm ' + apiName + '.before() returns the options.');
          }
          //鑾峰彇 api 鐨� d 鏂规硶
          doingFn = _getApiDoing(apiName);
  
          //杈撳嚭鍏ュ弬
          logOpt = __hasOwnProperty(opt, '_') ? opt._ : opt;
          _apiLog(apiName, logOpt, _opt);
  
          //鏄惁鏄簨浠剁洃鍚�
          onEvt = _getApiOnEvent(apiName);
          //鏄惁鏄簨浠剁Щ闄�
          offEvt = _getApiOffEvent(apiName);
  
          //澶勭悊鍥炶皟
          _cb = function _cb(res) {
            var _res = void 0;
            res = res || {};
  
            if (onEvt && _getApiExtra(apiName, 'handleEventData') !== false) {
              _res = _handleEventData(res);
            }
  
            //澶勭悊缁撴灉
            _res = _getApiResult(apiName, _res || res, _opt, opt, cb);
            if (__isUndefined(_res)) {
              console.error('please confirm ' + apiName + '.after() returns the result.');
            }
            //澶勭悊閿欒鐮�
            _res = _handleApiError(apiName, _res);
            //鎵撳嵃 debug 鏃ュ織
            _apiLog(apiName, logOpt, _opt, res, _res);
  
            if (__hasOwnProperty(_res, 'error') || __hasOwnProperty(_res, 'errorMessage')) {
              if (__isFunction(reject)) {
                reject(_res);
              }
              if (__isFunction(_cbSFC.fail)) {
                _cbSFC.fail(_res);
              }
            } else {
              if (__isFunction(resolve)) {
                resolve(_res);
              }
              if (__isFunction(_cbSFC.success)) {
                _cbSFC.success(_res);
              }
            }
            if (__isFunction(_cbSFC.complete)) {
              _cbSFC.complete(_res);
            }
            //鎵ц鐢ㄦ埛鐨勫洖璋�
            if (__isFunction(cb)) {
              cb(_res);
            }
          };
  
          //濡傛灉瀛樺湪 d 鐩存帴鎵ц锛屽惁鍒欐墽琛� AlipayJSBridge.call
          if (__isFunction(doingFn)) {
            doingFn(_opt, _cb, opt, cb);
          } else if (onEvt) {
            _cacheEventHandler(onEvt, cb, _cb, _cbSFC);
            AP.on(onEvt, _cb);
          } else if (offEvt) {
            _removeEventHandler(offEvt, cb);
          } else {
            _JS_BRIDGE.call(_getApiName(apiName), _opt, _cb);
          }
          _apiRemoteLog(apiName);
        }
      },
  
      /**
       * 鎵╁睍 JSAPI 鐨勬帴鍙�
       */
      extendJSAPI: function extendJSAPI(JSAPI, isInitAP) {
        //濡傛灉鏄瓧绗︿覆锛岀洿鎺ュ綋浣滄帴鍙ｅ悕
        if (!isInitAP && __isString(JSAPI)) {
          JSAPI = [JSAPI];
        }
        __forEach(JSAPI, function (key) {
          var apiName = key;
          // 濡傛灉鏄垵濮嬪寲璋冪敤锛屽垯鏃犻渶鍐嶆敞鍐屽埌 _JSAPI 瀵硅薄涓�
          if (isInitAP !== true) {
            var api = JSAPI[apiName];
            //濡傛灉鎺ュ彛瀹氫箟鏄竴涓� function锛屽嵆浣滀负 doing 鏂规硶
            if (__isFunction(api)) {
              api = {
                doing: api
              };
            }
            if (__isString(api)) {
              apiName = api;
              api = {};
              api[apiName] = {};
            }
  
            _JSAPI[apiName] = _mapping(_JSAPI[apiName] || {}, {
              mapping: 'm',
              before: 'b',
              doing: 'd',
              after: 'a'
            }, api);
  
            if (__isObject(api.extra)) {
              _JSAPI[apiName].e = _JSAPI[apiName].e || {};
              _JSAPI[apiName].e = __extend(_JSAPI[apiName].e, api.extra);
            }
          }
  
          // TODO: 闇€瑕侀獙璇乁3鏄惁鏀寔bind鍙傛暟
          // AP[apiName] = AP.call.bind(null, apiName);
          AP[apiName] = function () {
            return AP.call.apply(null, [apiName].concat(__argumentsToArg(arguments)));
          };
        }, true);
      }
    };
    AP.extendJSAPI.mapping = _mapping;
    AP.extendJSAPI.toType = _toType;
  
    if (!AP.isAlipay) {
      console.warn('Run ' + 'alipayjsapi' + '.js in ' + 'Alipay' + ' please!');
    }
    /*********************** 娉ㄥ唽寮傛 JSAPI ***********************/
  
    (function () {
      // 灏� JSAPI 娉ㄥ唽鍒� AP 涓�
      AP.extendJSAPI(_JSAPI, true);
      //ready 鍏ュ彛
      AP.on('ready', function () {
        if (!!_WAITING_QUEUE.length) {
          next();
        }
        function next() {
          __raf(function () {
            var args = _WAITING_QUEUE.shift();
            AP.call.apply(null, args);
            if (_WAITING_QUEUE.length) next();
          });
        }
      });
    })();
    /******************JSAPI 鐩稿叧杈呭姪澶勭悊鏂规硶 _ ********************/
    /**
     * 鏄惁ready
     * @method _isBridgeReady
     * @return {Boolean} 鏄惁 鍙互璋冪敤 AlipayJSBridge.call
     */
    function _isBridgeReady() {
      _JS_BRIDGE = _JS_BRIDGE || self[_JS_BRIDGE_NAME];
      return _JS_BRIDGE && _JS_BRIDGE.call;
    }
    /**
     * 鑾峰彇缂撳瓨鐩稿叧鎺ュ彛鐨� business
     * @method _getStorageBusiness
     * @return {String} business
     */
    function _getStorageBusiness() {
      var href = self && self.location && self.location.href ? self.location.href : '';
      var business = href.replace(/^(http|https):\/\//i, '').split('/')[0];
      return business;
    }
    /**
     * 鍋囧洖璋冿紝鐢ㄤ簬娌℃湁瀹炵幇鍥炶皟鐨勬帴鍙�
     * @param {Function} cb
     * @param {Object} arg
     */
    function _fakeCallBack(cb, arg) {
      setTimeout(function () {
        cb(arg);
      }, 1);
    }
    /**
     * 鏄惁鏄� localId
     * @method _isLocalId
     * @param  {String}   localId 璧勬簮瀹氫綅绗�
     * @return {Boolean}          鏄惁 localId
     */
    function _isLocalId(localId) {
      return (/^[a-z0-9|]+$/i.test(localId)
      );
    }
    /**
     * 鏄惁鏄� apFilePath 鍦板潃
     * @method _isApFilePath
     * @param  {String}      apFilePath 10.0.2鏂扮粺涓€璧勬簮瀹氫綅绗�
     * @return {Boolean}                鏄惁 apFilePath
     */
    // function _isApFilePath(apFilePath) {
    //   return /^https:\/\/resource\/[a-z0-9|]+\./i.test(apFilePath)
    // }
  
  
    /**
     * 淇鏌愪釜蹇嵎鍏ュ弬鏄璞＄被鍨�
     * @method _fixOptData
     * @param  {Object}    opt     鍏ュ弬瀵硅薄
     * @param  {String}    dataKey 蹇嵎鍏ュ弬鐨� key
     * @return {Object}            瀵硅薄
     */
    function _fixOptData(opt, dataKey) {
      var objectArg = false;
      dataKey = dataKey || 'data';
      if (__hasOwnProperty(opt, '_')) {
        //鍏ュ弬涓嶆槸涓€涓璞�
        opt[dataKey] = opt._;
        delete opt._;
      } else {
        //鍏ュ弬鏄竴涓璞★紝浣嗗彲鑳芥湁闄や簡 data 澶栫殑鍏朵粬 key
        __forEach(opt, function (key) {
          if (key !== dataKey) {
            objectArg = true;
          }
        });
        if (objectArg) {
          objectArg = opt;
          opt = {};
          opt[dataKey] = objectArg;
        }
      }
      return opt;
    }
  
    /**
     * 鍒ゆ柇浜嬩欢娉ㄥ唽鐩戝惉鏄惁鏄悓涓€涓洖璋冿紝骞惰繑鍥炴鍥炶皟鍑芥暟
     * @method _getSameHandlers
     * @param  {String}        evt 浜嬩欢鍚�
     * @param  {Function}      cb  鐩稿悓鍥炶皟鍑芥暟
     * @return {Function / false}            鏄惁鏄洖璋�
     */
    function _getSameHandlers(evt, cb, isRemoveCache) {
      var sameHandlers = false;
      var sameIndex;
      if (!__isUndefined(evt)) {
        if (!_CACHE.EVENTS) {
          _CACHE.EVENTS = {};
        }
        if (!_CACHE.EVENTS[evt]) {
          _CACHE.EVENTS[evt] = {
            callbacks: []
          };
        }
        if (!_CACHE.EVENTS[evt].callbacks) {
          _CACHE.EVENTS[evt].callbacks = [];
        }
  
        _CACHE.EVENTS[evt].callbacks.forEach(function (item, i) {
          if (item.cb === cb) {
            sameHandlers = item;
            sameIndex = i;
          }
        });
        if (isRemoveCache && __isNumber(sameIndex)) {
          _CACHE.EVENTS[evt].callbacks.splice(sameIndex, 1);
        }
      }
      return sameHandlers;
    }
  
    function _cacheEventHandler(evt, cb, _cb, _cbSFC) {
      var sameCBs = _getSameHandlers(evt, cb);
      if (!sameCBs) {
        _CACHE.EVENTS[evt].callbacks.push({
          cb: cb,
          _cb: _cb,
          _cbSFC: _cbSFC
        });
      }
    }
  
    function _removeEventHandler(evt, cb) {
      var handlers = _getSameHandlers(evt, cb, true);
      if (!__isFunction(cb)) {
        //绉婚櫎鍏ㄩ儴閫氳繃 AP.onXXXX娉ㄥ唽鐨勭洃鍚�
        _CACHE.EVENTS[evt].callbacks.forEach(function (item) {
          AP.off(evt, item._cb);
        });
        _CACHE.EVENTS[evt].callbacks = [];
      } else if (handlers) {
        AP.off(evt, handlers._cb);
      }
    }
  
    /**
     * 鑾峰彇瑕佹敞鍐岀殑浜嬩欢绫诲瀷
     * @method _getApiOnEvent
     * @param  {String}     apiName API 鍚嶇О
     * @return {String}             浜嬩欢绫诲瀷锛屽鏋滀笉鏄簨浠剁被 API 灏辫繑鍥� false
     */
    function _getApiOnEvent(apiName) {
      return _getApiEvent('on', apiName);
    }
  
    /**
     * 鑾峰彇瑕佺Щ闄ょ殑浜嬩欢绫诲瀷
     * @method _getApiOffEvent
     * @param  {String}        apiName 鎺ュ彛鍚�
     * @return {String}                浜嬩欢绫诲瀷锛屽鏋滀笉鏄簨浠剁被 API 灏辫繑鍥� false
     */
    function _getApiOffEvent(apiName) {
      return _getApiEvent('off', apiName);
    }
  
    /**
     * 鑾峰彇浜嬩欢鍚�
     * @method _getApiEvent
     * @param  {String}     prefix  鍓嶇紑
     * @param  {String}     apiName 鎺ュ彛鍚�
     * @return {String}             浜嬩欢鍚�
     */
    function _getApiEvent(prefix, apiName) {
      var jsapi = _JSAPI[apiName];
      var evt = false;
      var evtApiPattern = prefix === 'off' ? /^off([A-Z])(\w+)/ : /^on([A-Z])(\w+)/;
  
      // 浠� on銆乷ff 寮€澶寸殑 api 鏄� 浜嬩欢锛屾帓闄� AP.on銆丄P.off 鏂规硶
      if (jsapi && evtApiPattern.test(apiName)) {
        apiName = apiName.match(evtApiPattern);
        evt = jsapi.m;
        if (!evt && apiName[1] && apiName[2]) {
          evt = __tlc(apiName[1]) + apiName[2];
        }
      }
      return evt;
    }
  
    /**
     * 鑾峰彇鎺ュ彛鎵╁睍瀛楁
     * @method _getApiExtra
     * @param  {String}     apiName  鎺ュ彛鍚�
     * @param  {String}     extraKey 鎵╁睍瀛楁鐨� key
     * @return {Any}                 杩斿洖鐩稿簲瀛楁鍊�
     */
    function _getApiExtra(apiName, extraKey) {
      var jsapi = _JSAPI[apiName] || {};
      var extra = jsapi.e || jsapi.extra || {};
      return extra[extraKey];
    }
    /**
     * 鑾峰彇 opt._锛岄€傞厤鐩存帴浼犲叆鏌愪釜鍙傛暟鐨勫満鏅紝鍗宠皟鐢� api 鏃剁浜屼釜鍙傛暟浼犲叆鐨勪笉鏄� Object 鐨勬儏鍐�
     * @method _getObjArg
     * @param  {Object}   opt AP.call 鏂规硶鐨� opt 鍏ュ弬
     * @return {any}       涓€鑸槸 String锛岄粯璁ゆ槸 undefined
     */
    // function _getObjArg(opt, optTarget) {
    //   var arg = optTarget;
    //   if (!__isUndefined(opt._)) {
    //     arg = opt._;
    //     delete opt._;
    //   }
    //   return arg;
    // }
  
    /**
     * 鑾峰彇 JSAPI 鏄犲皠鎺ュ彛鍚�
     * @method _getApiName
     * @param  {String}    apiName AP 鎺ュ彛鍚�
     * @return {String}            AlipayJSBridge 鎺ュ彛鍚�
     */
    function _getApiName(apiName) {
      var jsapi = _JSAPI[apiName];
      return jsapi && jsapi.m ? jsapi.m : apiName;
    }
  
    /**
     * 澶勭悊 JSAPI 鐨勫叆鍙�
     * @method _getApiOption
     * @param  {String}      apiName JSAPI 鍚嶇О
     * @param  {Object}      opt     JSAPI 鍏ュ弬
     * @param  {Function}    cb      JSAPI 鏈鐞嗚繃鐨勫洖璋冨嚱鏁�
     * @return {Object}              澶勭悊杩囩殑 opt
     */
    function _getApiOption(apiName, opt, cb) {
      var jsapi = _JSAPI[apiName];
      var finalOpt = jsapi && jsapi.b ? jsapi.b(__extend({}, opt), cb) : opt;
      var modifier = _getApiExtra(apiName, 'optionModifier');
      if (__isFunction(modifier)) {
        var modifyOpt = modifier(finalOpt, cb);
        if (__isObject(modifyOpt)) {
          finalOpt = modifyOpt;
        }
      }
  
      return finalOpt;
    }
    /**
     * 鑾峰彇涓嶅悓鐘舵€佸洖璋�
     * @method _getApiCallBacks
     * @param  {String}        apiName  鎺ュ彛鍚�
     * @param  {Object}        opt      鎺ュ彛鍏ュ弬
     * @return {Object}                 鍥炶皟瀵硅薄
     */
    function _getApiCallBacks(apiName, opt) {
      var cb = {};
      opt = opt || {};
      if (__isFunction(opt.success)) {
        cb.success = opt.success;
        delete opt.success;
      }
      if (__isFunction(opt.fail)) {
        cb.fail = opt.fail;
        delete opt.fail;
      }
      if (__isFunction(opt.complete)) {
        cb.complete = opt.complete;
        delete opt.complete;
      }
      return cb;
    }
  
    /**
     * 鑾峰彇 API 鐨� doing 鍑芥暟
     * @method _getApiDoing
     * @param  {String}     apiName API 鍚嶇О
     * @return {function}           doing 鍑芥暟
     */
    function _getApiDoing(apiName) {
      var jsapi = _JSAPI[apiName];
      return jsapi && jsapi.d ? jsapi.d : false;
    }
  
    /**
     * 澶勭悊 JSAPI 鐨勫嚭鍙�
     * @method _getApiResult
     * @param  {String}      apiName JSAPI 鎺ュ彛鍚�
     * @param  {Object}      opt     JSAPI 鍘熷鍏ュ弬
     * @param  {Object}      _opt    JSAPI before鏂规硶 澶勭悊杩囩殑鍏ュ弬
     * @param  {Object}      res     JSAPI 鍑哄弬
     * @param  {Function}    cb      JSAPI 鏈鐞嗚繃鐨勫洖璋冨嚱鏁�
     * @return {Object}              澶勭悊杩囩殑 res
     */
    function _getApiResult(apiName, res, _opt, opt, cb) {
      var jsapi = _JSAPI[apiName];
      var finalRes = jsapi && jsapi.a ? jsapi.a(__isEvent(res) ? res : __extend({}, res), _opt, opt, cb) : __extend({}, res);
      var modifier = _getApiExtra(apiName, 'resultModifier');
      if (__isFunction(modifier)) {
        var modifyRes = modifier(finalRes, _opt, opt, cb);
        if (__isObject(modifyRes)) {
          finalRes = modifyRes;
        }
      }
      return finalRes;
    }
    /**
     * 澶勭悊閿欒淇℃伅锛岃浆鎹� error 瀛楁涓� Number 绫诲瀷
     * @method _handleApiError
     * @param  {String}        apiName 鎺ュ彛鍚�
     * @param  {Object}        res     鍑哄弬
     * @return {Object}                澶勭悊杩囩殑 res
     */
    function _handleApiError(apiName, res) {
      //閿欒鐮佸己鍒惰浆鎴愭暟瀛�
      if (__hasOwnProperty(res, 'error')) {
        res.error = parseInt(res.error, 10);
      }
      //澶勭悊 success
      if (_getApiExtra(apiName, 'handleResultSuccess') !== false) {
        _handleResultSuccess(res);
      }
      //澶勭悊 error: 0 鐨勬儏鍐碉紝error 涓� 0 琛ㄧず鎴愬姛
      if (res.error === 0) {
        delete res.error;
        delete res.errorMessage;
      }
  
      //鏈変簺 error 涓嶄唬琛ㄦ帴鍙ｅ紓甯革紝鑰屾槸鐢ㄦ埛鍙栨秷鎿嶄綔锛屼笉搴旇缁熶竴鍋氭姤閿欐棩蹇椼€�
      if (res.error > 0 && res.error < 10) {
        console.error(apiName, res);
      }
      return res;
    }
    /**
     * 澶勭悊缁撴灉涓殑 success 瀛楁
     * @method _handleResultSuccess
     * @param  {Object}             res           鎺ュ彛杩斿洖鍊�
     * @param  {Number}             errorCode     瀵瑰簲閿欒鐮�
     * @param  {Any}                successValue  success瀛楁澶勭悊鍊�
     * @return {Object}                           澶勭悊鍚庣殑 result
     */
    function _handleResultSuccess(res, mappingError, successValue) {
      successValue = __isUndefined(successValue) ? false : successValue;
      if (!__hasOwnProperty(res, 'error') && res.success === successValue) {
        res.error = __isNumber(mappingError) ? mappingError : 2; //2 鏄弬鏁伴敊璇�
      }
      delete res.success;
      return res;
    }
  
    //鍙栧埌 data
    function _handleEventData(evtObj) {
      var data = {};
      if (!__isUndefined(evtObj.data)) {
        data = evtObj.data;
        data = __isObject(data) ? data : { data: data };
      }
      return data;
    }
  
    /**
     * 鎷嗗垎绫诲瀷閿悕閲岀湡姝ｇ殑 key 鍜屽搴旂殑 type
     * @method _separateTypeKey
     * @param  {String}         key 甯︾被鍨嬫爣璇嗙殑閿悕
     * @return {Object}             杩斿洖閿悕鍜岀被鍨嬫爣璇嗕袱涓瓧娈碉紝
     *                              濡倇k: 'content', t: '%s'}
     */
    function _separateTypeKey(key) {
      var matches = (key || '').match(/(\w+)(%\w)$/i);
      var tk = {
        k: key
      };
      if (matches) {
        tk.k = matches[1];
        tk.t = matches[2];
      }
      return tk;
    }
  
    /**
     * 鎶婂€艰浆鎹㈡垚鐩稿簲绫诲瀷
     * @method _toType
     * @param  {String} type  绫诲瀷鏍囪瘑锛岀洰鍓嶆敮鎸�
     *                        %s(瀛楃涓�)
     *                        %c(16杞�10杩涘埗棰滆壊)
     *                        %h(10杞�16杩涘埗棰滆壊)
     *                        %b(绉婚櫎 base64 鏁版嵁鏍煎紡澶�)
     *                        %a{mimeType}(娣诲姞 base64 鏁版嵁澶�)
     *                        %d(鏁存暟)
     *                        %f(娴偣鏁�)
     * @param  {any} value 寰呰浆鎹㈠€硷紝绫诲瀷鏈煡
     * @return {any}       杞崲濂界殑鐩稿簲绫诲瀷鐨�
     */
    function _toType(type, value) {
      if (type === '%s') value = __superToString(value);
      if (type === '%c') value = __h2dColor(value);
      //if (type === '%h') value = __d2hColor(value);
      if (type === '%b') value = __removeBase64Head(value);
      if (type === '%d') value = parseInt(value, 10);
      if (type === '%f') value = parseFloat(value);
      return value;
    }
    /**
     * 澶勭悊瀵硅薄鏄犲皠鍏崇郴
     * @method _mapping
     * @param  {Object}  tObj 鍘熷鐩爣瀵硅薄
     * @param  {Object}  map 鏄犲皠鍏崇郴锛屽{content: 'text'}锛�
     *                       鍗虫妸 sObj.content 鐨勫€艰祴缁� tObj.text锛�
     *                       骞跺垹闄� tObj 鐨� content 灞炴€э紝
     *                       鎵€浠� content 灏辨槸 sKey锛宼ext 灏辨槸 tKey銆�
     *                       鍙互鎶� map 瀵硅薄涓殑鍐掑彿(:)鐞嗚В鎴� to锛�
     *                       鍗� {content to text}銆�
     *                       鍏朵腑 tKey 鐨勫€肩殑鏈€鍚庡彲浠ュ姞 %s 绛夌被鍨嬫爣璇嗚浆鎹㈡垚鐩稿簲绫诲瀷锛�
     *                       娉ㄦ剰锛氳鍔犲埌鏈€鍚庤祴鍊肩粰 tObj 鐨勯偅涓� tKey 鐨勫悗闈€�
     *                       杩欎箞鍋氭槸鍥犱负锛�
     *                       鏈変簺鎺ュ彛鐨勫叆鍙傚瓧娈电洿鎺ヤ紶鍏ラ潪瀛楃涓插€兼椂锛屾帴鍙ｅ畬鍏ㄦ棤鍝嶅簲锛�
     *                       姣斿 AlipayJSBridge.call('alert',{message: 12345})
     *
     * @param  {Object} sObj 鍙傜収鏉ユ簮瀵硅薄
     * @return {Object}     澶勭悊鏄犲皠鍚庣殑 tObj
     */
    function _mapping(tObj, map, sObj) {
      var typeKey;
      sObj = sObj || {};
      __forEach(map, function (sKey, tKey) {
        typeKey = _separateTypeKey(map[sKey]);
        //鐩爣 key
        tKey = typeKey.k;
        //鏄犲皠鏉′欢锛屽惁鍒欎笉璧嬪€硷紝閬垮厤娣诲姞 value 涓� undefined 鐨� key
        if (!__isUndefined(tKey) //鐩爣 key 瀹氫箟杩�
        && (__hasOwnProperty(tObj, sKey) || __hasOwnProperty(sObj, sKey)) //婧愭暟鎹嚦灏戞湁涓€涓湁鏁�
        && __isUndefined(tObj[tKey]) //鐩爣鏁版嵁绌虹己寰呰祴鍊�
        ) {
            //sKey 鏃㈠彲浠ユ槸 sObj 鐨勶紝涔熷彲浠ユ槸 tObj 鑷繁鐨勶紝浣唖Obj 浼樺厛绾ч珮浜庡師濮� tObj
            //鍗� sObj[sKey]鐨勫€� 浼氳鐩� tObj[sKey]鐨勫€�
            //骞朵笖瑕佹牴鎹� type 鍗犱綅绗﹀仛鐩稿簲绫诲瀷杞崲
            tObj[tKey] = _toType(typeKey.t, __isUndefined(sObj[sKey]) ? tObj[sKey] : sObj[sKey]);
            // 鍒犻櫎鍘熷 tObj 涓殑 sKey锛宼Key 鍜� sKey 鍚屽悕鏃朵笉鍋氬垹闄�
            if (tKey !== sKey) {
              delete tObj[sKey];
            }
          }
      });
      return tObj;
    }
    /**
     * ap 鎺ュ彛鍩嬬偣
     * 淇濊瘉闃熷垪閲屾湁璋冪敤璁板綍鏃舵墠鍚姩璁℃椂鍣紝鍋氬埌涓嶈皟鐢ㄤ笉璁℃椂
     * @param {String} apiName  鎺ュ彛鍚�
     */
    var _apiRemoteLog = function () {
      var apiInvokeQueue = [];
      var timerId = void 0;
      var isTimerActived = false;
      //鍙戦€佹棩蹇�
      function triggerSendLog() {
        setTimeout(function () {
          if (apiInvokeQueue.length > 0) {
            var param1 = apiInvokeQueue.join('|');
            AP.ready(function () {
              _JS_BRIDGE.call('remoteLog', {
                type: 'monitor',
                bizType: 'ALIPAYJSAPI',
                logLevel: 1, // 1 - high, 2 - medium, 3 - low
                actionId: 'MonitorReport',
                seedId: 'ALIPAYJSAPI_INVOKE_COUNTER',
                param1: param1
              });
            });
            AP.debug && console.info('REMOTE_LOG_QUEUE>', apiInvokeQueue);
            apiInvokeQueue = [];
          }
          // 鍋滄璁℃椂鍣�
          clearTimer();
        }, 0);
      }
      // 璁℃椂鍣�
      function timer() {
        // 璁℃椂婵€娲绘爣鑷�
        isTimerActived = true;
        // 鍚姩璁℃椂鍣�
        timerId = setTimeout(function () {
          // 鏃ュ織鍙戦€�
          triggerSendLog();
        }, 5000); // 5 绉掍笂鎶�
      }
      // 娓呴櫎璁℃椂鍣�
      function clearTimer() {
        !__isUndefined(timerId) && clearTimeout(timerId);
        isTimerActived = false;
      }
      // back 浜嬩欢涓婃姤鏃ュ織锛屼綔涓哄厹搴�
      AP.on('back', function () {
        triggerSendLog();
      });
  
      return function (apiName) {
        apiInvokeQueue.push(apiName);
        // 6 涓笂鎶�
        if (apiInvokeQueue.length >= 6) {
          triggerSendLog();
        } else if (!isTimerActived) {
          timer();
        }
      };
    }();
  
    function _apiLog() {
      var args = __argumentsToArg(arguments);
      var apiName;
      var opt;
      var _opt;
      var res;
      var _res;
      var logs;
      if (AP.debug) {
        apiName = args[0];
        opt = args[1];
        _opt = args[2];
        res = args[3];
        _res = args[4];
        logs = [args.length > 3 ? 'RETURN>' : 'INVOKE>', apiName, __hasOwnProperty(opt, '_') ? opt._ : opt, _opt];
        if (args.length > 3) {
          logs.push(res);
        }
        if (args.length > 4) {
          logs.push(_res);
        }
        console.info(logs);
      }
    }
    /****************** Util鏂规硶 __ ***********************/
    /**
     * 鏄惁鍦� UA 涓寘鍚煇涓瓧绗︿覆
     * @method _inUA
     * @param  {String}   keyStr      鐩爣瀛楃涓�
     * @return {Boolean}              鏄惁鍖呭惈
     */
    function __inUA(keyPattern) {
      return keyPattern.test(_UA);
    }
    /**
     * 鍔ㄧ敾甯�
     * @method raf
     * @param  {Function} fn 鍥炶皟
     * @return {Function}    requestAnimationFrame
     */
    var __raf = function () {
      return window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || window.msRequestAnimationFrame || function (callback, element) {
        window.setTimeout(function () {
          callback(+new Date(), element);
        }, 1000 / 60);
      };
    }();
    /**
     *  褰撳墠鐜鏄惁鏀寔 Promise
     * @method __supportPromise
     * @return {Boolean}              鏄惁鏀寔
     */
    function __isSupportPromise() {
      if (_IS_SUPPORT_PROMISE === undefined) {
        var isSupport = false;
        var P = self.Promise;
  
        if (P) {
          var promise = null;
          var then = null;
          try {
            promise = P.resolve();
            then = promise.then;
          } catch (e) {
            // silently ignored
          }
          if (promise instanceof P && __isFunction(then) && !P.cast) {
            isSupport = true;
          }
        }
        if (!isSupport) {
          console.warn('try callback since no Promise detected');
        }
        _IS_SUPPORT_PROMISE = isSupport;
      }
      return _IS_SUPPORT_PROMISE;
    }
  
    /**
     * 瓒呯骇瀛楃涓茶浆鎹�
     * @method __superToString
     * @param  {Any}        content 寰呰浆鎹㈠唴瀹�
     * @return {String}             杞崲鍚庣殑瀛楃涓�
     */
    function __superToString(content) {
      var str = content;
      if (__isObject(content) || __isArray(content)) {
        try {
          str = JSON.stringify(content);
        } catch (e) {
          //闈欓粯
        }
      } else {
        str = content + '';
      }
      return str;
    }
  
    /**
     * 16杩涘埗棰滆壊杞垚10杩涘埗鏁板瓧
     * @method __h2dColor
     * @param  {String}   hex 16杩涘埗棰滆壊瀛楃涓�
     * @return {Number}       10杩涘埗鏁板瓧
     */
    function __h2dColor(hex) {
      var dec = '' + hex;
      //濡傛灉鍔犱簡#鍙凤紝鍘绘帀
      if (dec.indexOf('#') === 0) {
        dec = dec.substr(1);
      }
      //濡傛灉鏄�3浣嶇畝鍐欙紝琛ュ叏鎴�6浣�
      if (dec.length === 3) {
        dec = dec.replace(/(.)/g, '$1$1');
      }
      dec = parseInt(dec, 16);
      if (__isNaN(dec)) {
        console.error(hex + ' is invalid hex color.');
      }
      return dec;
    }
  
    /**
     * 10杩涘埗鏁板瓧杞垚16杩涘埗棰滆壊
     * @method __d2hColor
     * @param  {Number}   dec 10杩涘埗鏁板瓧
     * @return {String}       16杩涘埗棰滆壊瀛楃涓�
     */
    // function __d2hColor(dec) {
    //   return '#' + dec.toString(16);
    // }
    /**
     * native 杩斿洖鐨勬棤澶� base64 鏁版嵁锛屾坊鍔犳祻瑙堝櫒璇嗗埆鐨� mimeType 鐨� base64鏁版嵁澶�
     * @method __addBase64Head
     * @param   {String}        base64   鏃犲ご鏁版嵁
     * @param   {String}        mimeType 鏁版嵁鏍煎紡
     * @return  {String}                 鏈夊ご鏁版嵁
     */
    function __addBase64Head(base64, mimeType) {
      if (base64 && mimeType) {
        base64 = 'data:' + mimeType + ';base64,' + base64;
      }
      return base64;
    }
  
    /**
     * 绉婚櫎 base64 鏁版嵁澶达紝native 鎺ュ彛涓嶉渶瑕佷紶鍏ュご閮�
     * @method __removeBase64Head
     * @param  {String}           base64 鏈夊ご鏁版嵁
     * @return {String}                  鏃犲ご鏁版嵁
     */
    function __removeBase64Head(base64) {
      if (__isString(base64)) {
        base64 = base64.replace(/^data:(\/|\w|\-|\.)+;base64,/i, '');
      }
      return base64;
    }
  
    /**
     * 鎶� json 杞垚 & 鐩歌繛鐨勮姹傚弬鏁�
     * @method __toQueryString
     * @param  {Object}        data key: value鍙傛暟閿€煎
     * @return {String}             queryString
     */
    function __toQueryString(data) {
      var result = [];
  
      __forEach(data, function (key, value) {
        result.push(key + '=' + encodeURIComponent(__isUndefined(value) ? '' : value));
      });
      result = result.join('&');
      // var limits = [1024, 2048];
      // var notice;
      // notice = 'query string length has more than %d锛宲lease use setSessionData interface';
      // if (result.length > limits[1]) {
      //   console.warn(notice, limits[1]);
      // } else if (result.length > limits[0]) {
      //   console.warn(notice, limits[0]);
      // }
      return result;
    }
  
    /**
     * 鏋勯€犲甫鍙傜殑瀹屾暣 url
     * @method __buildUrl
     * @param  {String}   url    鍘熷 url锛屽彲鑳藉凡缁忔湁 queryString
     * @param  {Object}   params url 鍙傛暟瀵硅薄
     * @return {String}          鎷兼帴濂界殑甯﹀弬 url
     */
    function __buildUrl(url, params) {
      var qs = params;
      if (__isObject(params)) {
        qs = __toQueryString(params);
      }
      if (!/\?/.test(url)) {
        qs = '?' + qs;
      } else if (!/&$/.test(url) && !/\?$/.test(url)) {
        qs = '&' + qs;
      }
      return url + qs;
    }
    /**
     * 涓€涓璞℃槸鍚﹀惈鏈夋煇涓� key
     * @method __hasOwnProperty
     * @param  {Object}         obj 瀵硅薄鎴栨暟缁�
     * @param  {String}         key 閿€�
     * @return {Boolean}            鏄惁鍚湁姝ら敭鍊�
     */
    function __hasOwnProperty(obj, key) {
      if (__isObject(obj) || __isArray(obj)) {
        return obj.hasOwnProperty(key);
      }
      return false;
    }
    /**
     * 閬嶅巻瀵硅薄
     * @method __forEach
     * @param  {Object}   obj 寰呴亶鍘嗗璞℃垨鏁扮粍
     * @param  {Function} cb  姣忎釜 key 鐨勫洖璋�
     *                        鍥炶皟鍏ュ弬鏄� key 鍜屽搴旂殑 value
     */
    function __forEach(obj, cb, notArray) {
      var i;
      var key;
      if (!notArray && __likeArray(obj)) {
        for (i = 0; i < obj.length; i++) {
          if (cb(i, obj[i]) === false) {
            return obj;
          }
        }
      } else {
        for (key in obj) {
          if (cb(key, obj[key]) === false) {
            return obj;
          }
        }
      }
      return obj;
    }
    /**
     * 瑙ｆ瀽 JSON
     * @method __parseJSON
     * @param  {String}    str JSON 瀛楃涓�
     * @return {Object}        JSON 瀵硅薄
     */
    function __parseJSON(str) {
      try {
        str = JSON.parse(str);
      } catch (err) {
        console.warn(err, str);
      }
      return str;
    }
  
    /**
     * 杞垚灏忓啓瀛楁瘝
     * @method __tlc
     * @param  {String} str 寰呰浆鎹㈠瓧绗︿覆
     * @return {String}     灏忓啓瀛楃涓�
     */
    function __tlc(str) {
      if (__isString(str)) {
        str = str.toLowerCase();
      }
      return str;
    }
  
    /**
     * 杞垚澶у啓瀛楁瘝
     * @method __tuc
     * @param  {String} str 寰呰浆鎹㈠瓧绗︿覆
     * @return {String}     澶у啓瀛楃涓�
     */
    function __tuc(str) {
      if (__isString(str)) {
        str = str.toUpperCase();
      }
      return str;
    }
  
    function __isAndroid() {
      return __inUA(/android/i);
    }
  
    function __isIOS() {
      return __inUA(/iPad|iPod|iPhone|iOS/i);
    }
  
    function __isUndefined(o) {
      return __type_original(o) === '[object Undefined]';
    }
  
    function __isNull(o) {
      return __type_original(o) === '[object Null]';
    }
  
    function __isNaN(num) {
      return parseInt(num, 10).toString() === 'NaN';
    }
    function __isBoolean(val) {
      return typeof val === 'boolean';
    }
  
    function __isFunction(fn) {
      return __type_original(fn) === '[object Function]';
    }
  
    function __isString(str) {
      return typeof str === 'string';
    }
  
    function __isObject(o) {
      return __type_original(o) === '[object Object]';
    }
  
    function __isNumber(num) {
      // 濡傛灉鐢╰ypeof number 浼氱敓鎴怱ymbolPolyfill
      return __type_original(num) === '[object Number]';
    }
  
    function __isArray(arr) {
      return __type_original(arr) === '[object Array]';
    }
  
    function __likeArray(obj) {
      return !!obj && !__isFunction(obj) && (__isArray(obj) || __isNumber(obj.length));
    }
    function __isEvent(evt) {
      return __type_original(evt) === '[object Event]';
    }
  
    function __type_original(obj) {
      return Object.prototype.toString.call(obj);
    }
  
    function __isEmptyObject(obj) {
      for (var name in obj) {
        return false;
      }
      return true;
    }
  
    function __argumentsToArg(_arguments) {
      var _startIndex = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;
  
      var len = _arguments.length - _startIndex;
      var arg = new Array(len);
      for (var i = 0; i < len; i++) {
        arg[i] = _arguments[i + _startIndex];
      }
      return arg;
    }
  
    /**
     * 瀵硅薄鎵╁睍
     * @method __extend
     * @param  {Object} obj  鍘熷瀵硅薄
     * @param  {Object} args 澶氫釜缁ф壙瀵硅薄
     * @return {Object}      鎵╁睍鍚庡璞�
     */
    function __extend(obj) {
      var args = __argumentsToArg(arguments, 1);
      var source;
      var prop;
      if (!__isObject(obj)) {
        return obj;
      }
      for (var i = 0, length = args.length; i < length; i++) {
        source = args[i];
        for (prop in source) {
          if (hasOwnProperty.call(source, prop)) {
            obj[prop] = source[prop];
          }
        }
      }
      return obj;
    }
  
    /***************** 杈撳嚭 AP 瀵硅薄 *******************/
    self._AP = AP;
  
    if (typeof module !== 'undefined' && module.exports) {
      // 鍏煎 CommonJS
      module.exports = AP;
    } else if (typeof define === 'function' && (define.amd || define.cmd)) {
      // 鍏煎 AMD / RequireJS / seaJS
      define(function () {
        return AP;
      });
    } else {
      // 濡傛灉涓嶄娇鐢ㄦā鍧楀姞杞藉櫒鍒欒嚜鍔ㄧ敓鎴愬叏灞€鍙橀噺
      self.ap = self.AP = AP;
    }
  })(self);