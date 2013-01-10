###x>###
if not window?
  Infra = require '../../src/props/addressBar.coffee'
else
  Infra = window.Infra
###<x###

###x>###
class Infra extends Infra
  constructor: ->
    super
    ###<x###

    if not @options.cache? then @options.cache = true
    # Загружает кэш, вставленный на странице сервером.
    empty = =>

    getCache = =>
      @load.cache = Infra.server.cache
      i = @layers.length
      while --i >= 0
        layer = @layers[i]
        layer.show = Infra.server.showns[i]
        if layer.show
          
          # КЭШ
          layer.data = @load.cache.data[layer.json]  if not layer.data and layer.json and @load.cache.data[layer.json]
          layer.tplString = @load.cache.text[layer.tpl]  if not layer.htmlString and not layer.tplString and layer.tpl and @load.cache.text[layer.tpl]
          layer.reg_state = @state.match(new RegExp("^" + layer.state, "im"))
          # Событие показа
          try
            layer.onshow.bind(layer) empty
          catch e
            @log.error "onshow() " + i + " " + e
    
    #var infra_server_cache = document.getElementById('infra_server_cache');
    #infra_server_cache.parentNode.removeChild(infra_server_cache);
    if @options.cache
      @once "start", =>
        try
          getCache()
        catch e # можно открыть просто index.html
          @log.warn "fail cache"

###x>###
if not window?
  module.exports = Infra
else
  window.Infra = Infra
###<x###
