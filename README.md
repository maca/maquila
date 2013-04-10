# Maker

Maker is yet another
[factory_girl](https://github.com/thoughtbot/factory_girl) inspired
library for building JavaScript objects or creating records, useful for
setting up test data.

## Usage

You can define a new factory with optional constructor function and
default attributes, functions will be evaluated:

      Maker.define('post', Post).defaults({
        title : function() {
          return "Post " + this.sequence();
        },
        createdAt : function() { return new Date(); },
        content   : function(attrs) { return "Content for " + attrs['title'] },
        author    : "Macario Ortega",
        published : false
      });


Instantiate an object optionally passing attributes to override:

      var post = Maker.build('post', { author: "Daffy Duck" });


It will return a Post instance with this attributes:

      {
        title: 'Post 1',
        createdAt: Tue Apr 09 2013 20:56:24 GMT-0500 (CDT),
        content: "Content for Post 1",
        author: 'Daffy Duck',
        published: false
      }

Use create for doing an actual creation of records while using
frameworks such as Spine.js or Backbone.js:

      var persistedPost = Maker.create('post', { author: "Daffy Duck" });


Or return a plain JavaScript attributes object:

      var postAttributes = Maker.attributes('post', { author: "Daffy Duck" });


You can reset the sequence counter for a given factory:

      > Maker.build('post').title;
      // => "Post 1"
      > Maker.build('post').title;
      // => "Post 2"
      > Maker.factory('post').resetSequence();
      // => Factory
      > Maker.build('post').title;
      // => "Post 1"


Or for all factories:

    Maker.resetSequences();


You can build an array of instances or attributes, optionally
overriding defaults:

    var posts = Maker.factory('post').arrayOf(3).build({
      createdAt : function() { var today = new Date();
        return new Date(today.getTime() - 24 * 60 * 60 * 1000);
      }
    };

    var persistedPosts = Maker.factory('post').arrayOf(3).create();

    var attributes = Maker.factory('post').arrayOf(3).attributes();


You can define a factory based on a previous factory definition:

      Maker.define('published-post').extend('post').defaults({
        published: true
      });


Extended factories will share a sequence counter,
but you can set a new one passing an optional start number:

      Maker.factory('published-post').setNewCounter(2);

