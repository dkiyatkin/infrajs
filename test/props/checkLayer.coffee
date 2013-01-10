if not window?
  fs = require 'fs'
  #Infra = require '../../src/props/layer.coffee'
  Infra = require '../../src/infra.coffee'
  jsdom = require("jsdom").jsdom
else
  window.exports = {}
  window.checkLayer = exports
  Infra = window.Infra

exports.checkLayer = (test) ->
  checkLayer = (infra) ->
    infra.log.logger = 'WARNING'
    infra.index =
      htmlString: "<div id=\"base_text\"></div>"
      tag: "#base_html"
      states:
        "Страница": # здесь будет добавлен слэш
          tpl: "path/to/tpl2"
          tag: "#noid"
    infra.state = "/"
    infra.removeAllListeners "layer"
    infra.check() # собрать layers
    test.expect 6
    infra.on "end", ->
      console.log 123
      test.done()
    test.equal infra.layers[0].state, "^/.*$", "state1"
    test.equal infra.layers[1].state, "^/Страница/.*$", "state2"
    test.ok infra.checkLayer(infra.layers[0]), "status queue"
    test.strictEqual infra.checkLayer(infra.layers[0]), true, 'true'
    test.strictEqual infra.checkLayer(infra.layers[1]), 'no parent', 'no parent'
    infra.layers[0].show = true
    test.strictEqual infra.checkLayer(infra.layers[1]), "not inserted", 'not inserted'
  if not window?
    jsdom.env
      html: fs.readFileSync(__dirname + '/../index.html', 'utf-8')
      features:
        QuerySelector: true
      done: (err, window) ->
        infra = new Infra({logger: 'DEBUG', loader: false, index: {}, document: window.document})
        checkLayer(infra)
  else
    infra = new Infra({logger: 'DEBUG', loader: false, index: {}})
    checkLayer(infra)
