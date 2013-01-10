###x>###
if not window?
  Infra = require '../../src/props/cache.coffee'
else
  Infra = window.Infra
###<x###

###x>###
class Infra extends Infra
  constructor: ->
    super
    ###<x###

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

###x>###
if not window?
  module.exports = Infra
else
  window.Infra = Infra
###<x###
