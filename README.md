# Maquila

[factory_girl](https://github.com/thoughtbot/factory_girl) inspired
library for building JavaScript objects or creating records, useful for
setting up test data.

## Usage

### Factory Definitions

You can define a new factory with optional constructor function and
default attributes, functions will be evaluated:

      Maquila.define('post', Post).defaults({
        title : function() {
          return "Post " + this.sequence();
        },
        createdAt : function() { return new Date(); },
        content   : function(attrs) { return "Content for " + attrs['title'] },
        author    : "Macario Ortega",
        published : false
      });


### Building Objects

Instantiate an object optionally passing attributes to override:

      var post = Maquila.build('post', { author: "Daffy Duck" });


It will return a Post instance with this attributes.

      new Post({
        title: 'Post 1',
        createdAt: Tue Apr 09 2013 20:56:24 GMT-0500 (CDT),
        content: "Content for Post 1",
        author: 'Daffy Duck',
        published: false
      })

Same as:
    
    var post = Maquila.factory('post').build({ author: "Daffy Duck" });


Or return a plain JavaScript computed attributes object:

      var postAttributes = Maquila.attributes('post', { author: "Daffy Duck" });


### Strategies

Besides attributes, and build, Maquila defines the `create` strategy, that
calls `create` on the constructor passing the computed attributes.

      var persistedPost = Maquila.create('post', { author: "Daffy Duck" });

New strategies can be defined or existing ones overriden.

      Maquila.strategy('create', function(Constructor, attrs){
        obj = new Constructor(attrs)
        obj.save
        return obj
      });

      Maquila.strategy('persist', function(Constructor, attrs){
        return Constructor.persist(atts);
      });

      var persistedPost = Maquila.persist('post', { author: "Daffy Duck" });

Strategies can be define or overriden globaly or on a factory basis.

      Maquila.factory('post').strategy('publish', function(Constructor, attrs){
        return Constructor.publish(atts);
      });

      var publishedPost = Maquila.publish('post', { author: "Daffy Duck" });

### Sequences

You can reset the sequence counter for a given factory:

      > Maquila.build('post').title;
      // => "Post 1"
      > Maquila.build('post').title;
      // => "Post 2"
      > Maquila.factory('post').resetSequence();
      // => Factory
      > Maquila.build('post').title;
      // => "Post 1"


Or for all factories:

    Maquila.resetSequences();


### Collections

You can build an array of instances or attributes, optionally
overriding defaults.

    var posts = Maquila.factory('post').arrayOf(3).build({
      author: function() { Maquila.factory('author').build() }
    };

    var persistedPosts = Maquila.factory('post').arrayOf(3).create();

    var attributes = Maquila.factory('post').arrayOf(3).attributes();


Collections will implement strategies defined globally or by factory.

    var persistedPosts = Maquila.factory('post').arrayOf(3).persist();

    var publishedPosts = Maquila.factory('post').arrayOf(3).publish();


### Extending Factories

You can define a factory based on a previous factory definition,
overriding some defaults.

      Maquila.define('published-post').extend('post').defaults({
        published: true
      });

Extended factories will share a sequence counter,
but you can set a new one passing an optional start number.

      Maquila.factory('published-post').setNewCounter(2);

