if not window?
  fs = require 'fs'
  #Infra = require '../../src/props/loader.coffee'
  Infra = require '../../src/infra.coffee'
  jsdom = require("jsdom").jsdom
else
  window.exports = {}
  window.loader = exports
  Infra = window.Infra

# Индикатор загрузки страницы
exports.loaderShowHide = (test) ->
  test.expect 2
  loaderShowHide = (infra) ->
    test.ok infra.loader.show(), "show loader"
    test.ok infra.loader.hide(), "hide loader"
    test.done()
  if not window?
    jsdom.env
      html: fs.readFileSync(__dirname + '/../index.html', 'utf-8')
      features:
        QuerySelector: true
      done: (err, window) ->
        infra = new Infra({document:window.document, logger: 'DEBUG'})
        loaderShowHide(infra)
  else
    loaderShowHide(new Infra({logger: 'DEBUG'}))
