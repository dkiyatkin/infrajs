###x>###
if not window?
  Infra = require '../../src/props/load.coffee'
else
  Infra = window.Infra
###<x###

###x>###
class Infra extends Infra
  constructor: ->
    super
    ###<x###
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
        #loading: 1 # ассинхронная загрузка
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
          else
            @emit 'end'
      , 1

      ###
      setTimeout =>
        if @circle.loading-- > 0
          i = @circle.length
          while --i >= 0
            if @layers[i].status is 'queue'
              @circle.num = i
              @emit 'layer', @layers[i], i
          if ++@circle.count >= @circle.limit
            @log.warn @circle.limit + ' limit'
            @circle.loading = 0
          now = Date.now()
          if @circle.timeout < (now-@circle.time)
            @log.warn @circle.timeout + ' timeout'
            @circle.loading = 0
          if @circle.loading <= 0
            @emit 'end'
      , 1
      ###

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

###x>###
if not window?
  module.exports = Infra
else
  window.Infra = Infra
###<x###
