###x>###
if not window?
  Infra = require '../../src/props/template.coffee'
else
  Infra = window.Infra
###<x###

###x>###
class Infra extends Infra
  constructor: ->
    super
    ###<x###

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
          @external layer, =>
            layer.oncheck => # сработает у всех слоев которые должны быть показаны
              layer.status = "insert"
              if layer.show
                @emit 'circle'
              else
                @insert layer, (err) =>
                  if err
                    @log.error "layer can not be inserted", layer.id
                    layer.status = "wrong insert"
                    @emit 'circle'
                  else
                    if @circle.interrupt
                      @log.debug "check interrupt 2"
                      @emit 'circle'
                    else
                      @$(layer.tag).innerHTML = layer.htmlString
                      layer.show = true
                      layer.onshow => @emit 'circle'

    @on 'layer', (layer, num) => # Пойти на проверки, забить результаты, запустить изменения (загрузка, показ, скрытие)
      layer.check = test(layer)
      if layer.check is true # показанные слои заходят, так как для них тоже нужно забить места
        apply(layer) # Вставиться, запустить обработчики
      else if layer.show # Если слой виден, и не прошел проверки, но ни один другой слой его не скрыл, слой все равно должен скрыться
        hide(layer)

###x>###
if not window?
  module.exports = Infra
else
  window.Infra = Infra
###<x###
