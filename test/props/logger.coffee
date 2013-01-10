if not window?
  #Infra = require '../../src/infra.coffee'
  Infra = require '../../src/infra.coffee'
else
  window.exports = {}
  window.logger = exports
  Infra = window.Infra

# Лог
exports.testLogger = (test) ->
  test.expect 2
  infra = new Infra({logger:'DEBUG'})
  infra.log.logger = "WARNING"
  test.equal infra.log.debug("logger", "sdf"), `undefined`, "logger level 1"
  ###
  infra.log.logger = "ERROR"
  infra.log.debug 'debug'
  infra.log.info 'info'
  infra.log.warn 'warn'
  infra.log.error 'error'
  ###
  infra.log.logger = "INFO"
  infra.log.quiet = true
  test.equal infra.log.error("logger", "sdf").split(" ").slice(-3).join(" "), "ERROR logger sdf", "logger level 2"
  test.done()
