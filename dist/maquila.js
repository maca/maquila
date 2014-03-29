// Maker.js
// version: 0.1.0
// author: Macario Ortega
// license: MIT
(function() {
  var Collection, Counter, Maquila, currier;

  currier = function(fn) {
    var args;
    args = Array.prototype.slice.call(arguments, 1);
    return function() {
      return fn.apply(this, args.concat(Array.prototype.slice.call(arguments, 0)));
    };
  };

  Maquila = {
    define: function(name, model) {
      if (model == null) {
        model = Object;
      }
      if (this.factories == null) {
        this.factories = {};
      }
      return this.factories[name] = new this.Factory(model, this.strategies);
    },
    factory: function(name) {
      if (this.factories == null) {
        this.factories = {};
      }
      return this.factories[name] || (function() {
        throw "factory '" + name + "' is not defined";
      })();
    },
    resetSequences: function() {
      var factory, key, _ref;
      _ref = this.factories;
      for (key in _ref) {
        factory = _ref[key];
        factory.resetSequence();
      }
      return this;
    },
    attributes: function(name, overrides) {
      return this.factory(name).attributes(overrides);
    },
    build: function(name, overrides) {
      return this.factory(name).build(overrides);
    },
    create: function(name, overrides) {
      return this.factory(name).create(overrides);
    },
    strategies: {
      build: function(Constructor, attributes) {
        return new Constructor(attributes);
      },
      create: function(Constructor, attributes) {
        return Constructor.create(attributes);
      }
    },
    strategy: function(name, func) {
      var factory, _ref;
      this.strategies[name] = func;
      _ref = this.factories;
      for (name in _ref) {
        factory = _ref[name];
        factory.refreshStrategies();
      }
      return this;
    }
  };

  Collection = (function() {
    function Collection(factory, length) {
      var name;
      this.factory = factory;
      this.length = length;
      for (name in this.factory.strategies) {
        this[name] = currier(this.executeStrategy, name);
      }
    }

    Collection.prototype.attributes = function(overrides) {
      var num, _i, _ref, _results;
      _results = [];
      for (num = _i = 1, _ref = this.length; 1 <= _ref ? _i <= _ref : _i >= _ref; num = 1 <= _ref ? ++_i : --_i) {
        _results.push(this.factory.attributes(overrides));
      }
      return _results;
    };

    Collection.prototype.executeStrategy = function(name, overrides) {
      var num, _i, _ref, _results;
      _results = [];
      for (num = _i = 1, _ref = this.length; 1 <= _ref ? _i <= _ref : _i >= _ref; num = 1 <= _ref ? ++_i : --_i) {
        _results.push(this.factory[name](overrides));
      }
      return _results;
    };

    return Collection;

  })();

  Counter = (function() {
    function Counter(start) {
      this.start = start != null ? start : 1;
      this.sequence = this.start;
    }

    Counter.prototype.increment = function() {
      return this.sequence += 1;
    };

    Counter.prototype.reset = function() {
      return this.sequence = this.start;
    };

    return Counter;

  })();

  Maquila.Factory = (function() {
    function Factory(Constructor, strategies) {
      this.Constructor = Constructor;
      this.defaultAttrs = {};
      this.strategies = Object.create(strategies);
      this.refreshStrategies();
      this.setNewCounter();
    }

    Factory.prototype.setNewCounter = function(num) {
      if (num == null) {
        num = 1;
      }
      this.counter = new Counter(num);
      return this;
    };

    Factory.prototype.defaults = function(attrs) {
      var key, val;
      for (key in attrs) {
        val = attrs[key];
        this.defaultAttrs[key] = val;
      }
      return this;
    };

    Factory.prototype.attributes = function(overrides) {
      var attrs, key, val, _ref;
      if (overrides == null) {
        overrides = {};
      }
      attrs = {};
      _ref = this.defaultAttrs;
      for (key in _ref) {
        val = _ref[key];
        attrs[key] = val;
      }
      for (key in overrides) {
        val = overrides[key];
        attrs[key] = val;
      }
      for (key in attrs) {
        val = attrs[key];
        attrs[key] = typeof val === 'function' ? val.apply(this, [attrs]) : val;
      }
      this.incrementSequence();
      return attrs;
    };

    Factory.prototype.strategy = function(name, func) {
      this.strategies[name] = func;
      this.refreshStrategies();
      return this;
    };

    Factory.prototype.executeStrategy = function(name, overrides) {
      return this.strategies[name](this.Constructor, this.attributes(overrides));
    };

    Factory.prototype.refreshStrategies = function() {
      var name;
      for (name in this.strategies) {
        this[name] = currier(this.executeStrategy, name);
      }
      return this;
    };

    Factory.prototype.extend = function(name) {
      var other;
      other = Maquila.factory(name);
      this.counter = other.counter;
      this.strategies = Object.create(other.strategies);
      this.defaults(other.defaultAttrs);
      this.refreshStrategies();
      return this;
    };

    Factory.prototype.arrayOf = function(num) {
      return new Collection(this, num);
    };

    Factory.prototype.sequence = function() {
      return this.counter.sequence;
    };

    Factory.prototype.incrementSequence = function() {
      return this.counter.increment() && this;
    };

    Factory.prototype.resetSequence = function() {
      return this.counter.reset() && this;
    };

    return Factory;

  })();

  if (typeof module !== "undefined" && module !== null ? module.exports : void 0) {
    module.exports.Maquila = Maquila;
  } else {
    this.Maquila = Maquila;
  }

}).call(this);
