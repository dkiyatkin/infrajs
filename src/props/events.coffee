###x>###
if not window?
  Infra = require '../../src/infra.coffee'
else
  Infra = window.Infra
###<x###

# Простые события

###x>###
class Infra extends Infra
  constructor: ->
    super
    ###<x###

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

###x>###
if not window?
  module.exports = Infra
else
  window.Infra = Infra
###<x###
