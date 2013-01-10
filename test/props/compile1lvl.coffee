if not window?
  #Infra = require '../../src/props/compile1lvl.coffee'
  # or
  fs = require 'fs'
  #Infra = require '../../src/props/layer.coffee'
  Infra = require '../../src/infra.coffee'
  jsdom = require("jsdom").jsdom
else
  window.exports = {}
  window.compile1lvl = exports
  Infra = window.Infra

exports.tag = (test) ->
  test.expect 1
  infra = new Infra({logger: 'DEBUG', loader: false, index: {}})
  infra.log.logger = 'WARNING'
  infra.index = tag: "#base_html"
  infra.check()
  test.strictEqual infra.layers[0].tag, "#base_html", "tag"
  test.done()

exports.doubleCheck = (test) ->
  doubleCheck = (infra) ->
    infra.log.logger = 'WARNING'
    infra.index = tag: "#base_html"
    infra.state = '/'
    test.expect 2
    infra.on "layer", (layer, num) ->
      test.ok true, "double _check"
    infra.check (cb) ->
      cb()
    infra.check (cb) ->
      cb()
    infra.check (cb) ->
      cb()
      test.done()
  if not window?
    jsdom.env
      html: fs.readFileSync(__dirname + '/../index.html', 'utf-8')
      features:
        QuerySelector: true
      done: (err, window) ->
        infra = new Infra({logger: 'DEBUG', loader: false, index: {}, document: window.document})
        doubleCheck(infra)
  else
    infra = new Infra({logger: 'DEBUG', loader: false, index: {}})
    doubleCheck(infra)

exports.layerListeners = (test) ->
  test.expect 2
  infra = new Infra({logger: 'DEBUG', loader: false, index: {}})
  infra.log.logger = 'WARNING'
  infra.index =
    tag: "#base_html"
    onshow: (cb) ->
      test.ok true, "onshow"
      cb()

  infra.check()
  testfunc = ->
    test.ok true, "onchecked"

  infra.layers[0].oncheck testfunc
  infra.layers[0].onshow test.done
