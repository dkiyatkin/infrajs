if not window?
  #Infra = require '../src/infra.coffee'
  Infra = require '../src/infra.coffee'
else
  window.exports = {}
  window.core = exports
  Infra = window.Infra

# Инициализация
exports.testInit = (test) ->
  infra = new Infra()
  test.expect 1
  test.strictEqual infra.layers.length, 0, "infra.layers"
  test.done()

exports.manyInit = (test) ->
  test.expect 1
  infra = new Infra()
  infra2 = new Infra()
  test.ok infra isnt infra2, "new obj"
  test.done()

exports.testExtend = (test) ->
  test.expect 7
  class Infra extends Infra
    constructor: (options) ->
      @value = options.value
      test.strictEqual 4, value4, "infra.value4"
      super
    value3: 3 # see
    value4 = 4 # !see
    func: ->
      console.log(1111)
      console.log(@value3)
  infra2 = new Infra({value:2})
  class Infra extends Infra
    constructor: ->
      @value = 2
      super
    method: -> @value1 + value2
    value1: 1
    value2 = 2
  infra = new Infra({value:5})
  #infra.func()
  test.strictEqual infra.layers.length, 0, "infra.layers"
  test.strictEqual 3, infra.value3, "infra.value3"
  test.strictEqual 5, infra.value, "infra.value"
  test.strictEqual 3, infra.method(), "value1 + value2"
  test.strictEqual undefined, infra.value2, "infra.undefined"
  test.done()

###
exports.test_on_check_event = (test) ->
  infra = new Infra()
  infra.index = {}
  test.expect 5
  infra.once "end", ->
    test.ok true, "queue1"

  infra.once "end", ->
    test.ok true, "queue2"

  infra.once "end", ->
    test.ok true, "queue3"

  infra.once "end", ->
    test.ok true, "queue4"

  infra.once "end", ->
    test.ok true, "queue5"
    test.done()

  infra.check()
###
