###x>###
if not window?
  Infra = require '../../src/props/tools.coffee'
else
  Infra = window.Infra
###<x###

###x>###
class Infra extends Infra
  constructor: ->
    super
    ###<x###

    if not @options.title? then @options.title = true
    ###
    @set.head = (headObj) =>
      updateMeta = (metatags, attr, head) =>
        update = false
        cnt = undefined
        cnt = 0
        while cnt < metatags.length
          name = metatags[cnt].getAttribute("name")
          if name
            name = name.toLowerCase()
            if name is attr
              update = true
              metatags[cnt].setAttribute "content", @meta[attr]
          cnt++
        unless update # создаем новый
          meta = document.createElement("meta")
          meta.setAttribute "name", attr
          meta.setAttribute "content", @meta[attr]
          head.appendChild meta

      titleObj = headObj.title
      metaObj = headObj.meta
      not_found = titleObj["404"]
      main = titleObj.main
      sub = titleObj.sub
      @on "start", =>
        @meta = {}
        @meta.keywords = metaObj.keywords
        @meta.description = metaObj.description
        @status_code = 200
        @title = false

      @on "end", =>
        unless @title # если до этого не определился вручную
          if @status_code is 404
            @title = not_found
          else if @state is "/"
            @title = main
          else
            @title = @state.replace(/\/+$/, "").replace(/^\/+/, "").split("/").reverse().join(" / ") + sub
          @last_status_code = @status_code
        unless typeof (window) is "undefined" # на сервере title ставится из @title
          document.title = @title
          
          # установить метатэги
          metatags = document.getElementsByTagName("meta")
          head = document.getElementsByTagName("head")[0]
          @meta.keywords = ""  unless @meta.keywords
          @meta.description = ""  unless @meta.description
          updateMeta metatags, "keywords", head
          updateMeta metatags, "description", head
    ###

###x>###
if not window?
  module.exports = Infra
else
  window.Infra = Infra
###<x###
