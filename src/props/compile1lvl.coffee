###x>###
if not window?
  Infra = require '../../src/props/check.coffee'
else
  Infra = window.Infra
###<x###

###x>###
class Infra extends Infra
  constructor: (options) ->
    super
    ###<x###
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

###x>###
if not window?
  module.exports = Infra
else
  window.Infra = Infra
###<x###
