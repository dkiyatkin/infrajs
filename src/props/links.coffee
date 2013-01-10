###x>###
if not window?
  Infra = require '../../src/props/layer.coffee'
else
  Infra = window.Infra
###<x###

###x>###
class Infra extends Infra
  constructor: ->
    super
    ###<x###

    # по умолчанию ссылки включаются
    if not @options.links? then @options.links = true
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

###x>###
if not window?
  module.exports = Infra
else
  window.Infra = Infra
###<x###
