###x>###
if not window?
  Infra = require '../../src/props/compile2lvl.coffee'
else
  Infra = window.Infra
###<x###

###x>###
class Infra extends Infra
  constructor: ->
    super
    ###<x###
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

###x>###
if not window?
  module.exports = Infra
else
  window.Infra = Infra
###<x###
