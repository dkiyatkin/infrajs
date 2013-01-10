###x>###
if not window?
  Infra = require '../../src/props/links.coffee'
else
  Infra = window.Infra
###<x###

###x>###
class Infra extends Infra
  constructor: ->
    super
    ###<x###

    if not @options.address_bar? then @options.address_bar = true
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

###x>###
if not window?
  module.exports = Infra
else
  window.Infra = Infra
###<x###
