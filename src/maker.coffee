# Este archivo será evenualmente vendoreado solamente para correr pruebas de
# Jasmine.

Maker =
  define: (name, model = Object) ->
    @factories or= {}
    @factories[name] = new Maker.Factory(model)

  factory: (name) ->
    @factories or= {}
    @factories[name] or throw("factory '#{name}' is not defined")

  attributes: (name, overrides) ->
    @factory(name).attributes(overrides)

  build: (name, overrides) ->
    @factory(name).build(overrides)

  create: (name, overrides) ->
    @factory(name).create(overrides)

  resetSequences: () ->
    for key, factory of @factories
      factory.resetSequence()
    @


class Collection
  constructor: (@factory, @length) ->

  attributes: (overrides) ->
    @factory.attributes(overrides) for num in [1..@length]

  build: (overrides) ->
    @factory.build(overrides) for num in [1..@length]

  create: (overrides) ->
    @factory.create(overrides) for num in [1..@length]


class Counter
  constructor: (start) ->
    @start    = start or 1
    @sequence = @start

  increment: -> @sequence += 1
  reset:     -> @sequence = @start


class Maker.Factory
  constructor: (@Constructor) ->
    @defaultAttrs = {}
    @setNewCounter()

  setNewCounter: (num = 1) ->
    @counter = new Counter(num)
    @

  defaults: (attrs) ->
    @defaultAttrs[key] = val for key, val of attrs
    @

  attributes: (overrides = {}) ->
    attrs = {}

    attrs[key] = val for key, val of @defaultAttrs
    attrs[key] = val for key, val of overrides

    for key, val of attrs
      attrs[key] =
        if typeof val is 'function' then val.apply(@, [attrs]) else val

    @incrementSequence()
    attrs

  build: (overrides) ->
    new @Constructor(@attributes(overrides))

  create: (overrides) ->
    if typeof @Constructor.create is 'function'
      @Constructor.create(@attributes(overrides))
    else
      @build(overrides)

  arrayOf: (num) -> new Collection(@, num)

  extend: (name) ->
    defaults = {}
    other    = Maker.factory(name)
    @counter = other.counter

    defaults[key] = val for key, val of other.defaultAttrs
    @defaults(defaults)
    @

  sequence:          -> @counter.sequence
  incrementSequence: -> @counter.increment() and @
  resetSequence:     -> @counter.reset() and @

if exports? then exports.Maker = Maker else @Maker = Maker
