###x>###
if not window?
  Infra = require '../../src/props/compile1lvl.coffee'
else
  Infra = window.Infra
###<x###

###x>###
class Infra extends Infra
  constructor: (options) ->
    super
    ###<x###
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

###x>###
if not window?
  module.exports = Infra
else
  window.Infra = Infra
###<x###
