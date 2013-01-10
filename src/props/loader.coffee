###x>###
if not window?
  Infra = require '../../src/props/events.coffee'
else
  Infra = window.Infra
###<x###

# Индикатор загрузки

###x>###
class Infra extends Infra
  constructor: ->
    super
    ###<x###

    if @options.document
      @document = @options.document
    else if window?
      @document = window.document
    @options.loader = true if Object.keys(@options).indexOf('loader') is -1
    if @options.loader
      loader = false
      html = false
      @loader =
        src: '../images/loader.gif'
        show: =>
          @emit('create_loader')
          html.setAttribute "style", "cursor:progress"
          try
            loader.setAttribute('src', @loader.src)
            html.appendChild(loader)
          catch e
            @log.error 'error show loader'
          true
        hide: =>
          try
            html.removeChild(loader)
          catch e
            @log.error 'error hide loader'
          html.setAttribute "style", "cursor:auto"
          true
      @on "start", => @loader.show()
      @on "end", => @loader.hide()
      @once 'create_loader', =>
        html = @$('html')
        loader = @document.createElement('img')
        loader.setAttribute('style', 'z-index:1000;display:block;width:30px;height:30px;left:50%;top:50%;position:fixed;margin-left:-15px;margin-top:-15px;')

###x>###
if not window?
  module.exports = Infra
else
  window.Infra = Infra
###<x###
