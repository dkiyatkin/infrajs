if not window?
  util = require 'util'
  inherits = require('super')
  EventEmitter = require("events").EventEmitter
  EventEmitter2 = require('eventemitter2').EventEmitter2
  #Infra = require '../../src/props/events.coffee'
  Infra = require '../../src/infra.coffee'
else
  window.exports = {}
  window.events = exports
  EventEmitter2 = window.EventEmitter2
  EventEmitter = EventEmitter2
  inherits = window.inherits
  util = { inherits }
  Infra = window.Infra

# Варианты подключения сторонних событий
# # Только для сервера
# util.inherits(Infra, EventEmitter)
# util.inherits(Infra, EventEmitter2)
# inherits(Infra, EventEmitter)
#
# # Для браузера и для сервера
# inherits(Infra, EventEmitter2)

# События
testOnEvent = (test, Infra, cb) ->
  infra = new Infra()
  infra.on "test_on_event", (param) ->
    test.ok param, "send params"
  infra.emit "test_on_event", true
  infra.emit "test_on_event", true
  test.strictEqual infra.listeners("test_on_event").length, 1, "length on listeners"
  cb()


exports.testOnEvent = (test) ->
  test.expect 3
  testOnEvent test, Infra, ->
    test.done()

exports.testOnceEventAndListeners = (test) ->
  infra = new Infra()
  test.expect 4
  listeners = infra.listeners("test_once_event")
  test.strictEqual listeners.length, 0, "length once listeners"
  infra.once "test_once_event", (param) ->
    test.ok param, "bad send params"
  test.strictEqual listeners.length, 1, "length once listeners"
  infra.emit "test_once_event", true
  infra.emit "test_once_event", false
  test.strictEqual listeners.length, 0, "length once listeners"
  test.done()

exports.testOnceEventAndListeners2 = (test) ->
  infra = new Infra()
  listeners = infra.listeners("test_once_event2")
  test.expect 2
  infra.once "test_once_event2", ->
    test.equal listeners.length, 0, "length once listeners0"
    test.done()
  test.equal listeners.length, 1, "length once listeners1"
  infra.emit "test_once_event2"

