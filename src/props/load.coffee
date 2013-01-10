###x>###
if not window?
  Infra = require '../../src/props/loader.coffee'
else
  Infra = window.Infra
###<x###

###x>###
class Infra extends Infra
  constructor: ->
    super
    ###<x###

    ###
    * Высокоуровневый загрузчик файлов для infrajs с поддержкой кэширования
    * Применение стилей и выполнение скриптов на странице
    ###

    ###
    load = (path, options, callback) ->
    load.txt ->
    load.js ->
    load.css ->
    load.json ->
    load.script ->
    load.xml ->
    load.load ->
    # алиасы
    load.exec = @load.js
    load.style = @load.styles = @load.css
    ###

    _loading = {} # файлы, которые сейчас загружаются
    ###
* Загрузчик с использованием кэша
* Загружает переданный путь, если он уже загружен то будет получен кэшированный ответ.
*
* @param {String} path Путь для загрузки.
* @param {Object} options Параметры для загрузки.
* @param {Function} callback Callback функция, первый агрумент содержит ошибку запроса, второй строку полученных данных с сервера.
    ###
    @load = (path, options, cb) =>
      cb = options if not cb
      options = {} if not options
      options.type = 'text' if !options.type
      if (!@load.cache.text[path])
        unless _loading[path]
          _loading[path] = true
          @load.load path, options, (err, ans) =>
            @load.cache.text[path] = ans
            @log.error "error load " + path  if err
            _loading[path] = false
            @emit "load: " + path, err
            cb err, @load.cache.text[path]
        else
          @log.debug "add load queue for " + path
          @once "load: " + path, (err) =>
            cb err, @load.cache.text[path]
      else cb null, @load.cache.text[path]
    ###
* Общий низкоуровневый загрузчик
* Загружает переданный путь не используя кэширование.
* @options.type text по-умолчанию. (html, json, jsonp, script, text)
*
* @param {String} path Путь для загрузки.
* @param {Object} options Параметры для загрузки.
* @param {Function} callback Callback функция, первый агрумент содержит ошибку запроса, второй строку полученных данных с сервера.
    ###
    @load.load = (path, options, cb) =>
      cb = options if not cb
      options = {} if not options
      options.type = 'text' if !options.type
      req = createRequestObject()
      req.open "GET", path, true
      if options.type is 'json'
        req.setRequestHeader "Content-Type", "application/x-www-form-urlencoded"
        req.setRequestHeader "Accept", "application/json, text/javascript"
      else
        req.setRequestHeader "Content-Type", "text/plain; charset=UTF-8"
      req.onreadystatechange = ->
        if req.readyState is 4
          if req.status is 200
            cb 0, req.responseText
          else
            cb 0, null
      req.send null
    if @options.load
      @load.load = @options.load
    ###
* Загружает переданный путь как JSON-объект, если он уже загружен то будет получен кэшированный ответ.
*
* @param {String} path Путь для загрузки.
* @param {Object} options Параметры для загрузки.
* @param {Function} callback Callback функция, первый агрумент содержит ошибку запроса, второй JSON-объект полученных данных с сервера.
    ###
    @load.json = (path, options, cb) =>
      cb = options if not cb
      options = {} if not options
      options.type = 'json'
      if (!@load.cache.data[path])
        @load path, options, (err, text) =>
          try
            @load.cache.data[path] = JSON.parse(json)
          catch e
            @log.error "wrong json data " + path
          cb err, @load.cache.data[path]
      else cb null, @load.cache.data[path]
    ###
* Загружает переданный путь и выполняет его как javascript-код, если он уже загружен то будет выполнен повторно.
*
* После чего выполняет полученные данные как js-код в глобальной области.
* Синоним функции — **infra.load.exec**.
*
* @param {String} path Путь для загрузки.
* @param {Object} options Параметры для загрузки.
* @param {Function} callback Callback функция, единственный агрумент содержит ошибку выполнения команды.
    ###
    @load.js = (path, options, cb) =>
      cb = options if not cb
      options = {} if not options
      options.type = 'text'
      if /^http(s){0,1}:\/\//.test(path)
        setXDR path # <-
        cb 0
      else
        @load path, (err, options, ans) ->
          if err
            cb err
          else
            try
              globalEval ans # <-
              cb 0
            catch e
              @log.error "wrong js " + path
              cb e
    @load.exec = @load.js
    _busy = false
    ###
 * Выполняет script вставленный в DOM.
 *
 * @param {Object} node DOM-узел тэга script.
    ###
    @load.script = (node) =>
      if _busy
        setTimeout (->
          @load.script node
        ), 1
        return
      _busy = true
      if node.src
        @load.js node.src, (err) ->
          _busy = false
      else
        try
          globalEval node.innerHTML
        catch e
          @log.error "Ошибка в скрипте."
        _busy = false
    ###
* Вставляет стили на страницу и применяет их.
*
* @param {String} code Код css для вставки в документ.
    ###
    @load.css = (code) =>
      return if @load.cache.css[code] #Почему-то если это убрать после нескольких перепарсиваний стили у слоя слетают..
      @load.cache.css[code] = true
      style = document.createElement("style") #создани style с css
      style.type = "text/css"
      if style.styleSheet
        style.styleSheet.cssText = code
      else
        style.appendChild document.createTextNode(code)
      head = @$('head')
      head.insertBefore style, head.lastChild #добавили css на страницу
    @load.style = @load.styles = @load.css
    ###
* Очищает кэш в зависимости от переданного параметра.
*
* @param {String|Object} [clean] Если передан RegExp, то функция удаляет весь кэш, пути которого совпадают с регулярными выражением. Если передана строка, удаляется кэш, пути которого равны строке. Если ничего не передано очищается весь кэш.
    ###
    @load.clearCache = (clean) =>
      if !clean?
        @load.cache.data = {}
        @load.cache.text = {}
      else if clean.constructor is RegExp
        _clearRegCache clean, @load.cache.data
        _clearRegCache clean, @load.cache.text
      else
        delete (@load.cache.data[clean])
        delete (@load.cache.text[clean])
    ###
* Объект хранит кэш-данные.
*
* Примеры:
*		infra.load.cache.css['css-code'] // если true, то указанный css-код применился.
*		infra.load.cache.text['path/to/file'] // возвращает загруженный текст по указанному пути.
*		infra.load.cache.data['path/to/file'] // возвращает объект, полученный из текста по указанному пути.
    ###
    @load.cache =
      css: {}
      data: {}
      text: {}

    # Очистка кэша по регекспу
    _clearRegCache = (clean, obj) ->
      for own key of obj
        delete (obj[key]) if clean.test(key)

    createRequestObject = () ->
      if XMLHttpRequest?
        XMLHttpRequest()
      else
        XMLHttpRequest2 = ->
          try
            return new ActiveXObject("Msxml2.XMLHTTP.6.0")
          try
            return new ActiveXObject("Msxml2.XMLHTTP.3.0")
          try
            return new ActiveXObject("Msxml2.XMLHTTP")
          try
            return new ActiveXObject("Microsoft.XMLHTTP")
          throw new Error("This browser does not support XMLHttpRequest.")
        XMLHttpRequest2()

    # Выполнить js
    globalEval = (data) =>
      head = @$('head')
      script = document.createElement("script")
      script.type = "text/javascript"
      script.text = data
      head.insertBefore script, head.firstChild
      head.removeChild script

    # Кросс-доменный запрос
    setXDR = (path) =>
      script = document.createElement("script")
      script.type = "text/javascript"
      head = @$('head')
      script.src = path
      head.insertBefore script, head.firstChild
      head.removeChild script

###x>###
if not window?
  module.exports = Infra
else
  window.Infra = Infra
###<x###
