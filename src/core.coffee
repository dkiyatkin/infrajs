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

class Infra extends Infra
  constructor: ->
    super
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

###x>###
if not window?
  module.exports = Infra
else
  window.Infra = Infra
###<x###
