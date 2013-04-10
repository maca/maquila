var Dummy, Maker, Post;

Maker = window.Maker;

Post = (function() {
  Post.create = function(attrs) {
    var instance;

    instance = new Post(attrs);
    instance.persisted = true;
    return instance;
  };

  function Post(attrs) {
    var key, val;

    for (key in attrs) {
      val = attrs[key];
      this[key] = val;
    }
  }

  return Post;
})();


Dummy = (function() {
  function Dummy() {
    this.someAttr = 'some value';
  }

  return Dummy;
})();


describe('Maker', function() {
  afterEach(function() {
    delete Maker.factories;
  });

  it('defines a factory', function() {
    var factory;

    factory = Maker.define('post', Post);
    expect(factory.Constructor).toBe(Post);
    expect(Maker.factory('post')).toBe(factory);
  });

  it('raises error if factory is not defined', function() {
    expect(function () {
      Maker.factory('user')
    }).toThrow("factory 'user' is not defined")
  });

  describe('factory', function() {
    it('builds instance', function() {
      var factory, instance;

      factory  = Maker.define('post', Post);
      instance = factory.build();

      expect(instance).toEqual(new Post());
    });

    it('sets default attributes', function() {
      var factory, instance;

      factory = Maker.define('post', Post).defaults({
        title: 'Post'
      });

      instance = factory.build();
      expect(instance).toEqual(new Post({
        title: 'Post'
      }));
    });

    it('returns attributes', function() {
      var attributes, factory;

      factory = Maker.define('post', Post).defaults({
        title: 'Post'
      });

      attributes = factory.attributes();
      expect(attributes).toEqual({
        title: 'Post'
      });
    });

    it('calls create on constructor if defined', function() {
      var factory, instance;

      factory = Maker.define('post', Post).defaults({
        title: 'Post'
      });

      instance = factory.create();
      expect(instance).toEqual(new Post({
        title: 'Post',
        persisted: true
      }));
    });

    it('instantiates on create if create is not defined for constructor', function() {
      var build, factory, instance;

      factory  = Maker.define('dummy', Dummy);
      instance = factory.create();
      build    = factory.build();

      expect(instance).toEqual(build);
    });

    return it('defaults constructor to Object', function() {
      var factory, instance;

      factory = Maker.define('post').defaults({
        title: 'Post'
      });

      instance = factory.build();
      expect(instance).toEqual({
        title: 'Post'
      });
    });
  });

  describe('sequence', function() {
    beforeEach(function() {
      Maker.define('post').defaults({
        title: function() {
          return "Post " + this.sequence();
        }
      });
    });

    it('automatically increments sequence', function() {
      var attributes, factory;

      factory    = Maker.factory('post');

      attributes = factory.attributes();
      expect(attributes).toEqual({
        title: "Post 1"
      });

      attributes = factory.attributes();
      expect(attributes).toEqual({
        title: "Post 2"
      });
    });

    it('manually increments sequence', function() {
      var attributes, factory, incrementResult;

      factory    = Maker.factory('post');
      attributes = factory.attributes();

      expect(attributes).toEqual({
        title: "Post 1"
      });

      incrementResult = factory.incrementSequence();
      expect(incrementResult).toBe(factory);

      attributes = factory.attributes();
      expect(attributes).toEqual({
        title: "Post 3"
      });
    });

    it('resets sequence', function() {
      var attributes, factory, resetResult;

      factory    = Maker.factory('post');

      attributes = factory.attributes();
      expect(attributes).toEqual({
        title: "Post 1"
      });

      resetResult = factory.resetSequence();
      expect(resetResult).toBe(factory);

      attributes = factory.attributes();
      expect(attributes).toEqual({
        title: "Post 1"
      });
    });

    it('sets new counter', function() {
      var attributes, factory;

      factory = Maker.factory('post').setNewCounter(4);
      attributes = factory.attributes();

      expect(attributes).toEqual({
        title: "Post 4"
      });

      attributes = factory.attributes();

      expect(attributes).toEqual({
        title: "Post 5"
      });
    });

    it('resets all sequences', function(){
      var attributes, resetResult;

      Maker.define('user').defaults({
        name: function() { return "User " + this.sequence(); }
      });

      attributes = Maker.factory('post').attributes();
      expect(attributes).toEqual({
        title: "Post 1"
      });

      attributes = Maker.factory('user').attributes();
      expect(attributes).toEqual({
        name: "User 1"
      });


      resetResult = Maker.resetSequences();
      expect(resetResult).toBe(Maker);

      attributes = Maker.factory('post').attributes();
      expect(attributes).toEqual({
        title: "Post 1"
      });

      attributes = Maker.factory('user').attributes();
      expect(attributes).toEqual({
        name: "User 1"
      });
    });
  });

  describe('attributes', function() {
    it('overrides with new attributes', function() {
      var attributes, factory;

      factory = Maker.define('post').defaults({
        title: 'Post'
      });

      attributes = factory.attributes({
        id: 32
      });

      expect(attributes).toEqual({
        title: 'Post',
        id: 32
      });
    });

    it('overrides default attributes', function() {
      var attributes, factory;

      factory = Maker.define('post').defaults({
        title: 'Post',
        id: 31
      });

      attributes = factory.attributes({
        id: 32
      });

      expect(attributes).toEqual({
        title: 'Post',
        id: 32
      });
    });

    it('evaluates dynamic attribute', function() {
      var attributes, factory;

      factory = Maker.define('post').defaults({
        id: function() { return 62 / 2; }
      });

      attributes = factory.attributes();
      expect(attributes).toEqual({id: 31});
    });

    it('evaluates overriden dynamic attributes', function() {
      var attributes, factory;

      factory = Maker.define('post').defaults({
        title: 'Post',
        id: function() { return 32; }
      });

      attributes = factory.attributes({
        id: function() { return 62 / 2; }
      });

      expect(attributes).toEqual({
        title: 'Post',
        id: 31
      });
    });

    it('passes attributes to dynamic attribute function', function() {
      var attributes, factory;

      factory = Maker.define('post').defaults({
        title: 'Post 1',
        content: function(attrs) {
          return "Content for " + attrs.title;
        }
      });

      attributes = factory.attributes();

      expect(attributes).toEqual({
        title: 'Post 1',
        content: "Content for Post 1"
      });
    });

    it('evaluates dynamic attributes in the context of the factory', function() {
      var attributes, factory;

      factory = Maker.define('something').defaults({
        factory: function() {
          return this;
        }
      });

      attributes = factory.attributes();
      return expect(attributes.factory).toBe(factory);
    });
  });

  describe('class methods', function() {
    it('builds instance', function() {
      var instance;

      Maker.define('post', Post).defaults({
        title: 'Post'
      });

      instance = Maker.build('post');
      expect(instance).toEqual(new Post({
        title: 'Post'
      }));
    });

    it('returns attributes', function() {
      var attributes;

      Maker.define('post', Post).defaults({
        title: 'Post'
      });

      attributes = Maker.attributes('post');

      return expect(attributes).toEqual({
        title: 'Post'
      });
    });

    it('creates instance', function() {
      var instance;

      Maker.define('post', Post).defaults({
        title: 'Post'
      });

      instance = Maker.create('post');
      expect(instance).toEqual(new Post({
        title: 'Post',
        persisted: true
      }));
    });

    it('builds instance overriding', function() {
      var instance;

      Maker.define('post', Post).defaults({
        title: 'Post'
      });

      instance = Maker.build('post', {id: 1});

      expect(instance).toEqual(new Post({
        title: 'Post',
        id: 1
      }));
    });

    it('returns attributes overriding', function() {
      var attributes;

      Maker.define('post', Post).defaults({
        title: 'Post'
      });

      attributes = Maker.attributes('post', {
        id: 1
      });

      expect(attributes).toEqual({
        title: 'Post',
        id: 1
      });
    });

    it('creates instance overriding', function() {
      var instance;

      Maker.define('post', Post).defaults({
        title: 'Post'
      });

      instance = Maker.create('post', {
        id: 1
      });

      expect(instance).toEqual(new Post({
        title: 'Post',
        id: 1,
        persisted: true
      }));
    });
  });

  describe('collections', function() {
    beforeEach(function() {
      Maker.define('post', Post).defaults({
        title: function() {
          return "Post " + (this.sequence());
        }
      });
    });

    it('builds collection', function() {
      var collection;

      collection = Maker.factory('post').arrayOf(3).build();
      expect(collection).toEqual([
        new Post({ title: 'Post 1' }),
        new Post({ title: 'Post 2' }),
        new Post({ title: 'Post 3' })
      ]);
    });

    it('returns attribute collection', function() {
      var collection;

      collection = Maker.factory('post').arrayOf(3).attributes();

      expect(collection).toEqual([
        { title: 'Post 1' },
        { title: 'Post 2' },
        { title: 'Post 3' }
      ]);
    });

    it('creates collection', function() {
      var collection;

      collection = Maker.factory('post').arrayOf(3).create();

      expect(collection).toEqual([
        new Post({
          title: 'Post 1',
          persisted: true
        }),
        new Post({
          title: 'Post 2',
          persisted: true
        }),
        new Post({
          title: 'Post 3',
          persisted: true
        })
      ]);
    });

    it('build attributes overriding', function() {
      var collection;

      collection = Maker.factory('post').arrayOf(3).build({
        title: function() {
          return "Post " + (this.sequence() * 2);
        }
      });

      expect(collection).toEqual([
        new Post({
          title: 'Post 2'
        }),
        new Post({
          title: 'Post 4'
        }),
        new Post({
          title: 'Post 6'
        })
      ]);
    });

    it('attributes overriding', function() {
      var collection;

      collection = Maker.factory('post').arrayOf(3).attributes({
        title: function() {
          return "Post " + (this.sequence() * 2);
        }
      });

      expect(collection).toEqual([
        { title: 'Post 2' },
        { title: 'Post 4' },
        { title: 'Post 6' }
      ]);
    });

    it('create attributes overriding', function() {
      var collection;

      collection = Maker.factory('post').arrayOf(3).create({
        title: function() {
          return "Post " + (this.sequence() * 2);
        }
      });

      expect(collection).toEqual([
        new Post({
          title: 'Post 2',
          persisted: true
        }),
        new Post({
          title: 'Post 4',
          persisted: true
        }),
        new Post({
          title: 'Post 6',
          persisted: true
        })
      ]);
    });
  });

  describe('extending', function() {
    beforeEach(function() {
      Maker.define('post').defaults({
        title: function() {
          return "Post " + (this.sequence());
        }
      });

      Maker.define('post-with-author').extend('post').defaults({
        author: 'Macario'
      });
    });

    it('shares a counter', function() {
      var extended, original;

      original = Maker.factory('post');
      extended = Maker.factory('post-with-author');

      expect(original.counter).toBe(extended.counter);
    });

    it('extends attributes', function() {
      var extended, original;

      original = Maker.factory('post');
      extended = Maker.factory('post-with-author');

      expect(original.build()).toEqual(new Post({
        title: 'Post 1'
      }));

      expect(extended.build()).toEqual(new Post({
        title: 'Post 2',
        author: 'Macario'
      }));
    });
  });
});
