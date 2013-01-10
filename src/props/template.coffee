###x>###
if not window?
  Infra = require '../../src/props/external.coffee'
else
  Infra = window.Infra
###<x###

###x>###
class Infra extends Infra
  constructor: ->
    super
    ###<x###

    ###
    * Разбирает строку шаблона.
    *
    * @param {String} html Строка шаблона.
    * @param {Object} ctx Контекст для шаблона.
    * @param {Object} callback Callback-функция, один аргумент разобранный шаблон.
    ###
    @tplParser = (html, ctx, callback) ->
      res = 'tplParser is not set'
      #res = Mustache.to_html(html, ctx)
      if callback
        callback res
      else
        res
    @tplParser = @options.tplParser if @options.tplParser

    setHtml = (layer, cb) ->
      layer.onload -> # все данные загружены
        if typeof (layer.tplString) is "string"
          @tplParser layer.tplString, layer, (htmlString) ->
            layer.htmlString = htmlString
            cb()
        else
          @log.error "Wrong tplString " + layer.tpl
          layer.htmlString = " "
          cb()
        
    setTemplate = (layer, cb) ->
      unless layer.tplString
        layer.tplString = " "
        if layer.tpl
          @load layer.tpl, (err, txt) ->
            layer.tplString = txt unless err
            cb()
        else
          cb()
      else
        cb()

    setData = (layer, cb) ->
      if layer.data # данные уже загружены
        cb()
      else
        layer.data = {}
        if layer.json # если есть путь для загрузки
          @load.json layer.json, (err, data) ->
            layer.data = data  unless err
            cb()
        else
          cb()

    @insert = (layer, cb) =>
      # Правило: Слои здесь точно скрыты
      counter = 2
      parse = ->
        if --counter is 0
          setHtml layer, -> cb() # распарсить
      if layer.htmlString
        cb()
      else if layer.tpl or layer.tplString
        setTemplate layer, -> parse() # загрузить шаблон
        setData layer, -> parse() # загрузить данные
      else
        cb 1

###x>###
if not window?
  module.exports = Infra
else
  window.Infra = Infra
###<x###
