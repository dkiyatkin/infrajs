if not window?
  #Infra = require '../../src/props/compile2lvl.coffee'
  Infra = require '../../src/infra.coffee'
else
  window.exports = {}
  window.compile2lvl = exports
  Infra = window.Infra

exports.testStates = (test) ->
  infra = new Infra({logger: 'DEBUG', loader: false, index: {}})
  infra.log.logger = 'WARNING'
  infra.index =
    tpl: "path/to/tpl1"
    tag: "#base_html"
    states:
      "Страница": # здесь будет добавлен слэш
        tpl: "path/to/tpl2"
        tag: "#base_text"

  infra.check()
  test.expect 3
  test.strictEqual infra.layers[1].state, "^/Страница/.*$", "state"
  test.strictEqual infra.layers[0], infra.layers[1].parent, "parent"
  test.strictEqual infra.layers[0].states['Страница'], infra.layers[1], "states"
  test.done()

exports.testTags = (test) ->
  infra = new Infra({logger: 'DEBUG', loader: false, index: {}})
  infra.log.logger = 'WARNING'
  infra.index =
    tpl: "path/to/tpl1"
    state: "/Главная/" # здесь никто сам не добавит последний слэш
    tag: "#base_html"
    tags:
      "#base_text":
        tpl: "path/to/tpl2"

  infra.check()
  test.expect 3
  test.strictEqual infra.layers[0].state, infra.layers[1].state, "state"
  test.strictEqual infra.layers[0], infra.layers[1].parent, "parent"
  test.strictEqual infra.layers[0].tags[infra.layers[1].tag], infra.layers[1], "tags"
  test.done()

exports.testDeep = (test) ->
  infra = new Infra({logger: 'DEBUG', loader: false, index: {}})
  infra.log.logger = 'WARNING'
  infra.index =
    tpl: "path/to/tpl1"
    state: "/Главная/" # здесь никто сам не добавит последний слэш
    tag: "#base_html"
    tags:
      "#base_text":
        tpl: "path/to/tpl2"
    states:
      "Страница": # здесь будет добавлен слэш
        tpl: "path/to/tpl3"
        tag: "#base_text"
        states:
          'Страница2':
            tpl: "path/to/tpl4"
            tag: "#base_text"
          'Страница3':
            tpl: "path/to/tpl5"
            tag: "#base_text"
        tags:
          "#base_text":
            tpl: "path/to/tpl6"

  infra.check()
  i = infra.layers.length
  test.expect 6
  while --i >= 0
    test.strictEqual 'path/to/tpl'+(infra.layers[i].id+1), infra.layers[i].tpl, "deep and order"
  test.done()
