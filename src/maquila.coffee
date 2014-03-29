currier = (fn) ->
  args = Array::slice.call(arguments, 1)
  -> fn.apply this, args.concat(Array::slice.call(arguments, 0))


Maquila =
  define: (name, model = Object) ->
    @factories ?= {}
    @factories[name] = new @Factory(model, @strategies)

  factory: (name) ->
    @factories ?= {}
    @factories[name] or throw("factory '#{name}' is not defined")

  resetSequences: () ->
    for key, factory of @factories
      factory.resetSequence()
    this

  attributes: (name, overrides) ->
    @factory(name).attributes(overrides)

  build: (name, overrides)  -> @factory(name).build(overrides)
  create: (name, overrides) -> @factory(name).create(overrides)

  strategies:
    build: (Constructor, attributes)  -> new Constructor attributes
    create: (Constructor, attributes) -> Constructor.create attributes

  strategy: (name, func) ->
    @strategies[name] = func
    for name, factory of @factories
      factory.refreshStrategies()
    this


class Collection
  constructor: (@factory, @length) ->
    for name of @factory.strategies
      @[name] = currier(@executeStrategy, name)

  attributes: (overrides) ->
    @factory.attributes(overrides) for num in [1..@length]

  executeStrategy: (name, overrides) ->
    @factory[name](overrides) for num in [1..@length]


class Counter
  constructor: (@start = 1) -> @sequence = @start
  increment: -> @sequence += 1
  reset:     -> @sequence = @start


class Maquila.Factory
  constructor: (@Constructor, strategies) ->
    @defaultAttrs = {}
    @strategies   = Object.create(strategies)
    @refreshStrategies()
    @setNewCounter()

  setNewCounter: (num = 1) ->
    @counter = new Counter(num)
    this

  defaults: (attrs) ->
    @defaultAttrs[key] = val for key, val of attrs
    this

  attributes: (overrides = {}) ->
    attrs = {}
    attrs[key] = val for key, val of @defaultAttrs
    attrs[key] = val for key, val of overrides

    for key, val of attrs
      attrs[key] =
        if typeof val is 'function' then val.apply(this, [attrs]) else val

    @incrementSequence()
    attrs

  strategy: (name, func) ->
    @strategies[name] = func
    @refreshStrategies()
    this

  executeStrategy: (name, overrides) ->
    @strategies[name]( @Constructor, @attributes(overrides) )

  refreshStrategies: ->
    for name of @strategies
      @[name] = currier(@executeStrategy, name)
    this

  extend: (name) ->
    other       = Maquila.factory(name)
    @counter    = other.counter
    @strategies = Object.create(other.strategies)
    @defaults other.defaultAttrs
    @refreshStrategies()
    this

  arrayOf: (num) -> new Collection(this, num)
  sequence:          -> @counter.sequence
  incrementSequence: -> @counter.increment() and @
  resetSequence:     -> @counter.reset() and @


if module?.exports then module.exports.Maquila = Maquila else @Maquila = Maquila
