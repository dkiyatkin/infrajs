if not window?
  #Infra = require '../../src/props/load.coffee'
  Infra = require '../../src/infra.coffee'
  load = require '../../lib/load.coffee'
else
  window.exports = {}
  window.load = exports
  Infra = window.Infra

exports.loadFile = (test) ->
  #test.expect 3
  if window?
    infra = new Infra()
    text_file = "./index.html"
  else
    infra = new Infra({load})
    req = headers: host: '127.0.0.1'
    text_file = "/svn/dkiyatkin/public/lib/infrajs/test/./index.html"
  infra.load text_file, req, (err, data) ->
    test.ok not err, "errors"
    test.equal data.split(" ")[0], "<!DOCTYPE", "simple text load"
    test.equal infra.load.cache.text[text_file], data, "check cache"
    test.done()
