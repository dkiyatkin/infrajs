###! infrajs - v0.0.12 - 2013-01-09 ###
###
* Объект Infra содержит методы для создания и расширения контроллера слоев.
* Создает новый контроллер **infra**.
*
* Примеры:
*
*   infra = new Infra();
*
* @return {Object} infra Контроллер слоев.
* @receiver Infra
###

class Infra
  constructor: (@options = {}) ->
    @layers = []
    ###
* Предоставляет интерфейс управления отладочными сообщениями.
*
* Примеры:
*
*   infra.log.error('test error'); // вернет и выведет в консоль 'test error'
*   infra.log.warning('test warning'); // вернет и выведет в консоль 'test warning'
*   infra.log.info('test info'); // вернет и выведет в консоль 'test info'
*   infra.log.logger = 'WARNING'; // выбрать уровень логгера
*   // доступны 4 соответсвующих уровня: ERROR, WARNING (выбран по умолчанию), INFO и DEBUG
*   infra.log.debug('test debug'); // ничего не произойдет, потому что логгер задан уровнем выше
    ###
    @log =
      debug: (msg...) -> log(msg, 3)
      info: (msg...) -> log(msg, 2)
      warn: (msg...) -> log(msg, 1)
      error: (msg...) -> log(msg, 0)
      logger: 'WARNING'
      quiet: false
    @log.logger = @options.log if @options.log
    @log.logger = @options.logger if @options.logger

    loggers = ['ERROR', 'WARNING', 'INFO', 'DEBUG']

    log = (msg, log_level) =>
      if loggers.indexOf(@log.logger) >= log_level
        msg = '[' + new Date().toGMTString() + '] ' + loggers[log_level] + ' ' + msg.join(' ')
        if not @log.quiet
          console.log msg if log_level is 3
          console.info msg if log_level is 2
          console.warn msg if log_level is 1
          console.error msg if log_level is 0
        msg

    if @options.document
      @document = @options.document
    else if window?
      @document = window.document
    if @options.$
      @$ = @options.$
    else
      ###
      * Возвращает элемент DOM или массив элементов DOM
      * infra.$('sel'), infra.$('sel').find('sel2')
      ###
      @$ = (selector) =>
        node_parent = @document.querySelectorAll(selector)
        node_parent = node_parent[0] if node_parent.length is 1
        node_parent.find = (selector) ->
          node_child = []
          if node_parent and node_parent.length
            i = node_parent.length
            while --i >= 0
              node = node_parent[i].querySelectorAll(selector)
              ii = node.length
              while --ii >= 0
                node_child.push(node[ii])
          else node_child = node_parent.querySelectorAll(selector)
          node_child = node_child[0] if node_child.length is 1
          node_child
        node_parent

    # Простые события


    _listeners = {} # здесь хранятся обработчики для выполнения
    _del_listeners = {} # обработчик находящийся здесь будет удален
    ###
* Добавляет обработчик к другим обработчкика на указанное событие.
*
* Уже назначенные события
*  - start
*  - compile(layer, prop, index[prop])
*  - layer
*  - queue
*  - insert
*  - external
*  - end
*
* @param {String} name Имя события.
* @param {Function} callback Функция-обработчик.
    ###
    @on = (name, callback) ->
      _listeners[name] = []  unless _listeners[name]
      _listeners[name].push callback
    ###
* Добавляет обработчик к другим обработчкика на указанное событие, который выполниться только один раз.
* @param {String} name Имя события.
* @param {Function} callback Функция-обработчик.
    ###
    @once = (name, callback) -> # создает обработчик на один раз
      _listeners[name] = []  unless _listeners[name]
      _del_listeners[name] = []  unless _del_listeners[name]
      _listeners[name].push callback
      _del_listeners[name].push callback
    ###
* Выполнит все обработчики для указанного события.
* @param {String} name Имя события.
* @param {} [arg1,&nbsp;arg2,&nbsp;..] Любое количество аргументов для обработчика.
    ###
    @emit = (name) ->
      if _listeners[name]
        # собрали аргументы
        args = Array::slice.call(arguments).slice(1)
        i = 0
        len = _listeners[name].length
        while i < len
          emitter = _listeners[name][i]
          if emitter # может он уже удален
            if _del_listeners[name] # сперва удалить если нужно
              pos = _del_listeners[name].indexOf(emitter)
              if pos > -1
                _del_listeners[name].splice(pos,1)
                _listeners[name].splice(i,1)
                i--
            emitter.apply(this, args)
          i++
    ###
* Возвращает массив обработчиков для переданного события.
* @param {String} name Имя события.
* @return {Array} Массив обработчиков.
    ###
    @listeners = (name) ->
      _listeners[name] = []  unless _listeners[name]
      _listeners[name]
    ###
 * Удаляет все обработчики для указанного события.
 * @param {String} name Имя события.
    ###
    @removeAllListeners = (name) -> # удаляет все обработчики из массива обработчиков для указанного события
      _listeners[name] = []
      _del_listeners[name] = []


    # Индикатор загрузки


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
            @load.cache.data[path] = JSON.parse(text)
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

    empty = (cb) -> cb()
    @index = @options.index if @options.index
    check_queue = 1 # насколько большая может быть очередь для чеков
    check_queue = @options.check_queue if @options.check_queue
    #@check_delay = 1 # размер паузы между циклами в милисекундах
    #@check_delay = @options.check_delay if @options.check_delay
    check_limit = 100 # количество возможных кругов чека
    check_limit = @options.check_limit if @options.check_limit
    check_timeout = 10000
    check_timeout = @options.check_timeout if @options.check_timeout
    @check_status = 'stop' # run, stop, pause выполняется, остановлен, на паузе
    @check_count = 0

    _compile = (index) =>
      layer = {} # самый первый слой
      for own prop, value of index
        # бежим по будущим свойствам слоя, передается сам слой, имя свойства, значение свойства
        @emit('compile', layer, prop, value)

    ###
* Компилирует слои в объект **infra.layers**.
*
* Обнуляет существующий **infra.layers**. Запускает событие **compile**.
*
* @param {Object} index Объект содержащий описание для слоев.
* @param {Function} cb Callback-Функция без аргументов.
    ###
    @compile = (index) =>
      @index = index if index # новый индекс
      @layers = [] # очищаем слои
      # index может быть или объектом или массивом объектов
      if @index.splice
        i = @index.length
        while --i >= 0
          _compile @index[i]
      else
        _compile @index
      @ids = {} # установить id, state, config слоям
      i = @layers.length
      while --i >= 0
        layer = @layers[i]
        layer.oncheck = empty unless layer.oncheck
        layer.onload = empty unless layer.onload
        layer.onshow = empty unless layer.onshow
        layer.config = {} unless layer.config
        layer.state = '/' unless layer.state
        layer.id = i  unless layer.id
        @ids[layer.id] = layer
        if not ((layer.state[0] is "^") or (layer.state.slice(-1) is "$")) # если есть спец символы то state не изменяем
          layer.state = '^'+layer.state+'.*$'

    @on 'start', =>
      @log.debug('first circle, queue: ' + @listeners('queue').length)
      @circle =
        interrupt: false # прерывание
        count: 0 # счетчик, сбрасывается в каждом круге
        occupied: {} # забитые тэги, за определенными слоями
        loading: 0 # ассинхронная загрузка
        state: @state
        limit: check_limit
        queue: check_queue
        length: @layers.length
        cb: null # callback функция @check
        timeout: check_timeout # сколько может длиться
        time: Date.now() # время начала

    # Пробежаться по слоям, запустить ассинхронные изменения и занять ихний результат, назначить ожидание circle.loading++
    # по завершению изменения если есть loading, то применить его и запускать цикл опять emit('circle')
    # цикл работает сверяясь с уже занятыми результатами
    @on 'circle', () =>
      check_count = @check_count
      setTimeout => # для очереди чеков
        if (@check_status is 'run') and (check_count is @check_count) # может уже остановиться
          i = @circle.length
          while --i >= 0
            if @layers[i].status is 'queue'
              @circle.num = i
              @emit 'layer', @layers[i], i
          listeners = @listeners('circle')
          if ++@circle.count >= @circle.limit
            @log.warn @circle.limit + ' limit'
            listeners = listeners.splice(1, listeners.length)
          if @circle.timeout < (Date.now()-@circle.time)
            @log.warn @circle.timeout + ' timeout'
            listeners = listeners.splice(1, listeners.length)
          if listeners.length > 1 # появились дополнительные подписчики
            @emit 'circle'
          else if not @circle.loading
            @emit 'end'
      , 1

    firstCircle = (cb) =>
      @check_status = 'run'
      @circle.cb = cb
      # совпавшее состояние слоя, может быть не полностью равным @circle.state
      if @circle.state
        i = @circle.length
        while --i >= 0
          @layers[i].status = 'queue' # статус обработки слоя
          re = new RegExp(@layers[i].state, "im")
          @layers[i].reg_state = @circle.state.match(re)
          @layers[i].node = null
        @emit 'circle'
      else
        @log.warn('no set circle.state')
        @emit 'end'

    @on 'end', =>
      @log.debug('end check, circle.count: ' + @circle.count + ', check_count: ' + @check_count)
      if typeof(@circle.cb) is 'function'
        @circle.cb => @check_status = 'stop1'
      else
        @check_status = 'stop2'
      @emit 'queue'

    ###
* Запуск контроллера.
*
* Как только обрабатывается очередной слой, срабатывает событие layer. Пробежка по слоям происходит в обратном порядке.
*
* @param {Function|Boolean} cb Callback-функция или wait-сигнал для блокировки продолжительности чека, если передан true, завершается (начинает работать) только при следующем разе при функции или false.
    ###
    @check = (cb) =>
      # дальше в зависимости от трех состояний
      if @check_status is 'run' # чек во время другого, мутим очередь
        @circle.interrupt = true
        @once 'queue', => @check cb
        listeners = @listeners 'queue'
        listeners.splice 0, listeners.length - @circle.queue
        @log.debug('check queue, listeners ' + listeners.length)
      else if @check_status is 'pause' # чек в процессе
        unless cb is true # а при ожидающем ничего не делать
          firstCircle cb
      else # другой чек не запущен
        @check_count++
        @compile() unless @layers.length
        @log.info('empty layers') unless @layers.length
        @emit 'start'
        unless cb is true
          firstCircle cb
        else
          @check_status = 'pause'

    oneprops = ["tag", "state", "css", "json", "tpl", "ext", "tplString", "htmlString", "id"]
    oneprops_obj = ["config", "data"]
    oneprops2 = ["oncheck", "onload", "onshow"]
    @labels = {}
    @on "compile", (layer, prop, value) =>
      if oneprops.indexOf(prop) >= 0 # строки
        if Object::toString.apply(value) is "[object String]"
          if prop is 'tag' # отсеим повторные обращения
            @layers.push layer if @layers.indexOf(layer) is -1 # создать слой
          layer[prop] = value
        else
          @log.error "bad value", prop, value
      else if oneprops_obj.indexOf(prop) >= 0 # объекты
        if Object::toString.apply(value) is "[object Object]"
          layer[prop] = value
        else
          @log.error "bad value", prop, value
      else if oneprops2.indexOf(prop) >= 0
        layer["_" + prop] = value
        value = @functions[value] if @functions and (Object::toString.apply(value) is "[object String]") and @functions[value]
        layer[prop] = (cb) =>
          try
            value.call layer, cb
          catch e
            @log.error prop + " " + e
            cb()
      else if prop is "div"
        if Object::toString.apply(value) is "[object String]"
          layer.tag = "#" + value
        else
          @log.error "bad value", prop, value
      else if prop is "label"
        if Object::toString.apply(value) is "[object String]"
          layer[prop] = value
          labels = value.replace(/\s+/g," ").trim().split(' ')
          i = labels.length
          while --i >= 0
            @labels[labels[i]] = [] unless @labels[labels[i]]
            @labels[labels[i]].push layer
        else
          @log.error "bad value", prop, value

    props = ['states', 'tags', 'divs']
    @on "compile", (layer, prop, value) =>
      if props.indexOf(prop) >= 0
        if Object::toString.apply(value) is "[object Object]"

          @layers.push layer if @layers.indexOf(layer) is -1 # создать слой
          layer.childs = [] unless layer.childs
          layer.states = {} if (prop is "states") and not layer.states
          layer.tags = {}  if (prop is "tags" or prop is "divs") and not layer.tags

          for own key of value # бежим по значениям объекта, которые тоже объекты
            if Object::toString.apply(value[key]) is "[object Object]"
              child_layer = {}
              child_layer.parent = layer
              @layers.push child_layer
              layer.childs.push child_layer
              if prop is "states"
                state = key
                layer.states[state] = child_layer
                if (state[0] is "^") or (state.slice(-1) is "$") # если есть спец символы то наследование state не происходит
                  child_layer.state = state
                else
                  child_layer.parent.state = '/' if not child_layer.parent.state
                  child_layer.state = child_layer.parent.state + state + "/"
              else
                if prop is "tags"
                  tag = key
                else
                  tag = "#" + key
                child_layer.tag = tag # тэги не прибавляются как state у childs
                child_layer.state = layer.state # state наследуется как у родителя
                layer.tags[child_layer.tag] = child_layer
              for own prop2 of value[key]
                @emit "compile", child_layer, prop2, value[key][prop2]
            else
              @log.error "bad value", prop, value[key]
        else
          @log.error "bad value", prop, value

    @external = (layer, cb) =>
      # Правило: Слои здесь точно скрыты
      if layer.ext and not layer._ext
        @log.debug "new external", layer.ext
        @load layer.ext, (err, data) ->
          layer._ext = {}
          unless err
            try
              try
                layer._ext = eval_("(" + data + ")")
              catch e
                layer._ext = eval_(data)
              layers = @layers
              @compile layer._ext, ->
                layer._ext = @layers
                @layers = layers
                # обновить конфиг
                # TODO: это сделать рекурсивно и все вынести в функции
                if layer.config and layer._ext[0].config
                  for own param of layer._ext[0].config
                    layer.config[param] = layer._ext[0].config[param] unless layer.config[param]
                # переопределить слой
                for own prop of layer._ext[0]
                  layer[prop] = layer._ext[0][prop] unless layer[prop]
                # обновить события
                eList = ["onload", "oncheck", "onshow"]
                i = 0
                len = eList.length
                while i < len
                  ((prop) ->
                    value = layer["_" + prop]
                    if value
                      layer[prop] = (cb) ->
                        try
                          value.call layer, cb
                        catch e
                          @log.error prop + " " + e
                          cb()
                  ) eList[i]
                  i++
                # добавить новые
                len = layer._ext.length
                if len
                  num = @layers.indexOf(layer)
                  i = 1
                  while i < len
                    num++
                    @layers.splice num, 0, layer._ext[i]
                    i++
                cb()
            catch e
              @log.error "wrong ext", layer.ext
              cb()
          else
            cb()
      else
        cb()


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

    setHtml = (layer, cb) =>
      layer.onload => # все данные загружены
        if typeof (layer.tplString) is "string"
          @tplParser layer.tplString, layer, (htmlString) ->
            layer.htmlString = htmlString
            cb()
        else
          @log.error "Wrong tplString " + layer.tpl
          layer.htmlString = " "
          cb()
        
    setTemplate = (layer, cb) =>
      unless layer.tplString
        layer.tplString = " "
        if layer.tpl
          @load layer.tpl, (err, txt) =>
            layer.tplString = txt unless err
            cb()
        else
          cb()
      else
        cb()

    setData = (layer, cb) =>
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


    ###
* Проверяет слой, может ли он быть вставлен, возвращает в очередь при неудаче.
*
* Если **layer.status** равен shows и есть такой node, то это этот самый слой. Если слой будет замещен где то в одном из тэгов, то он скрывается во всех. Слой сначала скрывается, а потом на его пустое место вставляется другой.
*
* @param {Object} layer Описание слоя.
    ###
    test = (layer) =>
      if layer.parent and not layer.parent.show
        return 'no parent'
      if @circle.occupied[layer.tag]
        return 'busy tag ' + layer.tag
      layer.node = @$(layer.tag) unless layer.node
      if not layer.node or layer.node.length is 0 # вставляется ли слой
        return 'not inserted'
      if not layer.show
        if busyTags(layer) # нет ли в текущем тэге каких-либо занятых тэгов, этот слой должен быть скрыт
          return 4
      if not stateOk(layer) # подходит ли state
        return 'state mismatch'
      return true

    ###x>###
    @checkLayer = test
    ###<x###

    busyTags = (layer) =>
      layer.node = @$(layer.tag) unless layer.node
      for own tag of @circle.occupied
        if layer.node and layer.node.length and layer.node.find(@circle.occupied[tag])
          return true
      return false

    # state устраивает или нет
    stateOk = (layer) =>
      if layer.reg_state and layer.reg_state[0]
        if @circle.state is layer.reg_state[0]
          return true
      return false

    # скрыть слой и всех его потомков
    _hide = (layer) =>
      layer.status = "_hide"
      if layer.childs # скрыть детей
        i = layer.childs.length
        while --i >= 0
          _hide layer.childs[i]
      # скрыть слой
      @$(layer.tag).innerHTML = ''
      layer.show = false # отметка что слой скрыт
      layer.status = 'hidden'

    hide = (layer) =>
      layer.status = "hide"
      @once 'circle', => # пропустить круг
        _hide layer
        @emit 'circle'

    # Скрыть слои которые замещает переданный слой, убрать их из цикла
    # Правила:
    # переданный слой обязательно будет показан, и не может быть скрыт в этом infra.check
    # в показанном слое не могут быть дочерние слои
    displace = (layer) =>
      layer.status = "displace"
      i = @circle.length
      while --i >= 0
        if @layers[i].show
          if layer.tag is @layers[i].tag
          else if @$(layer.tag) is @$(@layers[i].tag)
            _hide @layers[i]
          else
            find = @$(layer.tag).find(@layers[i].tag)
            if find and find.length
              _hide @layers[i]
          
    # Скрыть и убрать из цикла те слои, которые будут замещены вставленным слоем
    apply = (layer) =>
      layer.status = "apply"
      @circle.occupied[layer.tag] = layer # Изменить условия проверок для других слоев, занимаем тэги
      displace(layer) unless layer.show # этот слой может быть показан с прошлого @check
      @once 'circle', => # пропустить круг
        if @circle.interrupt
          @log.debug "check interrupt 1"
          @emit 'circle'
        else
          @circle.loading++
          @external layer, =>
            layer.oncheck => # сработает у всех слоев которые должны быть показаны
              layer.status = "insert"
              if layer.show
                @circle.loading--
                @emit 'circle'
              else
                @insert layer, (err) =>
                  if err
                    @log.error "layer can not be inserted", layer.id
                    layer.status = "wrong insert"
                    @circle.loading--
                    @emit 'circle'
                  else
                    if @circle.interrupt
                      @log.debug "check interrupt 2"
                      @circle.loading--
                      @emit 'circle'
                    else
                      @$(layer.tag).innerHTML = layer.htmlString
                      layer.show = true
                      layer.onshow =>
                        @circle.loading--
                        @emit 'circle'

    @on 'layer', (layer, num) => # Пойти на проверки, забить результаты, запустить изменения (загрузка, показ, скрытие)
      layer.check = test(layer)
      if layer.check is true # показанные слои заходят, так как для них тоже нужно забить места
        apply(layer) # Вставиться, запустить обработчики
      else if layer.show # Если слой виден, и не прошел проверки, но ни один другой слой его не скрыл, слой все равно должен скрыться
        hide(layer)


    # по умолчанию ссылки включаются
    if not @options.links? then @options.links = false
    # Расширение позволяющие сборке работать со ссылками
    ignore_protocols = ["^javascript:", "^mailto:", "^http://", "^https://", "^ftp://", "^//"]
    ###
* Возвращает отформатированный вариант состояния.
*
* Убираеются двойные слэши, добавляются слэш в начале и в конце.
*
* @param {String} pathname Строка с именем состояния.
* @return {String} Отформатированный вариант состояния.
    ###
    @getState = (pathname) =>
      pathname = "/"  unless pathname
      now_location = decodeURIComponent(location.pathname)
      pathname = decodeURIComponent(pathname)
      pathname = pathname.replace(/#.+/, "") # убрать location.hash
      pathname = now_location + "/" + pathname unless pathname[0] is "/"
      #if (pathname.slice(-1) != '/') pathname = pathname + '/'; // добавить последний слэш если его нет
      pathname = pathname.replace(/\/{2,}/g, "/") # заменять двойные слэши
      pathname
    # Поиск родительской ссылки
    parentA = (targ) =>
      if targ.nodeName is "A"
        targ
      else
        if (not targ.parentNode) or (targ.parentNode is "HTML")
          false
        else
          parentA targ.parentNode
    # Обработчик для ссылок
    handler = (e) =>
      e = e or window.event
      #e.stopPropagation ? e.stopPropagation() : (e.cancelBubble=true);
      if not e.metaKey and not e.shiftKey and not e.altKey and not e.ctrlKey
        targ = e.target or e.srcElement
        targ = parentA(targ)
        if targ
          href = targ.getAttribute("href")
          ignore = false
          if href
            unless targ.getAttribute("target")
              i = ignore_protocols.length
              while --i >= 0
                ignore = true  if RegExp(ignore_protocols[i], "gim").test(href)
              unless ignore
                try
                  (if e.preventDefault then e.preventDefault() else (e.returnValue = false))
                  @state = @getState(href)
                  @check (cb) =>
                    @hash = targ.hash
                    cb()
                #var x = window.scrollY; var y = window.scrollX;
                catch e
                  window.location = href
    # Подмена всех ссылок и осуществление переходов по страницам.
    setHrefs = =>
      a = @$("a")
      i = a.length
      while --i >= 0
        a[i].onclick = handler
    if @options.links
      setHrefs()
      @on "start", =>
        window.scrollTo 0, 0 unless @noscroll
        @noscroll = false
      @on "end", => # Слои обработались
        setHrefs()


    if not @options.address_bar? then @options.address_bar = false
    # Включает управление адресной строкой
    if @options.address_bar
      @state = @getState(location.pathname)
      @log.debug "setting onpopstate event for back and forward buttons"
      setTimeout (=>
        window.onpopstate = (e) =>
          # кнопки вперед и назад и изменение хэштэга
          @log.debug "onpopstate"
          unless @hash
            now_state = @getState(location.pathname)
            @state = now_state
            @check (cb) =>
              @hash = location.hash
              cb()
      ), 1000 # chrome bug
      now_state = undefined
      # менять location.state в начале check
      @on "start", =>
        # изменение адресной строки
        now_state = @getState(location.pathname)
        unless @state is now_state # изменилась
          @log.debug "push state " + @state + " replace hash " + @hash
          history.pushState null, null, @state
      # менять location.hash в конце check
      @on "end", => # Слои обработались
        unless @state is now_state
          location.replace @hash  if @hash
        else # очистить адрес от хэша
          @log.debug "replace state " + @state + " push hash " + @hash
          history.replaceState null, null, @state
          location.href = @hash if @hash
        @hash = ""


    if not @options.cache? then @options.cache = false
    # Загружает кэш, вставленный на странице сервером.

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

    # Вспомогательные средства для работы со слоями

    # * Перепарсить слой при следующем чеке.
    # *
    # * @param {Object} layer Слой, который будет перепарсен.
    #
    @reparseLayer = (layer) =>
      layer.show = false
      # если есть данные для загрузки, убрать данные сохраненные у слоя
      layer.data = false  if layer.json
      # если есть шаблон для загрузки, убрать текст сохраненный у слоя
      if layer.tpl
        layer.tplString = ""
        layer.htmlString = ""
      else layer.htmlString = ""  if layer.tplString
      # если есть наследники, то скрыть их и показать заново
      if layer.childs
        i = layer.childs.length
        while --i >= 0
          #@reparseLayer(layer.childs[l]);
          layer.childs[i].show = false
    
    #
    # * Перепарсить все слои.
    # *
    # * @return {Undefined}
    #
    @reparseAll = =>
      i = @layers.length
      while --i >= 0
        @reparseLayer @layers[i]

    #!
    #		var externals = 0;
    #		var waitExternals = function(cb) {
    #			if (externals) {
    #				setTimeout(function() {
    #					waitExternals(cb)
    #				}, 100);
    #			} else cb();
    #		}
    #
    #		@externalLayer = function(path) {
    #			externals++;
    #			var layer = {};
    #			@load(path + 'layer.js', function(err, ans) {
    #				externals--;
    #				eval(ans);
    #			});
    #			return layer;
    #		}
    #		// Переопределим compile, для загрузки externals
    #		var compile = @compile;
    #		@compile = function(index, cb) {
    #			waitExternals(function() {
    #				compile(index, cb);
    #			});
    #		}
    #
    _checkExists = (state, cb) =>
      exist = undefined
      i = undefined
      i = @layers.length
      while --i >= 0
        exist = new RegExp("^" + @layers[i].state + "$").test(state)
        #console.log(state, @layers[i].state);
        break  if exist
      cb exist
    
    #
    # * Проверяет, существуют ли check при переданном состоянии.
    # *
    # * @param {String} state Проверяемое состояние.
    # * @param {Function} cb Callback-функция, один агрумент результат проверки.
    #
    @checkExists = (state, cb) =>
      unless @layers.length
        @compile @index, =>
          _checkExists state, cb
      else
        _checkExists state, cb

    #
    # * Заменяет шаблонные данные в параметрах слоя.
    # * oncheck-функция.
    # *
    # * @param {Function} cb Callback-функция.
    # * @param {Object} layer, слой если не передан, то будет считаться значением в this.
    #
    @oncheckTplOptions = (cb, layer) =>
      layer = this  unless layer
      counter = 2
      _cb = =>
        cb()  if --counter is 0
      @parsetpl layer.tpl, layer, (data) =>
        layer.tpl = data
        _cb()
      @parsetpl layer.json, layer, (data) =>
        layer.json = data
        _cb()

    if not @options.title? then @options.title = true
    ###
    @set.head = (headObj) =>
      updateMeta = (metatags, attr, head) =>
        update = false
        cnt = undefined
        cnt = 0
        while cnt < metatags.length
          name = metatags[cnt].getAttribute("name")
          if name
            name = name.toLowerCase()
            if name is attr
              update = true
              metatags[cnt].setAttribute "content", @meta[attr]
          cnt++
        unless update # создаем новый
          meta = document.createElement("meta")
          meta.setAttribute "name", attr
          meta.setAttribute "content", @meta[attr]
          head.appendChild meta

      titleObj = headObj.title
      metaObj = headObj.meta
      not_found = titleObj["404"]
      main = titleObj.main
      sub = titleObj.sub
      @on "start", =>
        @meta = {}
        @meta.keywords = metaObj.keywords
        @meta.description = metaObj.description
        @status_code = 200
        @title = false

      @on "end", =>
        unless @title # если до этого не определился вручную
          if @status_code is 404
            @title = not_found
          else if @state is "/"
            @title = main
          else
            @title = @state.replace(/\/+$/, "").replace(/^\/+/, "").split("/").reverse().join(" / ") + sub
          @last_status_code = @status_code
        unless typeof (window) is "undefined" # на сервере title ставится из @title
          document.title = @title
          
          # установить метатэги
          metatags = document.getElementsByTagName("meta")
          head = document.getElementsByTagName("head")[0]
          @meta.keywords = ""  unless @meta.keywords
          @meta.description = ""  unless @meta.description
          updateMeta metatags, "keywords", head
          updateMeta metatags, "description", head
    ###


    @on "compile", (layer, prop, value) =>
      layer[prop] = value  if prop is "jsontpl"

    @once "start", =>
      i = @layers.length
      while --i >= 0
        @layers[i].json = @parsetpl(@layers[i].jsontpl, @layers[i])  if @layers[i].jsontpl

if not window?
  module.exports = Infra
else
  window.Infra = Infra
