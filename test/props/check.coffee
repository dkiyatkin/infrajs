if not window?
  #Infra = require '../../src/props/check.coffee'
  Infra = require '../../src/infra.coffee'
else
  window.exports = {}
  window.check = exports
  Infra = window.Infra

exports.simpleCheck = (test) ->
  infra = new Infra({logger: 'DEBUG', loader: false, index: {}})
  infra.log.logger = 'WARNING'
  infra.check (cb) ->
    cb()
    test.ok true, "simple"
    test.done()

# Проверка блокирования чека, сработает первый и последний
exports.manyCheck = (test) ->
  infra = new Infra({logger: 'DEBUG', loader: false, index: {}, delay: 5000})
  infra.log.logger = 'WARNING'
  infra.state = '/'
  a = 0
  test.expect 2
  infra.check (cb) ->
    test.ok true, "queue"
    a++
    cb()
  infra.check (cb) ->
    test.ok false, "queue"
    a++
    cb()
  infra.check (cb) ->
    test.ok false, "queue"
    a++
    cb()
  infra.check (cb) ->
    test.ok false, "queue"
    a++
    cb()
  infra.check (cb) ->
    a++
    test.strictEqual a, 2, "last"
    cb()
    test.done()

# Проверка ожидания чека
exports.waitCheck = (test) ->
  infra = new Infra({logger: 'DEBUG', loader: false, index: {}, delay: 5000})
  infra.log.logger = 'WARNING'
  infra.state = '/'
  a = 0
  test.expect 4
  infra.on "start", ->
    test.ok true, "start"
  infra.on "end", ->
    a++
    test.done()  if a is 2
  infra.check true # wait
  infra.check (cb) ->
    test.ok true, "resume"
    cb()
  infra.check (cb) ->
    test.ok false, "queue1"
    cb()
  infra.check (cb) ->
    test.ok false, "queue2"
    cb()
  infra.check (cb) ->
    test.ok true, "queue3"
    cb()
