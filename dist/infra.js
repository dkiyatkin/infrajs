
/*! infrajs - v0.0.12 - 2013-01-09
*/


/*
* Объект Infra содержит методы для создания и расширения контроллера слоев.
* Создает новый контроллер **infra**.
*
* Примеры:
*
*   infra = new Infra();
*
* @return {Object} infra Контроллер слоев.
* @receiver Infra
*/


(function() {
  var Infra,
    __slice = [].slice,
    __hasProp = {}.hasOwnProperty;

  Infra = (function() {

    function Infra(options) {
      var apply, busyTags, check_limit, check_queue, check_timeout, createRequestObject, displace, empty, firstCircle, getCache, globalEval, handler, hide, html, ignore_protocols, loader, log, loggers, now_state, oneprops, oneprops2, oneprops_obj, parentA, props, setData, setHrefs, setHtml, setTemplate, setXDR, stateOk, test, _busy, _checkExists, _clearRegCache, _compile, _del_listeners, _hide, _listeners, _loading,
        _this = this;
      this.options = options != null ? options : {};
      this.layers = [];
      /*
      * Предоставляет интерфейс управления отладочными сообщениями.
      *
      * Примеры:
      *
      *   infra.log.error('test error'); // вернет и выведет в консоль 'test error'
      *   infra.log.warning('test warning'); // вернет и выведет в консоль 'test warning'
      *   infra.log.info('test info'); // вернет и выведет в консоль 'test info'
      *   infra.log.logger = 'WARNING'; // выбрать уровень логгера
      *   // доступны 4 соответсвующих уровня: ERROR, WARNING (выбран по умолчанию), INFO и DEBUG
      *   infra.log.debug('test debug'); // ничего не произойдет, потому что логгер задан уровнем выше
      */

      this.log = {
        debug: function() {
          var msg;
          msg = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
          return log(msg, 3);
        },
        info: function() {
          var msg;
          msg = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
          return log(msg, 2);
        },
        warn: function() {
          var msg;
          msg = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
          return log(msg, 1);
        },
        error: function() {
          var msg;
          msg = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
          return log(msg, 0);
        },
        logger: 'WARNING',
        quiet: false
      };
      if (this.options.log) {
        this.log.logger = this.options.log;
      }
      if (this.options.logger) {
        this.log.logger = this.options.logger;
      }
      loggers = ['ERROR', 'WARNING', 'INFO', 'DEBUG'];
      log = function(msg, log_level) {
        if (loggers.indexOf(_this.log.logger) >= log_level) {
          msg = '[' + new Date().toGMTString() + '] ' + loggers[log_level] + ' ' + msg.join(' ');
          if (!_this.log.quiet) {
            if (log_level === 3) {
              console.log(msg);
            }
            if (log_level === 2) {
              console.info(msg);
            }
            if (log_level === 1) {
              console.warn(msg);
            }
            if (log_level === 0) {
              console.error(msg);
            }
          }
          return msg;
        }
      };
      if (this.options.document) {
        this.document = this.options.document;
      } else if (typeof window !== "undefined" && window !== null) {
        this.document = window.document;
      }
      if (this.options.$) {
        this.$ = this.options.$;
      } else {
        /*
              * Возвращает элемент DOM или массив элементов DOM
              * infra.$('sel'), infra.$('sel').find('sel2')
        */

        this.$ = function(selector) {
          var node_parent;
          node_parent = _this.document.querySelectorAll(selector);
          if (node_parent.length === 1) {
            node_parent = node_parent[0];
          }
          node_parent.find = function(selector) {
            var i, ii, node, node_child;
            node_child = [];
            if (node_parent && node_parent.length) {
              i = node_parent.length;
              while (--i >= 0) {
                node = node_parent[i].querySelectorAll(selector);
                ii = node.length;
                while (--ii >= 0) {
                  node_child.push(node[ii]);
                }
              }
            } else {
              node_child = node_parent.querySelectorAll(selector);
            }
            if (node_child.length === 1) {
              node_child = node_child[0];
            }
            return node_child;
          };
          return node_parent;
        };
      }
      _listeners = {};
      _del_listeners = {};
      /*
      * Добавляет обработчик к другим обработчкика на указанное событие.
      *
      * Уже назначенные события
      *  - start
      *  - compile(layer, prop, index[prop])
      *  - layer
      *  - queue
      *  - insert
      *  - external
      *  - end
      *
      * @param {String} name Имя события.
      * @param {Function} callback Функция-обработчик.
      */

      this.on = function(name, callback) {
        if (!_listeners[name]) {
          _listeners[name] = [];
        }
        return _listeners[name].push(callback);
      };
      /*
      * Добавляет обработчик к другим обработчкика на указанное событие, который выполниться только один раз.
      * @param {String} name Имя события.
      * @param {Function} callback Функция-обработчик.
      */

      this.once = function(name, callback) {
        if (!_listeners[name]) {
          _listeners[name] = [];
        }
        if (!_del_listeners[name]) {
          _del_listeners[name] = [];
        }
        _listeners[name].push(callback);
        return _del_listeners[name].push(callback);
      };
      /*
      * Выполнит все обработчики для указанного события.
      * @param {String} name Имя события.
      * @param {} [arg1,&nbsp;arg2,&nbsp;..] Любое количество аргументов для обработчика.
      */

      this.emit = function(name) {
        var args, emitter, i, len, pos, _results;
        if (_listeners[name]) {
          args = Array.prototype.slice.call(arguments).slice(1);
          i = 0;
          len = _listeners[name].length;
          _results = [];
          while (i < len) {
            emitter = _listeners[name][i];
            if (emitter) {
              if (_del_listeners[name]) {
                pos = _del_listeners[name].indexOf(emitter);
                if (pos > -1) {
                  _del_listeners[name].splice(pos, 1);
                  _listeners[name].splice(i, 1);
                  i--;
                }
              }
              emitter.apply(this, args);
            }
            _results.push(i++);
          }
          return _results;
        }
      };
      /*
      * Возвращает массив обработчиков для переданного события.
      * @param {String} name Имя события.
      * @return {Array} Массив обработчиков.
      */

      this.listeners = function(name) {
        if (!_listeners[name]) {
          _listeners[name] = [];
        }
        return _listeners[name];
      };
      /*
       * Удаляет все обработчики для указанного события.
       * @param {String} name Имя события.
      */

      this.removeAllListeners = function(name) {
        _listeners[name] = [];
        return _del_listeners[name] = [];
      };
      if (this.options.document) {
        this.document = this.options.document;
      } else if (typeof window !== "undefined" && window !== null) {
        this.document = window.document;
      }
      if (Object.keys(this.options).indexOf('loader') === -1) {
        this.options.loader = true;
      }
      if (this.options.loader) {
        loader = false;
        html = false;
        this.loader = {
          src: '../images/loader.gif',
          show: function() {
            _this.emit('create_loader');
            html.setAttribute("style", "cursor:progress");
            try {
              loader.setAttribute('src', _this.loader.src);
              html.appendChild(loader);
            } catch (e) {
              _this.log.error('error show loader');
            }
            return true;
          },
          hide: function() {
            try {
              html.removeChild(loader);
            } catch (e) {
              _this.log.error('error hide loader');
            }
            html.setAttribute("style", "cursor:auto");
            return true;
          }
        };
        this.on("start", function() {
          return _this.loader.show();
        });
        this.on("end", function() {
          return _this.loader.hide();
        });
        this.once('create_loader', function() {
          html = _this.$('html');
          loader = _this.document.createElement('img');
          return loader.setAttribute('style', 'z-index:1000;display:block;width:30px;height:30px;left:50%;top:50%;position:fixed;margin-left:-15px;margin-top:-15px;');
        });
      }
      /*
          * Высокоуровневый загрузчик файлов для infrajs с поддержкой кэширования
          * Применение стилей и выполнение скриптов на странице
      */

      /*
          load = (path, options, callback) ->
          load.txt ->
          load.js ->
          load.css ->
          load.json ->
          load.script ->
          load.xml ->
          load.load ->
          # алиасы
          load.exec = @load.js
          load.style = @load.styles = @load.css
      */

      _loading = {};
      /*
      * Загрузчик с использованием кэша
      * Загружает переданный путь, если он уже загружен то будет получен кэшированный ответ.
      *
      * @param {String} path Путь для загрузки.
      * @param {Object} options Параметры для загрузки.
      * @param {Function} callback Callback функция, первый агрумент содержит ошибку запроса, второй строку полученных данных с сервера.
      */

      this.load = function(path, options, cb) {
        if (!cb) {
          cb = options;
        }
        if (!options) {
          options = {};
        }
        if (!options.type) {
          options.type = 'text';
        }
        if (!_this.load.cache.text[path]) {
          if (!_loading[path]) {
            _loading[path] = true;
            return _this.load.load(path, options, function(err, ans) {
              _this.load.cache.text[path] = ans;
              if (err) {
                _this.log.error("error load " + path);
              }
              _loading[path] = false;
              _this.emit("load: " + path, err);
              return cb(err, _this.load.cache.text[path]);
            });
          } else {
            _this.log.debug("add load queue for " + path);
            return _this.once("load: " + path, function(err) {
              return cb(err, _this.load.cache.text[path]);
            });
          }
        } else {
          return cb(null, _this.load.cache.text[path]);
        }
      };
      /*
      * Общий низкоуровневый загрузчик
      * Загружает переданный путь не используя кэширование.
      * @options.type text по-умолчанию. (html, json, jsonp, script, text)
      *
      * @param {String} path Путь для загрузки.
      * @param {Object} options Параметры для загрузки.
      * @param {Function} callback Callback функция, первый агрумент содержит ошибку запроса, второй строку полученных данных с сервера.
      */

      this.load.load = function(path, options, cb) {
        var req;
        if (!cb) {
          cb = options;
        }
        if (!options) {
          options = {};
        }
        if (!options.type) {
          options.type = 'text';
        }
        req = createRequestObject();
        req.open("GET", path, true);
        if (options.type === 'json') {
          req.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
          req.setRequestHeader("Accept", "application/json, text/javascript");
        } else {
          req.setRequestHeader("Content-Type", "text/plain; charset=UTF-8");
        }
        req.onreadystatechange = function() {
          if (req.readyState === 4) {
            if (req.status === 200) {
              return cb(0, req.responseText);
            } else {
              return cb(0, null);
            }
          }
        };
        return req.send(null);
      };
      if (this.options.load) {
        this.load.load = this.options.load;
      }
      /*
      * Загружает переданный путь как JSON-объект, если он уже загружен то будет получен кэшированный ответ.
      *
      * @param {String} path Путь для загрузки.
      * @param {Object} options Параметры для загрузки.
      * @param {Function} callback Callback функция, первый агрумент содержит ошибку запроса, второй JSON-объект полученных данных с сервера.
      */

      this.load.json = function(path, options, cb) {
        if (!cb) {
          cb = options;
        }
        if (!options) {
          options = {};
        }
        options.type = 'json';
        if (!_this.load.cache.data[path]) {
          return _this.load(path, options, function(err, text) {
            try {
              _this.load.cache.data[path] = JSON.parse(text);
            } catch (e) {
              _this.log.error("wrong json data " + path);
            }
            return cb(err, _this.load.cache.data[path]);
          });
        } else {
          return cb(null, _this.load.cache.data[path]);
        }
      };
      /*
      * Загружает переданный путь и выполняет его как javascript-код, если он уже загружен то будет выполнен повторно.
      *
      * После чего выполняет полученные данные как js-код в глобальной области.
      * Синоним функции — **infra.load.exec**.
      *
      * @param {String} path Путь для загрузки.
      * @param {Object} options Параметры для загрузки.
      * @param {Function} callback Callback функция, единственный агрумент содержит ошибку выполнения команды.
      */

      this.load.js = function(path, options, cb) {
        if (!cb) {
          cb = options;
        }
        if (!options) {
          options = {};
        }
        options.type = 'text';
        if (/^http(s){0,1}:\/\//.test(path)) {
          setXDR(path);
          return cb(0);
        } else {
          return _this.load(path, function(err, options, ans) {
            if (err) {
              return cb(err);
            } else {
              try {
                globalEval(ans);
                return cb(0);
              } catch (e) {
                this.log.error("wrong js " + path);
                return cb(e);
              }
            }
          });
        }
      };
      this.load.exec = this.load.js;
      _busy = false;
      /*
       * Выполняет script вставленный в DOM.
       *
       * @param {Object} node DOM-узел тэга script.
      */

      this.load.script = function(node) {
        if (_busy) {
          setTimeout((function() {
            return this.load.script(node);
          }), 1);
          return;
        }
        _busy = true;
        if (node.src) {
          return _this.load.js(node.src, function(err) {
            return _busy = false;
          });
        } else {
          try {
            globalEval(node.innerHTML);
          } catch (e) {
            _this.log.error("Ошибка в скрипте.");
          }
          return _busy = false;
        }
      };
      /*
      * Вставляет стили на страницу и применяет их.
      *
      * @param {String} code Код css для вставки в документ.
      */

      this.load.css = function(code) {
        var head, style;
        if (_this.load.cache.css[code]) {
          return;
        }
        _this.load.cache.css[code] = true;
        style = document.createElement("style");
        style.type = "text/css";
        if (style.styleSheet) {
          style.styleSheet.cssText = code;
        } else {
          style.appendChild(document.createTextNode(code));
        }
        head = _this.$('head');
        return head.insertBefore(style, head.lastChild);
      };
      this.load.style = this.load.styles = this.load.css;
      /*
      * Очищает кэш в зависимости от переданного параметра.
      *
      * @param {String|Object} [clean] Если передан RegExp, то функция удаляет весь кэш, пути которого совпадают с регулярными выражением. Если передана строка, удаляется кэш, пути которого равны строке. Если ничего не передано очищается весь кэш.
      */

      this.load.clearCache = function(clean) {
        if (!(clean != null)) {
          _this.load.cache.data = {};
          return _this.load.cache.text = {};
        } else if (clean.constructor === RegExp) {
          _clearRegCache(clean, _this.load.cache.data);
          return _clearRegCache(clean, _this.load.cache.text);
        } else {
          delete _this.load.cache.data[clean];
          return delete _this.load.cache.text[clean];
        }
      };
      /*
      * Объект хранит кэш-данные.
      *
      * Примеры:
      *		infra.load.cache.css['css-code'] // если true, то указанный css-код применился.
      *		infra.load.cache.text['path/to/file'] // возвращает загруженный текст по указанному пути.
      *		infra.load.cache.data['path/to/file'] // возвращает объект, полученный из текста по указанному пути.
      */

      this.load.cache = {
        css: {},
        data: {},
        text: {}
      };
      _clearRegCache = function(clean, obj) {
        var key, _results;
        _results = [];
        for (key in obj) {
          if (!__hasProp.call(obj, key)) continue;
          if (clean.test(key)) {
            _results.push(delete obj[key]);
          } else {
            _results.push(void 0);
          }
        }
        return _results;
      };
      createRequestObject = function() {
        var XMLHttpRequest2;
        if (typeof XMLHttpRequest !== "undefined" && XMLHttpRequest !== null) {
          return XMLHttpRequest();
        } else {
          XMLHttpRequest2 = function() {
            try {
              return new ActiveXObject("Msxml2.XMLHTTP.6.0");
            } catch (_error) {}
            try {
              return new ActiveXObject("Msxml2.XMLHTTP.3.0");
            } catch (_error) {}
            try {
              return new ActiveXObject("Msxml2.XMLHTTP");
            } catch (_error) {}
            try {
              return new ActiveXObject("Microsoft.XMLHTTP");
            } catch (_error) {}
            throw new Error("This browser does not support XMLHttpRequest.");
          };
          return XMLHttpRequest2();
        }
      };
      globalEval = function(data) {
        var head, script;
        head = _this.$('head');
        script = document.createElement("script");
        script.type = "text/javascript";
        script.text = data;
        head.insertBefore(script, head.firstChild);
        return head.removeChild(script);
      };
      setXDR = function(path) {
        var head, script;
        script = document.createElement("script");
        script.type = "text/javascript";
        head = _this.$('head');
        script.src = path;
        head.insertBefore(script, head.firstChild);
        return head.removeChild(script);
      };
      empty = function(cb) {
        return cb();
      };
      if (this.options.index) {
        this.index = this.options.index;
      }
      check_queue = 1;
      if (this.options.check_queue) {
        check_queue = this.options.check_queue;
      }
      check_limit = 100;
      if (this.options.check_limit) {
        check_limit = this.options.check_limit;
      }
      check_timeout = 10000;
      if (this.options.check_timeout) {
        check_timeout = this.options.check_timeout;
      }
      this.check_status = 'stop';
      this.check_count = 0;
      _compile = function(index) {
        var layer, prop, value, _results;
        layer = {};
        _results = [];
        for (prop in index) {
          if (!__hasProp.call(index, prop)) continue;
          value = index[prop];
          _results.push(_this.emit('compile', layer, prop, value));
        }
        return _results;
      };
      /*
      * Компилирует слои в объект **infra.layers**.
      *
      * Обнуляет существующий **infra.layers**. Запускает событие **compile**.
      *
      * @param {Object} index Объект содержащий описание для слоев.
      * @param {Function} cb Callback-Функция без аргументов.
      */

      this.compile = function(index) {
        var i, layer, _results;
        if (index) {
          _this.index = index;
        }
        _this.layers = [];
        if (_this.index.splice) {
          i = _this.index.length;
          while (--i >= 0) {
            _compile(_this.index[i]);
          }
        } else {
          _compile(_this.index);
        }
        _this.ids = {};
        i = _this.layers.length;
        _results = [];
        while (--i >= 0) {
          layer = _this.layers[i];
          if (!layer.oncheck) {
            layer.oncheck = empty;
          }
          if (!layer.onload) {
            layer.onload = empty;
          }
          if (!layer.onshow) {
            layer.onshow = empty;
          }
          if (!layer.config) {
            layer.config = {};
          }
          if (!layer.state) {
            layer.state = '/';
          }
          if (!layer.id) {
            layer.id = i;
          }
          _this.ids[layer.id] = layer;
          if (!((layer.state[0] === "^") || (layer.state.slice(-1) === "$"))) {
            _results.push(layer.state = '^' + layer.state + '.*$');
          } else {
            _results.push(void 0);
          }
        }
        return _results;
      };
      this.on('start', function() {
        _this.log.debug('first circle, queue: ' + _this.listeners('queue').length);
        return _this.circle = {
          interrupt: false,
          count: 0,
          occupied: {},
          loading: 0,
          state: _this.state,
          limit: check_limit,
          queue: check_queue,
          length: _this.layers.length,
          cb: null,
          timeout: check_timeout,
          time: Date.now()
        };
      });
      this.on('circle', function() {
        var check_count;
        check_count = _this.check_count;
        return setTimeout(function() {
          var i, listeners;
          if ((_this.check_status === 'run') && (check_count === _this.check_count)) {
            i = _this.circle.length;
            while (--i >= 0) {
              if (_this.layers[i].status === 'queue') {
                _this.circle.num = i;
                _this.emit('layer', _this.layers[i], i);
              }
            }
            listeners = _this.listeners('circle');
            if (++_this.circle.count >= _this.circle.limit) {
              _this.log.warn(_this.circle.limit + ' limit');
              listeners = listeners.splice(1, listeners.length);
            }
            if (_this.circle.timeout < (Date.now() - _this.circle.time)) {
              _this.log.warn(_this.circle.timeout + ' timeout');
              listeners = listeners.splice(1, listeners.length);
            }
            if (listeners.length > 1) {
              return _this.emit('circle');
            } else if (!_this.circle.loading) {
              return _this.emit('end');
            }
          }
        }, 1);
      });
      firstCircle = function(cb) {
        var i, re;
        _this.check_status = 'run';
        _this.circle.cb = cb;
        if (_this.circle.state) {
          i = _this.circle.length;
          while (--i >= 0) {
            _this.layers[i].status = 'queue';
            re = new RegExp(_this.layers[i].state, "im");
            _this.layers[i].reg_state = _this.circle.state.match(re);
            _this.layers[i].node = null;
          }
          return _this.emit('circle');
        } else {
          _this.log.warn('no set circle.state');
          return _this.emit('end');
        }
      };
      this.on('end', function() {
        _this.log.debug('end check, circle.count: ' + _this.circle.count + ', check_count: ' + _this.check_count);
        if (typeof _this.circle.cb === 'function') {
          _this.circle.cb(function() {
            return _this.check_status = 'stop1';
          });
        } else {
          _this.check_status = 'stop2';
        }
        return _this.emit('queue');
      });
      /*
      * Запуск контроллера.
      *
      * Как только обрабатывается очередной слой, срабатывает событие layer. Пробежка по слоям происходит в обратном порядке.
      *
      * @param {Function|Boolean} cb Callback-функция или wait-сигнал для блокировки продолжительности чека, если передан true, завершается (начинает работать) только при следующем разе при функции или false.
      */

      this.check = function(cb) {
        var listeners;
        if (_this.check_status === 'run') {
          _this.circle.interrupt = true;
          _this.once('queue', function() {
            return _this.check(cb);
          });
          listeners = _this.listeners('queue');
          listeners.splice(0, listeners.length - _this.circle.queue);
          return _this.log.debug('check queue, listeners ' + listeners.length);
        } else if (_this.check_status === 'pause') {
          if (cb !== true) {
            return firstCircle(cb);
          }
        } else {
          _this.check_count++;
          if (!_this.layers.length) {
            _this.compile();
          }
          if (!_this.layers.length) {
            _this.log.info('empty layers');
          }
          _this.emit('start');
          if (cb !== true) {
            return firstCircle(cb);
          } else {
            return _this.check_status = 'pause';
          }
        }
      };
      oneprops = ["tag", "state", "css", "json", "tpl", "ext", "tplString", "htmlString", "id"];
      oneprops_obj = ["config", "data"];
      oneprops2 = ["oncheck", "onload", "onshow"];
      this.labels = {};
      this.on("compile", function(layer, prop, value) {
        var i, labels, _results;
        if (oneprops.indexOf(prop) >= 0) {
          if (Object.prototype.toString.apply(value) === "[object String]") {
            if (prop === 'tag') {
              if (_this.layers.indexOf(layer) === -1) {
                _this.layers.push(layer);
              }
            }
            return layer[prop] = value;
          } else {
            return _this.log.error("bad value", prop, value);
          }
        } else if (oneprops_obj.indexOf(prop) >= 0) {
          if (Object.prototype.toString.apply(value) === "[object Object]") {
            return layer[prop] = value;
          } else {
            return _this.log.error("bad value", prop, value);
          }
        } else if (oneprops2.indexOf(prop) >= 0) {
          layer["_" + prop] = value;
          if (_this.functions && (Object.prototype.toString.apply(value) === "[object String]") && _this.functions[value]) {
            value = _this.functions[value];
          }
          return layer[prop] = function(cb) {
            try {
              return value.call(layer, cb);
            } catch (e) {
              _this.log.error(prop + " " + e);
              return cb();
            }
          };
        } else if (prop === "div") {
          if (Object.prototype.toString.apply(value) === "[object String]") {
            return layer.tag = "#" + value;
          } else {
            return _this.log.error("bad value", prop, value);
          }
        } else if (prop === "label") {
          if (Object.prototype.toString.apply(value) === "[object String]") {
            layer[prop] = value;
            labels = value.replace(/\s+/g, " ").trim().split(' ');
            i = labels.length;
            _results = [];
            while (--i >= 0) {
              if (!_this.labels[labels[i]]) {
                _this.labels[labels[i]] = [];
              }
              _results.push(_this.labels[labels[i]].push(layer));
            }
            return _results;
          } else {
            return _this.log.error("bad value", prop, value);
          }
        }
      });
      props = ['states', 'tags', 'divs'];
      this.on("compile", function(layer, prop, value) {
        var child_layer, key, prop2, state, tag, _results;
        if (props.indexOf(prop) >= 0) {
          if (Object.prototype.toString.apply(value) === "[object Object]") {
            if (_this.layers.indexOf(layer) === -1) {
              _this.layers.push(layer);
            }
            if (!layer.childs) {
              layer.childs = [];
            }
            if ((prop === "states") && !layer.states) {
              layer.states = {};
            }
            if ((prop === "tags" || prop === "divs") && !layer.tags) {
              layer.tags = {};
            }
            _results = [];
            for (key in value) {
              if (!__hasProp.call(value, key)) continue;
              if (Object.prototype.toString.apply(value[key]) === "[object Object]") {
                child_layer = {};
                child_layer.parent = layer;
                _this.layers.push(child_layer);
                layer.childs.push(child_layer);
                if (prop === "states") {
                  state = key;
                  layer.states[state] = child_layer;
                  if ((state[0] === "^") || (state.slice(-1) === "$")) {
                    child_layer.state = state;
                  } else {
                    if (!child_layer.parent.state) {
                      child_layer.parent.state = '/';
                    }
                    child_layer.state = child_layer.parent.state + state + "/";
                  }
                } else {
                  if (prop === "tags") {
                    tag = key;
                  } else {
                    tag = "#" + key;
                  }
                  child_layer.tag = tag;
                  child_layer.state = layer.state;
                  layer.tags[child_layer.tag] = child_layer;
                }
                _results.push((function() {
                  var _ref, _results1;
                  _ref = value[key];
                  _results1 = [];
                  for (prop2 in _ref) {
                    if (!__hasProp.call(_ref, prop2)) continue;
                    _results1.push(this.emit("compile", child_layer, prop2, value[key][prop2]));
                  }
                  return _results1;
                }).call(_this));
              } else {
                _results.push(_this.log.error("bad value", prop, value[key]));
              }
            }
            return _results;
          } else {
            return _this.log.error("bad value", prop, value);
          }
        }
      });
      this.external = function(layer, cb) {
        if (layer.ext && !layer._ext) {
          _this.log.debug("new external", layer.ext);
          return _this.load(layer.ext, function(err, data) {
            var layers;
            layer._ext = {};
            if (!err) {
              try {
                try {
                  layer._ext = eval_("(" + data + ")");
                } catch (e) {
                  layer._ext = eval_(data);
                }
                layers = this.layers;
                return this.compile(layer._ext, function() {
                  var eList, i, len, num, param, prop, _ref, _ref1;
                  layer._ext = this.layers;
                  this.layers = layers;
                  if (layer.config && layer._ext[0].config) {
                    _ref = layer._ext[0].config;
                    for (param in _ref) {
                      if (!__hasProp.call(_ref, param)) continue;
                      if (!layer.config[param]) {
                        layer.config[param] = layer._ext[0].config[param];
                      }
                    }
                  }
                  _ref1 = layer._ext[0];
                  for (prop in _ref1) {
                    if (!__hasProp.call(_ref1, prop)) continue;
                    if (!layer[prop]) {
                      layer[prop] = layer._ext[0][prop];
                    }
                  }
                  eList = ["onload", "oncheck", "onshow"];
                  i = 0;
                  len = eList.length;
                  while (i < len) {
                    (function(prop) {
                      var value;
                      value = layer["_" + prop];
                      if (value) {
                        return layer[prop] = function(cb) {
                          try {
                            return value.call(layer, cb);
                          } catch (e) {
                            this.log.error(prop + " " + e);
                            return cb();
                          }
                        };
                      }
                    })(eList[i]);
                    i++;
                  }
                  len = layer._ext.length;
                  if (len) {
                    num = this.layers.indexOf(layer);
                    i = 1;
                    while (i < len) {
                      num++;
                      this.layers.splice(num, 0, layer._ext[i]);
                      i++;
                    }
                  }
                  return cb();
                });
              } catch (e) {
                this.log.error("wrong ext", layer.ext);
                return cb();
              }
            } else {
              return cb();
            }
          });
        } else {
          return cb();
        }
      };
      /*
          * Разбирает строку шаблона.
          *
          * @param {String} html Строка шаблона.
          * @param {Object} ctx Контекст для шаблона.
          * @param {Object} callback Callback-функция, один аргумент разобранный шаблон.
      */

      this.tplParser = function(html, ctx, callback) {
        var res;
        res = 'tplParser is not set';
        if (callback) {
          return callback(res);
        } else {
          return res;
        }
      };
      if (this.options.tplParser) {
        this.tplParser = this.options.tplParser;
      }
      setHtml = function(layer, cb) {
        return layer.onload(function() {
          if (typeof layer.tplString === "string") {
            return _this.tplParser(layer.tplString, layer, function(htmlString) {
              layer.htmlString = htmlString;
              return cb();
            });
          } else {
            _this.log.error("Wrong tplString " + layer.tpl);
            layer.htmlString = " ";
            return cb();
          }
        });
      };
      setTemplate = function(layer, cb) {
        if (!layer.tplString) {
          layer.tplString = " ";
          if (layer.tpl) {
            return _this.load(layer.tpl, function(err, txt) {
              if (!err) {
                layer.tplString = txt;
              }
              return cb();
            });
          } else {
            return cb();
          }
        } else {
          return cb();
        }
      };
      setData = function(layer, cb) {
        if (layer.data) {
          return cb();
        } else {
          layer.data = {};
          if (layer.json) {
            return _this.load.json(layer.json, function(err, data) {
              if (!err) {
                layer.data = data;
              }
              return cb();
            });
          } else {
            return cb();
          }
        }
      };
      this.insert = function(layer, cb) {
        var counter, parse;
        counter = 2;
        parse = function() {
          if (--counter === 0) {
            return setHtml(layer, function() {
              return cb();
            });
          }
        };
        if (layer.htmlString) {
          return cb();
        } else if (layer.tpl || layer.tplString) {
          setTemplate(layer, function() {
            return parse();
          });
          return setData(layer, function() {
            return parse();
          });
        } else {
          return cb(1);
        }
      };
      /*
      * Проверяет слой, может ли он быть вставлен, возвращает в очередь при неудаче.
      *
      * Если **layer.status** равен shows и есть такой node, то это этот самый слой. Если слой будет замещен где то в одном из тэгов, то он скрывается во всех. Слой сначала скрывается, а потом на его пустое место вставляется другой.
      *
      * @param {Object} layer Описание слоя.
      */

      test = function(layer) {
        if (layer.parent && !layer.parent.show) {
          return 'no parent';
        }
        if (_this.circle.occupied[layer.tag]) {
          return 'busy tag ' + layer.tag;
        }
        if (!layer.node) {
          layer.node = _this.$(layer.tag);
        }
        if (!layer.node || layer.node.length === 0) {
          return 'not inserted';
        }
        if (!layer.show) {
          if (busyTags(layer)) {
            return 4;
          }
        }
        if (!stateOk(layer)) {
          return 'state mismatch';
        }
        return true;
      };
      /*x>
      */

      this.checkLayer = test;
      /*<x
      */

      busyTags = function(layer) {
        var tag, _ref;
        if (!layer.node) {
          layer.node = _this.$(layer.tag);
        }
        _ref = _this.circle.occupied;
        for (tag in _ref) {
          if (!__hasProp.call(_ref, tag)) continue;
          if (layer.node && layer.node.length && layer.node.find(_this.circle.occupied[tag])) {
            return true;
          }
        }
        return false;
      };
      stateOk = function(layer) {
        if (layer.reg_state && layer.reg_state[0]) {
          if (_this.circle.state === layer.reg_state[0]) {
            return true;
          }
        }
        return false;
      };
      _hide = function(layer) {
        var i;
        layer.status = "_hide";
        if (layer.childs) {
          i = layer.childs.length;
          while (--i >= 0) {
            _hide(layer.childs[i]);
          }
        }
        _this.$(layer.tag).innerHTML = '';
        layer.show = false;
        return layer.status = 'hidden';
      };
      hide = function(layer) {
        layer.status = "hide";
        return _this.once('circle', function() {
          _hide(layer);
          return _this.emit('circle');
        });
      };
      displace = function(layer) {
        var find, i, _results;
        layer.status = "displace";
        i = _this.circle.length;
        _results = [];
        while (--i >= 0) {
          if (_this.layers[i].show) {
            if (layer.tag === _this.layers[i].tag) {

            } else if (_this.$(layer.tag) === _this.$(_this.layers[i].tag)) {
              _results.push(_hide(_this.layers[i]));
            } else {
              find = _this.$(layer.tag).find(_this.layers[i].tag);
              if (find && find.length) {
                _results.push(_hide(_this.layers[i]));
              } else {
                _results.push(void 0);
              }
            }
          } else {
            _results.push(void 0);
          }
        }
        return _results;
      };
      apply = function(layer) {
        layer.status = "apply";
        _this.circle.occupied[layer.tag] = layer;
        if (!layer.show) {
          displace(layer);
        }
        return _this.once('circle', function() {
          if (_this.circle.interrupt) {
            _this.log.debug("check interrupt 1");
            return _this.emit('circle');
          } else {
            _this.circle.loading++;
            return _this.external(layer, function() {
              return layer.oncheck(function() {
                layer.status = "insert";
                if (layer.show) {
                  _this.circle.loading--;
                  return _this.emit('circle');
                } else {
                  return _this.insert(layer, function(err) {
                    if (err) {
                      _this.log.error("layer can not be inserted", layer.id);
                      layer.status = "wrong insert";
                      _this.circle.loading--;
                      return _this.emit('circle');
                    } else {
                      if (_this.circle.interrupt) {
                        _this.log.debug("check interrupt 2");
                        _this.circle.loading--;
                        return _this.emit('circle');
                      } else {
                        _this.$(layer.tag).innerHTML = layer.htmlString;
                        layer.show = true;
                        return layer.onshow(function() {
                          _this.circle.loading--;
                          return _this.emit('circle');
                        });
                      }
                    }
                  });
                }
              });
            });
          }
        });
      };
      this.on('layer', function(layer, num) {
        layer.check = test(layer);
        if (layer.check === true) {
          return apply(layer);
        } else if (layer.show) {
          return hide(layer);
        }
      });
      if (!(this.options.links != null)) {
        this.options.links = false;
      }
      ignore_protocols = ["^javascript:", "^mailto:", "^http://", "^https://", "^ftp://", "^//"];
      /*
      * Возвращает отформатированный вариант состояния.
      *
      * Убираеются двойные слэши, добавляются слэш в начале и в конце.
      *
      * @param {String} pathname Строка с именем состояния.
      * @return {String} Отформатированный вариант состояния.
      */

      this.getState = function(pathname) {
        var now_location;
        if (!pathname) {
          pathname = "/";
        }
        now_location = decodeURIComponent(location.pathname);
        pathname = decodeURIComponent(pathname);
        pathname = pathname.replace(/#.+/, "");
        if (pathname[0] !== "/") {
          pathname = now_location + "/" + pathname;
        }
        pathname = pathname.replace(/\/{2,}/g, "/");
        return pathname;
      };
      parentA = function(targ) {
        if (targ.nodeName === "A") {
          return targ;
        } else {
          if ((!targ.parentNode) || (targ.parentNode === "HTML")) {
            return false;
          } else {
            return parentA(targ.parentNode);
          }
        }
      };
      handler = function(e) {
        var href, i, ignore, targ;
        e = e || window.event;
        if (!e.metaKey && !e.shiftKey && !e.altKey && !e.ctrlKey) {
          targ = e.target || e.srcElement;
          targ = parentA(targ);
          if (targ) {
            href = targ.getAttribute("href");
            ignore = false;
            if (href) {
              if (!targ.getAttribute("target")) {
                i = ignore_protocols.length;
                while (--i >= 0) {
                  if (RegExp(ignore_protocols[i], "gim").test(href)) {
                    ignore = true;
                  }
                }
                if (!ignore) {
                  try {
                    if (e.preventDefault) {
                      e.preventDefault();
                    } else {
                      e.returnValue = false;
                    }
                    _this.state = _this.getState(href);
                    return _this.check(function(cb) {
                      _this.hash = targ.hash;
                      return cb();
                    });
                  } catch (e) {
                    return window.location = href;
                  }
                }
              }
            }
          }
        }
      };
      setHrefs = function() {
        var a, i, _results;
        a = _this.$("a");
        i = a.length;
        _results = [];
        while (--i >= 0) {
          _results.push(a[i].onclick = handler);
        }
        return _results;
      };
      if (this.options.links) {
        setHrefs();
        this.on("start", function() {
          if (!_this.noscroll) {
            window.scrollTo(0, 0);
          }
          return _this.noscroll = false;
        });
        this.on("end", function() {
          return setHrefs();
        });
      }
      if (!(this.options.address_bar != null)) {
        this.options.address_bar = false;
      }
      if (this.options.address_bar) {
        this.state = this.getState(location.pathname);
        this.log.debug("setting onpopstate event for back and forward buttons");
        setTimeout((function() {
          return window.onpopstate = function(e) {
            var now_state;
            _this.log.debug("onpopstate");
            if (!_this.hash) {
              now_state = _this.getState(location.pathname);
              _this.state = now_state;
              return _this.check(function(cb) {
                _this.hash = location.hash;
                return cb();
              });
            }
          };
        }), 1000);
        now_state = void 0;
        this.on("start", function() {
          now_state = _this.getState(location.pathname);
          if (_this.state !== now_state) {
            _this.log.debug("push state " + _this.state + " replace hash " + _this.hash);
            return history.pushState(null, null, _this.state);
          }
        });
        this.on("end", function() {
          if (_this.state !== now_state) {
            if (_this.hash) {
              location.replace(_this.hash);
            }
          } else {
            _this.log.debug("replace state " + _this.state + " push hash " + _this.hash);
            history.replaceState(null, null, _this.state);
            if (_this.hash) {
              location.href = _this.hash;
            }
          }
          return _this.hash = "";
        });
      }
      if (!(this.options.cache != null)) {
        this.options.cache = false;
      }
      getCache = function() {
        var i, layer, _results;
        _this.load.cache = Infra.server.cache;
        i = _this.layers.length;
        _results = [];
        while (--i >= 0) {
          layer = _this.layers[i];
          layer.show = Infra.server.showns[i];
          if (layer.show) {
            if (!layer.data && layer.json && _this.load.cache.data[layer.json]) {
              layer.data = _this.load.cache.data[layer.json];
            }
            if (!layer.htmlString && !layer.tplString && layer.tpl && _this.load.cache.text[layer.tpl]) {
              layer.tplString = _this.load.cache.text[layer.tpl];
            }
            layer.reg_state = _this.state.match(new RegExp("^" + layer.state, "im"));
            try {
              _results.push(layer.onshow.bind(layer)(empty));
            } catch (e) {
              _results.push(_this.log.error("onshow() " + i + " " + e));
            }
          } else {
            _results.push(void 0);
          }
        }
        return _results;
      };
      if (this.options.cache) {
        this.once("start", function() {
          try {
            return getCache();
          } catch (e) {
            return _this.log.warn("fail cache");
          }
        });
      }
      this.reparseLayer = function(layer) {
        var i, _results;
        layer.show = false;
        if (layer.json) {
          layer.data = false;
        }
        if (layer.tpl) {
          layer.tplString = "";
          layer.htmlString = "";
        } else {
          if (layer.tplString) {
            layer.htmlString = "";
          }
        }
        if (layer.childs) {
          i = layer.childs.length;
          _results = [];
          while (--i >= 0) {
            _results.push(layer.childs[i].show = false);
          }
          return _results;
        }
      };
      this.reparseAll = function() {
        var i, _results;
        i = _this.layers.length;
        _results = [];
        while (--i >= 0) {
          _results.push(_this.reparseLayer(_this.layers[i]));
        }
        return _results;
      };
      _checkExists = function(state, cb) {
        var exist, i;
        exist = void 0;
        i = void 0;
        i = _this.layers.length;
        while (--i >= 0) {
          exist = new RegExp("^" + _this.layers[i].state + "$").test(state);
          if (exist) {
            break;
          }
        }
        return cb(exist);
      };
      this.checkExists = function(state, cb) {
        if (!_this.layers.length) {
          return _this.compile(_this.index, function() {
            return _checkExists(state, cb);
          });
        } else {
          return _checkExists(state, cb);
        }
      };
      this.oncheckTplOptions = function(cb, layer) {
        var counter, _cb;
        if (!layer) {
          layer = _this;
        }
        counter = 2;
        _cb = function() {
          if (--counter === 0) {
            return cb();
          }
        };
        _this.parsetpl(layer.tpl, layer, function(data) {
          layer.tpl = data;
          return _cb();
        });
        return _this.parsetpl(layer.json, layer, function(data) {
          layer.json = data;
          return _cb();
        });
      };
      if (!(this.options.title != null)) {
        this.options.title = true;
      }
      /*
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
      */

      this.on("compile", function(layer, prop, value) {
        if (prop === "jsontpl") {
          return layer[prop] = value;
        }
      });
      this.once("start", function() {
        var i, _results;
        i = _this.layers.length;
        _results = [];
        while (--i >= 0) {
          if (_this.layers[i].jsontpl) {
            _results.push(_this.layers[i].json = _this.parsetpl(_this.layers[i].jsontpl, _this.layers[i]));
          } else {
            _results.push(void 0);
          }
        }
        return _results;
      });
    }

    return Infra;

  })();

  if (!(typeof window !== "undefined" && window !== null)) {
    module.exports = Infra;
  } else {
    window.Infra = Infra;
  }

}).call(this);
