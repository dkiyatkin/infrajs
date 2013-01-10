`/*
 * Переопределение на серверный загрузчик
 * Путь считывается с помощью web-сервера, проксируя основной запрос
 */`

path = require 'path'
url = require 'url'
request = require 'request'

load = (file, req, callback) ->
  path_url = url.parse(encodeURI(file), true)
  path_url.href = path.normalize path_url.href
  unless path_url.host
    #path_url.href = path.join(encodeURI(state), path_url.href) unless path_url.href[0] is "/"
    path_url.href = "http://" + req.headers.host + path_url.href
  delete (req.headers["accept-encoding"]) # TODO
  #console.log path_url.href
  request
    headers: req.headers
    url: path_url.href
    timeout: 30000
  , (error, response, body) ->
    if not error and response.statusCode is 200
      callback null, body
    else
      console.error "load error", error, (if response then response.statusCode else ""), file
      callback null, ""

module.exports = load
