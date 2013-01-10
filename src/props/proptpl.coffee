###x>###
if not window?
  Infra = require '../../src/props/title.coffee'
else
  Infra = window.Infra
###<x###

###x>###
class Infra extends Infra
  constructor: ->
    super
    ###<x###

    @on "compile", (layer, prop, value) =>
      layer[prop] = value  if prop is "jsontpl"

    @once "start", =>
      i = @layers.length
      while --i >= 0
        @layers[i].json = @parsetpl(@layers[i].jsontpl, @layers[i])  if @layers[i].jsontpl

###x>###
if not window?
  module.exports = Infra
else
  window.Infra = Infra
###<x###
