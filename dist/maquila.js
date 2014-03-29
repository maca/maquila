// Maker.js
// version: 0.1.0
// author: Macario Ortega
// license: MIT
(function() {
  var Collection, Counter, Maquila;

  Maquila = {
    define: function(name, model) {
      if (model == null) {
        model = Object;
      }
      this.factories || (this.factories = {});
      return this.factories[name] = new Maquila.Factory(model);
    },
    factory: function(name) {
      this.factories || (this.factories = {});
      return this.factories[name] || (function() {
        throw "factory '" + name + "' is not defined";
      })();
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
    resetSequences: function() {
      var factory, key, _ref;
      _ref = this.factories;
      for (key in _ref) {
        factory = _ref[key];
        factory.resetSequence();
      }
      return this;
    }
  };

  Collection = (function() {
    function Collection(factory, length) {
      this.factory = factory;
      this.length = length;
    }

    Collection.prototype.attributes = function(overrides) {
      var num, _i, _ref, _results;
      _results = [];
      for (num = _i = 1, _ref = this.length; 1 <= _ref ? _i <= _ref : _i >= _ref; num = 1 <= _ref ? ++_i : --_i) {
        _results.push(this.factory.attributes(overrides));
      }
      return _results;
    };

    Collection.prototype.build = function(overrides) {
      var num, _i, _ref, _results;
      _results = [];
      for (num = _i = 1, _ref = this.length; 1 <= _ref ? _i <= _ref : _i >= _ref; num = 1 <= _ref ? ++_i : --_i) {
        _results.push(this.factory.build(overrides));
      }
      return _results;
    };

    Collection.prototype.create = function(overrides) {
      var num, _i, _ref, _results;
      _results = [];
      for (num = _i = 1, _ref = this.length; 1 <= _ref ? _i <= _ref : _i >= _ref; num = 1 <= _ref ? ++_i : --_i) {
        _results.push(this.factory.create(overrides));
      }
      return _results;
    };

    return Collection;

  })();

  Counter = (function() {
    function Counter(start) {
      this.start = start || 1;
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
    function Factory(Constructor) {
      this.Constructor = Constructor;
      this.defaultAttrs = {};
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

    Factory.prototype.build = function(overrides) {
      return new this.Constructor(this.attributes(overrides));
    };

    Factory.prototype.create = function(overrides) {
      if (typeof this.Constructor.create === 'function') {
        return this.Constructor.create(this.attributes(overrides));
      } else {
        return this.build(overrides);
      }
    };

    Factory.prototype.arrayOf = function(num) {
      return new Collection(this, num);
    };

    Factory.prototype.extend = function(name) {
      var defaults, key, other, val, _ref;
      defaults = {};
      other = Maquila.factory(name);
      this.counter = other.counter;
      _ref = other.defaultAttrs;
      for (key in _ref) {
        val = _ref[key];
        defaults[key] = val;
      }
      this.defaults(defaults);
      return this;
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
