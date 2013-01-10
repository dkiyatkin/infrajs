if not window?
  fs = require 'fs'
  #Infra = require '../../src/infra.coffee'
  Infra = require '../../src/infra.coffee'
  jsdom = require("jsdom").jsdom
else
  window.exports = {}
  window.selector = exports
  Infra = window.Infra

# Стандартный селектор infra.$
exports.setSelector = (test) ->
  #test.expect 1
  setSelector = (infra) ->
    test.strictEqual infra.$('html body').find('#base_html').innerHTML , 'hello world', "infra selector"
    test.done()
  if not window?
    jsdom.env
      html: fs.readFileSync(__dirname + '/../index.html', 'utf-8')
      features:
        QuerySelector: true
      done: (err, window) ->
        infra = new Infra({document: window.document})
        setSelector(infra)
  else
    setSelector(new Infra())
