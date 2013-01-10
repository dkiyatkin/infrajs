if not window?
  fs = require 'fs'
  #Infra = require '../../src/props/layer.coffee'
  Infra = require '../../src/infra.coffee'
  jsdom = require("jsdom").jsdom
  mustache = require("mustache").jsdom
else
  window.exports = {}
  window.layer = exports
  Infra = window.Infra
  window.mustache = window.Mustache

tplParser = (html, ctx, callback) ->
  res = mustache.to_html(html, ctx)
  if callback
    callback res
  else
    res

exports.badLayer = (test) ->
  badLayer = (infra) ->
    #infra.log.logger = 'WARNING'
    test.expect 2
    infra.index =
      HTML: "adf"
      tag: "#base_html"
      label: "error_layer wow"
      id: "213"
    infra.state = "/"
    infra.once "end", ->
      test.equal infra.labels.wow[0].status, "wrong insert", "labels"
      test.equal infra.ids["213"], infra.layers[0], "ids"
      test.done()
    infra.check()
  if not window?
    jsdom.env
      html: fs.readFileSync(__dirname + '/../index.html', 'utf-8')
      features:
        QuerySelector: true
      done: (err, window) ->
        infra = new Infra({logger: 'DEBUG', loader: false, index: {}, document: window.document, tplParser: tplParser})
        badLayer(infra)
  else
    infra = new Infra({logger: 'DEBUG', loader: false, index: {}, tplParser: tplParser})
    badLayer(infra)

exports.layer = (test) ->
  layer = (infra) ->
    #infra.log.logger = 'WARNING'
    test.expect 1
    infra.index =
      htmlString: "<div id=\"base_text\"></div>"
      tag: "#base_html"
    infra.state = "/"
    infra.once "end", ->
      test.equal infra.ids.length, infra.layers[0].length, "ids length"
      test.done()
    infra.check()
  if not window?
    jsdom.env
      html: fs.readFileSync(__dirname + '/../index.html', 'utf-8')
      features:
        QuerySelector: true
      done: (err, window) ->
        infra = new Infra({logger: 'DEBUG', loader: false, index: {}, document: window.document, tplParser: tplParser})
        layer(infra)
  else
    infra = new Infra({logger: 'DEBUG', loader: false, index: {}, tplParser: tplParser})
    layer(infra)

exports.layer2 = (test) ->
  layer2 = (infra) ->
    #infra.log.logger = 'WARNING'
    infra.index =
      htmlString: "<div id=\"base_text\"></div>"
      tag: "#base_html"
      tags:
        "#base_text": # здесь будет добавлен слэш
          htmlString: "<div id=\"base_left\"></div>"
          states:
            "Страницы":
              tag: "#base_left"
              htmlString: "state1 ok"

            "Галерея":
              tag: "#base_left"
              htmlString: "state2 ok"

        "#noid":
          htmlString: "123"
    test.expect 19
    infra.state = "/Страницы/"
    infra.once "end", ->
      test.equal infra.check_status, "stop2", 'check_status is stop2'
      test.ok infra.layers[0].show, "layer 0 show |" + infra.layers[0].status
      test.ok infra.layers[1].show, "layer 1 show |" + infra.layers[1].status + '|' + infra.layers[1].check
      test.ok infra.layers[2].show, "layer 2 show"
      test.ok not infra.layers[3].show, "layer 3 not show"
      test.ok not infra.layers[4].show, "layer 4 not show"
      infra.state = "/Галерея/"
      test.equal infra.check_count, 1, 'check_count1'
      setTimeout =>
        infra.once "end", ->
          test.equal infra.check_count, 2, 'check_count2'
          test.equal infra.check_status, "stop2", 'check_status2 is stop2'
          test.ok infra.layers[0].show, "layer 0 show"
          test.ok infra.layers[1].show, "layer 1 show"
          test.ok not infra.layers[2].show, "layer 2 not show |" + infra.layers[2].status + '|' + infra.layers[2].check
          test.ok infra.layers[3].show, "layer 3 show"
          test.ok not infra.layers[4].show, "layer 4 not show"
          infra.state = "/"
          setTimeout =>
            infra.once "end", ->
              test.ok infra.layers[0].show, "layer 0 show"
              test.ok infra.layers[1].show, "layer 1 show"
              test.ok not infra.layers[2].show, "layer 2 not show"
              test.ok not infra.layers[3].show, "layer 3 not show"
              test.ok not infra.layers[4].show, "layer 4 not show"
              test.done()
            infra.check()
          , 1
        infra.check()
      , 1
    infra.check()
  if not window?
    jsdom.env
      html: fs.readFileSync(__dirname + '/../index.html', 'utf-8')
      features:
        QuerySelector: true
      done: (err, window) ->
        infra = new Infra({logger: 'DEBUG', loader: false, index: {}, document: window.document, tplParser: tplParser})
        layer2(infra)
  else
    infra = new Infra({logger: 'DEBUG', loader: false, index: {}, tplParser: tplParser})
    layer2(infra)
