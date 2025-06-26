// Simple PubSub implementation for theme events
window.PubSub = (function() {
  var events = {};

  function subscribe(eventName, callback) {
    if (!events[eventName]) {
      events[eventName] = [];
    }
    events[eventName].push(callback);
    
    return function unsubscribe() {
      events[eventName] = events[eventName].filter(function(cb) {
        return cb !== callback;
      });
    };
  }

  function publish(eventName, data) {
    if (!events[eventName]) {
      return;
    }
    
    events[eventName].forEach(function(callback) {
      callback(data);
    });
  }

  return {
    subscribe: subscribe,
    publish: publish
  };
})();