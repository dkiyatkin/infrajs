/**
* Объект Infra содержит методы для создания и расширения контроллера слоев.
*/
var Infra = {

/**
* Создает новый контроллер **infra**.
*
* Примеры:
*
*		infra = Infra.init();
*
* @return {Object} infra Контроллер слоев.
* @receiver Infra
*/
	init: function() {
		var supportsHistoryAPI=!!(window.history && history.pushState && history.replaceState); // =true если поддерживается, иначе =false
		//if (window.console && window.console.log) {
			if ([].indexOf) {
				if (supportsHistoryAPI) {
					// Откомпилировать слой, считать статусы
					return {
						layers: [] // готовые слои
					};
				} else {
					throw 'HTML5 History API not supported';
				}
			} else {
				throw 'Array indexOf not supported';
			}
		//}
	},

/**
* Расширяет, переопределяет и дополняет **Infra.init**.
*
* Примеры:
*
*		Infra.ext(function() {
*			this.value = 2;
*		})
*		var infra = Infra.init();
*		console.log(infra.value); // 2
*
* @param {Function} prop Функция добавляющая новые свойства для контроллера.
* @receiver Infra
 */
	ext: function(cb) {
		var init = this.init;
		this.init = function() {
			var infra = init.apply(this, arguments);
			cb.apply(infra, arguments);
			//infra.constructor = arguments.callee;
			return infra;
		};
	}
};
if (typeof module !== "undefined" && module.exports) {
	Infra.init = function() {
		return {
			layers: []
		};
	};
	module.exports = Infra;
}
if (typeof window !== "undefined") {
(function() {
	Infra.ext(function() {
		var infra = this;
/*
 * Объект содержит методы для определения используемого браузера.
 *
 * Примеры:
 *
 *		infra.browser.ie // вернет цифру, номер версии браузера, елси используется Internet Explorer или 0
 *		infra.browser.opera // вернет положительное значение если используется Opera
 *		infra.browser.chrome // true если используется Chrome
 *		infra.browser.webkit // true если используется WebKit
 *		infra.browser.safari // true если используется Safari
 */
		infra.browser = {};
		this.browser.IE = (function () {
			if (window.opera) {
				return false;
			}
			var rv = 0;
			if (navigator.appName == 'Microsoft Internet Explorer') {
				var ua = navigator.userAgent;
				var re = new RegExp("MSIE ([0-9]{1,}[.0-9]{0,})");
				//var re = new RegExp("MSIE ([0-9]{1,}[\.0-9]{0,})");
				if (re.exec(ua) !== null) {
					rv = parseFloat(RegExp.$1);
				}
			}
			return rv;
		})();
		this.browser.opera = /opera/.test(navigator.userAgent) || window.opera;
		this.browser.chrome = /Chrome/.test(navigator.userAgent);
		this.browser.webkit = /WebKit/.test(navigator.userAgent);
		this.browser.safari = (this.browser.webkit && !this.browser.chrome);
	});
})();
}
(function() {
var Logger = function() {
	var loggers = ['ERROR', 'WARNING', 'INFO', 'DEBUG'];
	var _log = function(messages, level, logger, quiet) {
		var i, message;
		for (i in messages) { if (messages.hasOwnProperty(i)) {
			if (!message) {
				message = messages[i];
			} else {
				message = message + ' ' + messages[i];
			}
		}}
		var l;
		for (l = loggers.length; --l >= level;) {
			if (loggers[l] == logger) {
				var msg = '[' + new Date().toGMTString() + '] ' + loggers[level] + ' ' + message;
				if (!quiet) {
					console.log(msg);
				}
				return msg;
			}
		}
	};
	return {
		quiet: false,
		logger: 'WARNING',
		debug: function() {
			return _log(arguments, 3, this.logger, this.quiet);
		},
		info: function() {
			return _log(arguments, 2, this.logger, this.quiet);
		},
		warning: function() {
			return _log(arguments, 1, this.logger, this.quiet);
		},
		error: function() {
			return _log(arguments, 0, this.logger, this.quiet);
		}
	};
};
var logger = function() {
	var infra = this;
/*
 * Предоставляет интерфейс управления отладочными сообщениями.
 *
 * Примеры:
 *
 *		infra.log.error('test error'); // вернет и выведет в консоль 'test error'
 *		infra.log.warning('test warning'); // вернет и выведет в консоль 'test warning'
 *		infra.log.info('test info'); // вернет и выведет в консоль 'test info'
 *		infra.log.logger = 'WARNING'; // выбрать уровень логгера
 *		// доступны 4 соответсвующих уровня: ERROR, WARNING (выбран по умолчанию), INFO и DEBUG
 *		infra.log.debug('test debug'); // ничего не произойдет, потому что логгер задан уровнем выше
 */
	infra.log = Logger();
};
if (typeof Infra !== "undefined") {
	Infra.ext(logger);
}
if (typeof module !== "undefined" && module.exports) {
	module.exports.logger = logger;
}
})();
(function() {
	var events = function() {
		var _listeners = {}; // здесь хранятся обработчики для выполнения
		var _del_listeners = {}; // обработчик находящийся здесь будет удален
		var infra = this;
/*
 * Добавляет обработчик к другим обработчкика на указанное событие.
 *
 * ###Уже назначенные события
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
		infra.on = function(name, callback) {
			if (!_listeners[name]) {
				_listeners[name] = [];
			}
			_listeners[name].push(callback);
		};
/*
 * Добавляет обработчик к другим обработчкика на указанное событие, который выполниться только один раз.
 * @param {String} name Имя события.
 * @param {Function} callback Функция-обработчик.
 */
		infra.once = function(name, callback) { // создает обработчик на один раз
			if (!_listeners[name]) {
				_listeners[name] = [];
			}
			if (!_del_listeners[name]) {
				_del_listeners[name] = [];
			}
			_listeners[name].push(callback);
			_del_listeners[name].push(callback);
		};
/*
 * Выполнит все обработчики для указанного события.
 * @param {String} name Имя события.
 * @param {} [arg1,&nbsp;arg2,&nbsp;..] Любое количество аргументов для обработчика.
 */
		infra.emit = function(name) {
			var args = [];
			var i, len;
			if (_listeners[name]) {
				// собрали аргументы
				for (i = 1, len = arguments.length; i < len; i++) {
					args.push(arguments[i]);
				}
				for (i=0, len = _listeners[name].length; i<len; i++) {
					var emitter = _listeners[name][i];
					if (emitter) { // может он уже удален
						// сперва удалить если нужно
						if (_del_listeners[name]) {
							var pos = _del_listeners[name].indexOf(emitter);
							if (pos > -1) {
								_del_listeners[name].splice(pos,1);
								_listeners[name].splice(i,1);
								i--;
							}
						}
						emitter.apply(this, args);
					}
				}
			}
		};
/*
 * Возвращает массив обработчиков для переданного события.
 * @param {String} name Имя события.
 * @return {Array} Массив обработчиков.
 */
		infra.listeners = function(name) {
			if (!_listeners[name]) {
				_listeners[name] = [];
			}
			return _listeners[name];
		};
/*
 * Удаляет все обработчики для указанного события.
 * @param {String} name Имя события.
 */
		infra.removeAllListeners = function(name) { // удаляет все обработчики из массива обработчиков для указанного события
			_listeners[name] = [];
			_del_listeners[name] = [];
		};
		//this._listeners = _listeners;
	};
	if (typeof Infra !== "undefined") {
		Infra.ext(events);
	}
	if (typeof module !== "undefined" && module.exports) {
		module.exports.events = events;
	}
})();
if (typeof window !== "undefined") {
Infra.ext(function() {
	var infra = this;
	var html = document.getElementsByTagName('html')[0];
	var Loader = function() {
		var loader = document.createElement('img');
		loader.setAttribute('style', 'z-index:1000;display:block;width:30px;height:30px;left:50%;top:50%;position:fixed;margin-left:-15px;margin-top:-15px;');
		return {
			src: '../images/loader.gif',
			show: function() {
				try {
					loader.setAttribute('src', this.src);
					html.appendChild(loader);
					return true;
				} catch (e) {
					infra.log.error('error show loader');
				}
			},
			hide: function() {
				try {
					html.removeChild(loader);
					return true;
				} catch (e) {
					infra.log.error('error hide loader');
				}
			}
		};
	};
/*
 * Объект содержит дополнительные опции сборки.
 */
	if (!infra.set) { infra.set = {}; }
	infra.set.loader = function(src) {
/*
 * Объект позволяющий управлять графическим индикатором загрузки.
 *
 * Примеры:
 *		infra.loader.show() // показать лоадер
 *		infra.loader.hide() // скрыть лоадер
 */
		infra.loader = Loader();
		if (src) { infra.loader.src = src; }
		infra.on('start', function() {
			html.setAttribute('style','cursor:progress');
			infra.loader.show();
		});
		infra.on('end', function() {
			html.setAttribute('style','cursor:auto');
			infra.loader.hide();
		});
	};
});
}
(function() {
	var load = function () {
		var infra = this;
/*
 * Загружает переданный путь как текст, если он уже загружен то будет получен кэшированный ответ.
 *
 * Если задан третий параметр, то ожидает json-ответ сервера, передав соответсвующие заголовки. Если путь находится в кэше, то данные будут возвращаться одни и те же в не зависимости от третьего параметра.
 *
 * @param {String} path Путь для загрузки.
 * @param {Function} callback Callback функция, первый агрумент содержит ошибку запроса, второй строку полученных данных с сервера.
 * @param {Boolean} json Ключ для получения json ответа.
 */
		var _loading = {};
		infra.load = function(path, cb, json) {
			if (!infra.load.cache.text[path]) {
				if (!_loading[path]) {
					_loading[path] = true;
					infra.load._load(path, function(err, ans) {
						infra.load.cache.text[path] = ans;
						if (err) {
							infra.log.error('error load ' + path);
						}
						_loading[path] = false;
						infra.emit('load: ' + path, err);
						cb(err, infra.load.cache.text[path]);
					}, json);
				} else {
					infra.log.debug('add load queue for ' + path);
					infra.once('load: ' + path, function(err) {
						cb(err, infra.load.cache.text[path]);
					});
				}
			} else {
				cb(0, infra.load.cache.text[path]);
			}
		};

/*
 * Загружает переданный путь как текст, не используя кэширование.
 *
 * Если задан третий параметр, то ожидает json-ответ сервера, передав соответсвующие заголовки.
 *
 * @param {String} path Путь для загрузки.
 * @param {Function} callback Callback функция, первый агрумент содержит ошибку запроса, второй строку полученных данных с сервера.
 * @param {Boolean} json Ключ для получения json ответа.
 */
		infra.load._load = function(path, cb, json) {
			if (typeof(path)!=='string') { cb(0, null); }
			function createRequestObject() {
				if (typeof XMLHttpRequest === 'undefined') {
					XMLHttpRequest = function() {
						try { return new ActiveXObject("Msxml2.XMLHTTP.6.0"); }
						catch(e) {}
						try { return new ActiveXObject("Msxml2.XMLHTTP.3.0"); }
						catch(e) {}
						try { return new ActiveXObject("Msxml2.XMLHTTP"); }
						catch(e) {}
						try { return new ActiveXObject("Microsoft.XMLHTTP"); }
						catch(e) {}
						throw new Error("This browser does not support XMLHttpRequest.");
					};
				}
				return new XMLHttpRequest();
			}
			var req = createRequestObject();
			req.open("GET", path, true);
			if (json) {
				req.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
				req.setRequestHeader("Accept", "application/json, text/javascript");
			} else {
				req.setRequestHeader("Content-Type", "text/plain; charset=UTF-8");
			}
			req.onreadystatechange = function() {
				if(req.readyState==4){
					if (req.status == 200) {
						cb(0, req.responseText);
					} else {
						cb(0, null);
					}
				}
			};
			req.send(null);
		};

/*
 * Загружает переданный путь как JSON-объект, если он уже загружен то будет получен кэшированный ответ.
 *
 * @param {String} path Путь для загрузки.
 * @param {Function} callback Callback функция, первый агрумент содержит ошибку запроса, второй JSON-объект полученных данных с сервера.
 */
		infra.load.json = function(path, cb) {
			if (!infra.load.cache.data[path]) {
				infra.load(path, function(err, json) {
					try {
						infra.load.cache.data[path] = JSON.parse(json);
					} catch (e) {
						infra.log.error('wrong json data ' + path);
					}
					cb(err, infra.load.cache.data[path]);
				}, true);
			} else {
				cb(0, infra.load.cache.data[path]);
			}
		};

		// Выполнить js
		var globalEval = function(data) {
			if (!data) { return; }
			// Inspired by code by Andrea Giammarchi
			// http://webreflection.blogspot.com/2007/08/global-scope-evaluation-and-dom.html
			if ((infra.browser.IE===false) && (infra.browser.safari===false)) {
				window.eval(data);
			} else if (!infra.browser) {
				eval(data);
			} else {
				var head = document.getElementsByTagName("head")[0] || document.documentElement, script = document.createElement("script");
				script.type = "text/javascript";
				script.text = data;
				head.insertBefore(script, head.firstChild);
				head.removeChild(script);
			}
		};

		// Реализация кросс-доменного запроса
		var setXDR = function(path) {
			var script = document.createElement('script');
			script.type = 'text/javascript';
			var head = document.getElementsByTagName("head")[0] || document.documentElement;
			script.src = path;
			head.insertBefore(script, head.firstChild);
			head.removeChild(script);
		};

/*
 * Загружает переданный путь и выполняет его как javascript-код, если он уже загружен то будет выполнен повторно.
 *
 * После чего выполняет полученные данные как js-код в глобальной области.
 * Синоним функции — **infra.load.exec**.
 *
 * @param {String} path Путь для загрузки.
 * @param {Function} callback Callback функция, единственный агрумент содержит ошибку выполнения команды.
 */
		infra.load.js = function(path, cb) {
			path = path.replace(/^\/\//, 'http://');
			if (/^http(s){0,1}:\/\//.test(path)) {
				setXDR(path); // <-
				cb(0);
			} else {
				infra.load(path, function(err, ans) {
					if (err) {
						cb(err);
					} else {
						try {
							globalEval(ans); // <-
							cb(0);
						} catch (e) {
							infra.log.error('wrong js ' + path);
							cb(e);
						}
					}
				});
			}
		};
		infra.load.exec = infra.load.js;

		var busy = false;
/*
 * Выполняет script вставленный в DOM.
 *
 * @param {Object} node DOM-узел тэга script.
 */
		infra.load.script = function(node) {
			if (busy) {
				setTimeout(function(){
					infra.load.script(node);
				},1);
				return;
			}
			busy = true;
			if (node.src) {
				infra.load.js(node.src, function(err) {
					busy = false;
				});
			} else {
				try {
					globalEval(node.innerHTML);
				} catch(e) {
					infra.log.error('Ошибка в скрипте.');
				}
				busy = false;
			}
		};

/*
 * Вставляет стили на страницу и применяет их.
 *
 * @param {String} code Код css для вставки в документ.
 */
		infra.load.styles = function(code) {
			if (infra.load.cache.style[code]) { return; } //Почему-то если это убрать после нескольких перепарсиваний стили у слоя слетают..
			infra.load.cache.style[code] = true;
			var style = document.createElement('style'); //создани style с css
			style.type = "text/css";
			if (style.styleSheet) {
				style.styleSheet.cssText = code;
			} else {
				style.appendChild(document.createTextNode(code));
			}
			var head = document.getElementsByTagName("head")[0] || document.documentElement;
			head.insertBefore(style, head.lastChild); //добавили css на страницу
		};

/*
 * Объект хранит кэш-данные.
 *
 * Примеры:
 *		infra.load.cache.style['css-code'] // если true, то указанный css-код применился.
 *		infra.load.cache.text['path/to/file'] // возвращает загруженный текст по указанному пути.
 *		infra.load.cache.data['path/to/file'] // возвращает объект, полученный из текста по указанному пути.
 */
		infra.load.cache = {
			style: {}, data: {}, text: {}
		};

		// Очистка кэша по регекспу
		var _clearRegCache = function(clean, obj) {
			var key;
			for (key in obj) { if (obj.hasOwnProperty(key)) {
				if (clean.test(key)) { delete(obj[key]); }
			}}
		};
/*
 * Очищает кэш в зависимости от переданного параметра.
 *
 * @param {String|Object} [clean] Если передан RegExp, то функция удаляет весь кэш, пути которого совпадают с регулярными выражением. Если передана строка, удаляется кэш, пути которого равны строке. Если ничего не передано очищается весь кэш.
 */
		infra.load.clearCache = function(clean) {
			if (typeof(clean) == 'undefined') {
				infra.load.cache.data = {};
				infra.load.cache.text = {};
			} else if (clean.constructor == RegExp) {
				_clearRegCache(clean, infra.load.cache.data);
				_clearRegCache(clean, infra.load.cache.text);
			} else {
				delete(infra.load.cache.data[clean]);
				delete(infra.load.cache.text[clean]);
			}
		};
	};
	if (typeof Infra !== "undefined") {
		Infra.ext(load);
	}
	if (typeof module !== "undefined" && module.exports) {
		module.exports.load = load;
	}
})();
(function() {
	var setCheck = function() {
		var infra = this;
		var queue = 1;
		var wait = false;
		var _process = false;

/*
 * Компилирует слои в объект **infra.layers**.
 *
 * Обнуляет существующий **infra.layers**. Запускает событие **compile**.
 *
 * @param {Object} index Объект содержащий описание для слоев.
 * @param {Function} cb Callback-Функция без аргументов.
 */
		infra.compile = function(index, cb) {
			infra.layers = []; // очищаем слои
			// index может быть или объектом или массивом объектов
			if (!index.splice) {
				_compileObj(index);
			} else {
				var i; for (i = index.length; --i >= 0;) {
					_compileObj(index[i]);
				}
			}
			cb();
		};
		var _compileObj = function(index) {
			var layer = {}; // самый первый слой
			var prop; for (prop in index) { if (index.hasOwnProperty(prop)) {
				infra.emit('compile', layer, prop, index[prop]);
			}}
		};
		var setCircle = function() {
			infra.log.debug('first circle');
			infra.circle = {
				interrupt: false, // прерывание
				count: 0, // счетчик, сбрасывается в каждом круге
				occupied: {}, // забитые тэги, за определенными слоями
				first: true, // первый раз цикл
				last: false, // последний раз
				loading: 0, // счетчик ассинхронных загрузок
				state: infra.state
			};
		};
		var _compile = function(cb) {
			// Если слоев нету в памяти, то собрать их, используя index
			if (!infra.layers.length) {
				infra.compile(infra.index, function() {
					// установить id слоям
					infra.ids = {};
					var i; for (i = infra.layers.length; --i >= 0;) {
						var layer = infra.layers[i];
						if (!layer.id) {
							layer.id = i;
						}
						infra.ids[layer.id] = layer;
					}
					cb();
				});
			} else {
				cb();
			}
		};
		var _check = function(cb) {
			if (!infra.layers.length) {
				infra.log.info('empty layers');
			}
			setTimeout(function() {
				var i; for (i = infra.layers.length; --i >= 0;) { // если слой пустой, сюда даже не заходит
					infra.circle.num = i;
					infra.emit('layer', infra.layers[i], i, infra.layers.length);
				}
				infra.circle.first = false;
				infra.circle.count++;
				if (infra.circle.count == 5000) {
					infra.log.warning('5000 limit');
					// если callback от обработчиков слоев долго не приходит
					infra.circle.loading = 0;
					infra.circle.last = true;
				}
				if (infra.circle.loading === 0) {
					if (infra.circle.last) {
						infra.circle.last = false;
						infra.emit('end', cb);
						infra.emit('queue');
					} else {
						infra.circle.last = true;
						_check(cb);
					}
				} else {
					infra.circle.last = false;
					_check(cb);
				}
			}, infra.circle.timeout);
		};
/*
 * Запуск контроллера.
 *
 * Как только обрабатывается очередной слой, срабатывает событие layer. Пробежка по слоям происходит в обратном порядке.
 *
 * @param {Function|Boolean} cb Callback-функция или wait-сигнал для блокировки продолжительности чека, если передан true, завершается (начинает работать) только при следующем разе при функции или false.
 * @param {Number} [timeout] Размер паузы между циклами в милисекундах.
*/
		infra.check = function(cb, timeout) {
			_compile(function() {
				if (!_process) {
					_process = true;
					if (cb === true) {
						if (!wait) {
							wait = true;
							infra.emit('start');
						}
						_process = false;
					} else {
						if (!wait) {
							infra.emit('start');
						} else {
							wait = false;
						}
						setCircle();
						infra.circle.timeout = timeout;
						if (!infra.circle.timeout) {
							infra.circle.timeout = 1;
						}
						_check(cb);
					}
				} else { // отпустить загрузки.. запустить чек, позже, насколько позволяет очередь, убирать из очереди старые обработчики
					infra.circle.interrupt = true;
					infra.once('queue', function() {
						infra.check(cb);
					});
					var listeners = infra.listeners('queue');
					listeners.splice(0, listeners.length - queue);
				}
			});
		};
		infra.on('end', function(cb) {
			var queue = function() {
				_process = false;
			};
			if (typeof(cb) === 'function') {
				cb(queue.bind(infra));
			} else {
				queue.call(infra);
			}
		});
	};

	if (typeof Infra !== "undefined") {
		Infra.ext(setCheck);
	}
	if (typeof module !== "undefined" && module.exports) {
		module.exports.setCheck = setCheck;
	}

})();
(function() {
	var empty = function(cb) { cb(); };
	var compile = function() {
		var infra = this;
		infra.labels = {};
		infra.on('compile', function(layer, prop, value) {
			var oneprops = ['tag', 'div', 'state', 'css', 'json', 'tpl', 'label', 'ext', 'config', 'data', 'tplString', 'htmlString', 'id'];
			if (oneprops.indexOf(prop) != -1) {
				if (infra.layers.indexOf(layer) == -1) {
					if (!layer.state) {
						layer.state = '/'; // устанавливаем общий state всем слоям
					}
					if (!layer.config) { layer.config = {}; }
					infra.layers.push(layer);
				}
				if (prop == 'config' || prop == 'data') { // объекты
					if (Object.prototype.toString.apply(value) === '[object Object]') {
						layer[prop] = value;
					} else {
						infra.log.error('bad value', prop, value);
					}
				} else { // строки
					if (Object.prototype.toString.apply(value) === '[object String]') {
						if (prop == 'div') {
							layer.tag = '#'+value;
						} else {
							layer[prop] = value;
						}
						if (prop == 'label') {
							var labels = value.replace(/^\s+|\s+$/g,'').split(' ');
							var i; for (i = labels.length; --i >= 0;) {
								if (!infra.labels[labels[i]]) {
									infra.labels[labels[i]] = [];
								}
								infra.labels[labels[i]].push(layer);
							}
						}
					} else {
						infra.log.error('bad value', prop, value);
					}
				}
			}
		});
		this.on('compile', function(layer, prop, value) {
			if (prop == 'onload' || prop == 'onshow' || prop == 'oncheck') {
				layer['_'+prop] = value;
				if (infra.functions && (Object.prototype.toString.apply(value) === '[object String]') &&
						infra.functions[value]) {
					value = infra.functions[value];
				}
				layer[prop] = function(cb) {
					try {
						value.call(layer, cb);
					} catch (e) {
						infra.log.error(prop + ' ' +e);
						cb();
					}
				};
			}
			if (!layer.oncheck) {
				layer.oncheck = empty; layer._oncheck = false;
			}
			if (!layer.onload) {
				layer.onload = empty; layer._onload = false;
			}
			if (!layer.onshow) {
				layer.onshow = empty; layer._onshow = false;
			}
		});
	};
	if (typeof Infra !== "undefined") {
		Infra.ext(compile);
	}
	if (typeof module !== "undefined" && module.exports) {
		module.exports.compile = compile;
	}
})();
(function() {
	var compile = function() {
		var infra = this;
		infra.on('compile', function(layer, prop, value) {
			if (prop == 'states' || prop == 'tags' || prop == 'divs') {
				if (Object.prototype.toString.apply(value) === '[object Object]') {
					if (infra.layers.indexOf(layer) == -1) { infra.layers.push(layer); }
					if (!layer.childs) { layer.childs = []; }
					if ((prop == 'states') && !layer.states) { layer.states = {}; }
					if ((prop == 'tags' || prop == 'divs') && !layer.tags) { layer.tags = {}; }
					var key;
					for (key in value) { if (value.hasOwnProperty(key)) {
						if (Object.prototype.toString.apply(value[key]) === '[object Object]') {
							var child_layer = {};
							child_layer.parent = layer;
							infra.layers.push(child_layer);
							layer.childs.push(child_layer);
							if (prop == 'states') {
								var state = key;
								if ((state[0] == '^') || (state.slice(-1) == '$')) {
									child_layer.state = state;
								} else {
									child_layer.state = child_layer.parent.state + state + '/';
								}
								layer.states[child_layer.state] = child_layer;
							} else {
								var tag;
								if (prop == 'tags') {
									tag = key;
								} else {
									tag = '#'+key;
								}
								child_layer.tag = tag; // тэги не прибавляются как state у childs
								child_layer.state = layer.state; // state наследуется как у родителя
								layer.tags[child_layer.tag] = child_layer;
							}
							var prop2;
							for (prop2 in value[key]) { if (value[key].hasOwnProperty(prop2)) {
								infra.emit('compile', child_layer, prop2, value[key][prop2]);
							}}
						} else {
							infra.log.error('bad value', prop, value[key]);
						}
					}}
				} else {
					infra.log.error('bad value', prop, value);
				}
			}
		});
	};
	if (typeof Infra !== "undefined") {
		Infra.ext(compile);
	}
	if (typeof module !== "undefined" && module.exports) {
		module.exports.compile = compile;
	}
})();
(function() {
	var checkLayer = function() {
		var infra = this;
		var isPasted = function(layer) {
			layer.node = infra.getLayerNode(layer);
			if (infra.existLayerNode(layer.node)) {
				return true;
			}
		};
		// Проверяет наличие занятых дочерних и родительских тэгов
		var stateOk = function(layer) {
			// state устраивает или нет
			// возможно более первый state сюда не успел попасть, поэтому их нужно даждаться
			// TODO: Сделать по возрастанию совпадения, а не любое следующее
			if (infra.circle.last) { // не в первый круг, и когда кончились загрузки
				if (layer.reg_state && layer.reg_state[0]) {
					if (infra.circle.state == layer.reg_state[0]) { return true; }
					if ((infra.circle.count != 1) && (infra.circle.loading === 0)) {
						//infra.log.debug('match wait state');
						return true;
					}
					infra.circle.last = false; // совпадения по state есть, значит круг будет не последний
				}
			}
		};

/*
 * Проверяет есть ли данный узел в DOM.
 *
 * @param {Object} node DOM узел.
 * @param {Object} [layer] Если задан слой, то проверяет есть ли его узел **child_node** в переданом **node**.
 */
		infra.existLayerNode = function(node, layer) {
			if (!layer) {
				if (node && (node.length !== 0 || node.length === undefined)) { // смотрим есть ли он в DOM
					return true;
				} else {
					return false;
				}
			} else {
				var child_node;
				var occupied = false;
				if (node.length) {
					var i;
					for (i = node.length; --i >= 0;) {
						child_node = infra.getLayerNode(layer, node[i]);
						if (infra.existLayerNode(child_node)) {
							occupied = true;
							break;
						}
					}
					if (occupied) { return occupied; }
				} else {
					child_node = infra.getLayerNode(layer, node);
					if (infra.existLayerNode(child_node)) {
						occupied = true;
					}
				}
				return occupied;
			}
		};
		// если родитель скрыт, то и слой показаться не может
		var busyTag = function(layer) {
			if (infra.circle.occupied[layer.tag]) {
				return true;
			} else {
				return false;
			}
		};
		var busyTags = function(layer) {
			//layer.node = infra.getLayerNode(layer); // уже есть
			var tag;
			for (tag in infra.circle.occupied) { if (infra.circle.occupied.hasOwnProperty(tag)) {
				// дочерние тэги
				if (infra.existLayerNode(layer.node, infra.circle.occupied[tag])) {
					//infra.log.debug(layer.tag + '	' + layer.state + '	' + layer.show + '	' + layer.status + ' busy child tag ' + tag);
					return true;
				}
				// родительские тэги, зачем их проверять?
				//infra.circle.occupied[tag].node = infra.getLayerNode(infra.circle.occupied[tag]);
				//if (_occupied(infra.circle.occupied[tag].node, layer)) {
				//return true;
				//}
			}}
		};
		var _checkLayer = function(layer) {
			if (layer.parent && !layer.parent.show) {
				return 'no parent';
			}
			if (busyTag(layer)) {
				return 'busy tag ' + layer.tag;
			}
			if (!isPasted(layer)) { // вставляется ли слой
				return 'not inserted';
			}
			// посмотреть нет ли в текущем тэге каких-либо занятых тэгов
			if (!layer.show) { // у показанного слоя вполне себе могут быть заняты дочерние тэги
				if (busyTags(layer)) {
					return 4;
				}
			}
			// подходит ли state
			if (!stateOk(layer)) {
				return 'state mismatch';
			}
			return true;
		};

/*
 * Возвращает DOM-узел переданного слоя.
 *
 * @param {Object} layer Описание слоя.
 * @param {Object} [parent_element] Узел в котором бдет происходить поиск. Если не задан, то берется window.document.
 */
		infra.getLayerNode = function(layer, parent_element) {
			if (!parent_element) { parent_element = document; }
			var tag = layer.tag;
			if (!tag) {
				infra.log.warning('error set node, where layer.state ' + layer.state);
				return;
			}
			var node = false;
			var selector = tag.slice(1);
			if (tag[0] == '#') {
				if (parent_element == document) {
					node = document.getElementById(selector);
				} else {
					var child_elements = parent_element.getElementsByTagName('*');
					var i;
					for (i = child_elements.length; --i >= 0;) {
						if (selector == child_elements[i].id) {
							node = child_elements[i];
						}
					}
				}
			} else if (tag[0] == '.') {
				node = parent_element.getElementsByClassName(selector);
			} else {
				node = parent_element.getElementsByTagName(tag);
			}
			return node;
		};
/*
 * Проверяет слой, может ли он быть вставлен, возвращает в очередь при неудаче.
 *
 * Если **layer.status** равен shows и есть такой node, то это этот самый слой. Если слой будет замещен где то в одном из тэгов, то он скрывается во всех. Слой сначала скрывается, а потом на его пустое место вставляется другой.
 *
 * @param {Object} layer Описание слоя.
 */
		infra.checkLayer = function(layer) {
			if (layer.status != 'queue') { return false; }
			// проверка условий слоя, если не проходит, то слой отправляется в queue
			layer.status = 'check';
			layer.check = _checkLayer(layer);
			if (layer.check !== true) {
				// TODO: придумать имя или индификатор слоя, а то хз про какой речь идет
				//log(layer.tag, '	',layer.state,layer.reg_state, '	', layer.show, '	', layer.status, '	CIRCLE:', infra.circle.count, infra.circle.num, infra.circle.first, infra.circle.loading);
				//infra.log.debug('bad _checkLayer: ' + layer.check);
				if (layer.show) {
					//infra.log.debug('layer should be hidden: ' + layer.check);
				}
				layer.status = 'queue';
				return false; // возвращаем в очередь
			} else { return true; }
		};
	};
	if (typeof Infra !== "undefined") {
		Infra.ext(checkLayer);
	}
	if (typeof module !== "undefined" && module.exports) {
		module.exports.checkLayer = checkLayer;
	}
})();
(function() {
	var pasteLayer = function() {
		var infra = this;
		var js_last_unick = 0;// time последней точки
		var js_first_unick = new Date().getTime();// Начало отсчёта для всех точек
		var getUnick = function() { // Возвращаем всегда уникальную метку, цифры
			var m = new Date().getTime();
			m -= js_first_unick; // Отсчёт всего времени идёт с момента загрузки страницы в миллисекундах
			var last_unick = js_last_unick||m;
			while (last_unick >= m) { m++; }
			js_last_unick = m;
			return m;
		};

		// Получить у элемента значение css-свойства
		var getStyle = function(el, cssprop){
			if (el.currentStyle) {//IE
				return el.currentStyle[cssprop];
			} else if (document.defaultView && document.defaultView.getComputedStyle) { //Firefox
				return document.defaultView.getComputedStyle(el, "")[cssprop];
			} else { //try and get inline style
				return el.style[cssprop];
			}
		};

		// вставить html, выполнить css и script или получить весь html, если html не передан
		var html = function(el, html) {
			var res;
			if (html !== undefined) {
				if (/<(style+)([^>]+)*(?:>)/gim.test(html) || /<(script+)([^>]+)*(?:>)/gim.test(html)) {
					this.scriptautoexec = false;
					this.styleautoexec = false;
					var tempid = 'infrahtml' + getUnick(); // Одинаковый id нельзя.. если будут вложенные вызовы будет ошибка
					html='<span id="'+tempid+'" style="display:none">'+ '<style>#'+tempid+'{ width:3px }</style>'+
						'<script type="text/javascript">infra.scriptautoexec=true;</script>'+ '1</span>'+html;
					try {
						res = (el.innerHTML = html);
					} catch(e) {
						el.innerHTML = 'Ошибка, Возможно из-за вставки блочного элемента в строчный или другое какое-то не логичное действие';
					}
					if (!this.scriptautoexec) {
						var scripts = el.getElementsByTagName("script");
						for (var i = 1,script; script = scripts[i]; i++) {
							infra.load.script(script);
						}
					}
					var bug = document.getElementById(tempid);
					if (bug) {
						var b = getStyle(bug, 'width');
						if (b !== '3px') {
							var _css = el.getElementsByTagName("style");
							for (var i = 0,css; css=_css[i]; i++){
								var t = css.cssText; //||css.innerHTML; для IE будет Undefined ну и бог с ним у него и так работает а сюда по ошибке поподаем
								infra.load.styles(t);
							}
						}
						try {
							el.removeChild(bug);
						} catch(e) {
							infra.log.error('Ошибка при удалении временного элемента в pasteLayer html');
						}
					}
				} else {
					return el.innerHTML = html;
				}
			} else {
				res = el.innerHTML;
			}
			return res;
		}

/*
 * Вставляет html в DOM-узел на странице.
 *
 * @param {Object} node DOM-узел в который нужно вставить html.
 * @param {String} html для вставки.
 */
		infra.pasteNode = function(node, htmlString) {
			if (node.length) {
				for (var n=0, ll=node.length; n<ll; n++) {
					html(node[n], htmlString)
				}
			} else {
				html(node, htmlString);
			}
		};
	};
	Infra.ext(pasteLayer);
})();
(function() {
	var layer = function() {
		var infra = this;

		// скрыть слой и всех его потомков
		var hideLayer = function(layer) {
			layer.show = false; // отметка что слой скрыт
			layer.status = 'hidden'; // убираем из цикла
			if (layer.childs) {
				var i = layer.childs.length;
				for (; --i >= 0;) {
					hideLayer(layer.childs[i]);
				}
			}
			// очищаем место слоя
			if (infra.existLayerNode(layer.node)) {
				infra.pasteNode(layer.node, '');
			}
		};
/*
 * Проверяет равенство узлов.
 *
 * @param {Object} node1 Первый DOM-узел для сравнения.
 * @param {Object} node1 Второй DOM-узел для сравнения.
 * @return {Boolean} Возвращает **true** если узлы равны.
 */
		infra.eqLayerNodes = function(node1, node2) {
			if (node1 == node2) { return true; }
		};
		// Скрыть слои которые замещает переданный слой, убрать их из цикла
		//
		// Правила:
		// переданный слой обязательно будет показан, и не может быть скрыт в этом infra.check
		// в показанном слое не могут быть дочерние слои
		//
		var hideLayers = function(layer) {
			// если слой-родитель скрывается, то все его дети уже не могут показаться, за исключением текущего и его потомков
			//layer.node = infra.getLayerNode(layer); // есть
			var i;
			for (i = infra.layers.length; --i >= 0;) {
				if (infra.layers[i].show) {
					infra.layers[i].node = infra.getLayerNode(infra.layers[i]);
					// или такой же или посмотреть есть ли node слоя в текущем слое
					if (infra.eqLayerNodes(infra.layers[i].node, layer.node) || infra.existLayerNode(layer.node, infra.layers[i])) {
						hideLayer(infra.layers[i]);
					}
				}
			}
		};
		// Загрузиться и вставиться
		//
		// даже если слой не сможет загрузить свои данные, он не может не показаться, какие бы ошибки в нем не были,
		// слой в любом случае покажется, если ошибки есть, то пустым
		//
		// Правила:
		// У слоя должно быть место чтобы вставиться
		// Если в слое ошибка, появиться пустой слой
		var insert = function(layer, cb) {
			setTimeout(function() { // здесь в любом случае должна быть ассинхронность
				if (infra.circle.interrupt) {
					infra.log.debug('check interrupt 1');
					cb();
				} else {
					infra.emit('external', layer, function() {
						layer.oncheck(function() { // сработает у всех слоев которые должны быть показаны
							layer.status = 'insert';
							if (!layer.show) {
								infra.emit('insert', layer, function(err) {
									if (err) {
										infra.log.error('layer can not be inserted', layer.id);
										layer.status = 'wrong insert';
										cb();
									} else {
										if (infra.circle.interrupt) {
											infra.log.debug('check interrupt 2');
											cb();
										} else {
											infra.pasteNode(layer.node, layer.htmlString);
											layer.show = true;
											layer.onshow(cb);
										}
									}
								});
							} else { cb(); }
						});
					});
				}
			}, 1);
		};
		infra.on('layer', function(layer, num, layers_length) {
			if (infra.circle.state) {
				if (infra.circle.first) {
					layer.status = 'queue'; // в первом круге все помещаем в очередь
					// совпавшее состояние слоя, может быть не полностью равным infra.circle.state
					var re = new RegExp('^'+layer.state,'im');
					layer.reg_state = infra.circle.state.match(re);
				}
				// Пойти на проверки, вернуть в очередь
				if (infra.checkLayer(layer)) { // показанные слои заходят, так как для них тоже нужно забить места
					// Изменить условия проверок для других слоев, занимаем тэги
					infra.circle.occupied[layer.tag] = layer;
					// Скрыть и убрать из цикла те слои, которые будут замещены вставленным слоем
					if (!layer.show) { hideLayers(layer); } // этот слой может быть показан с прошлого infra.check
					// Вставиться
					infra.circle.loading++; // отправит infra.check в бесконечный цикл, пока не закончится insert
					insert(layer, function() {
						infra.circle.loading--; // выведет infra.check из бесконечного цикла
					});
				}
				// Если слой показан, и не прошел проверки, но ни один другой слой его не скрыл, слой все равно должен скрыться
				if (layer.show && (layer.status == 'queue')) {
					if (infra.circle.last) { // не в первый круг, и когда кончились загрузки
						hideLayer(layer);
						infra.circle.last = false;
					}
				}
			} else {
				infra.log.info('no set circle.state');
			}
		});
	};
	if (typeof Infra !== "undefined") {
		Infra.ext(layer);
	}
	if (typeof module !== "undefined" && module.exports) {
		module.exports.layer = layer;
	}
})();
(function() {
	var external = function() {
		var infra = this;
		infra.on('external', function(layer, cb) {
			// Правило: Слои здесь точно скрыты
			if (layer.ext && !layer._ext) {
				infra.log.debug('new external', layer.ext);
				infra.load(layer.ext, function(err, data) {
					layer._ext = {};
					if (!err) {
						try {
							try {
								layer._ext = eval('(' + data + ')');
							} catch(e) {
								layer._ext = eval(data);
							}
							var layers = infra.layers;
							infra.compile(layer._ext, function() {
								layer._ext = infra.layers;
								infra.layers = layers;
								// обновить конфиг
								// TODO: это сделать рекурсивно и все вынести в функции
								if (layer.config && layer._ext[0].config) {
									var param; for (param in layer._ext[0].config) { if (layer._ext[0].config.hasOwnProperty(param)) {
										if (!layer.config[param]) { layer.config[param] = layer._ext[0].config[param]; }
									}}
								}
								// переопределить слой
								var prop; for (prop in layer._ext[0]) { if (layer._ext[0].hasOwnProperty(prop)) {
									if (!layer[prop]) {
										layer[prop] = layer._ext[0][prop];
									}
								}}
								// обновить события
								var eList = ['onload', 'oncheck', 'onshow'];
								var i, len; for (i = 0, len = eList.length; i < len; i++) {
									(function(prop) {
										var value = layer['_'+prop];
										if (value) {
											layer[prop] = function(cb) {
												try {
													value.call(layer, cb);
												} catch(e) {
													infra.log.error(prop + ' ' +e);
													cb();
												}
											};
										}
									})(eList[i]);
								}
								// добавить новые
								len = layer._ext.length;
								if (len) {
									var num = infra.layers.indexOf(layer);
									for (i = 1; i < len; i++) {
										num++;
										infra.layers.splice(num, 0, layer._ext[i]);
									}
								}
								cb();
							});
						} catch(e) {
							infra.log.error('wrong ext', layer.ext);
							cb();
						}
					} else { cb(); }
				});
			} else { cb(); }
		});
	};
	if (typeof Infra !== "undefined") {
		Infra.ext(external);
	}
	if (typeof module !== "undefined" && module.exports) {
		module.exports.external = external;
	}
})();
(function(){
	var template = function() {
		var infra = this;
		var setData = function(layer, cb) {
			if (layer.data) { // данные уже загружены
				cb();
			} else {
				layer.data = {};
				if (layer.json) { // если есть путь для загрузки
					infra.load.json(layer.json, function(err, data) {
						if (!err) {
							layer.data = data;
						}
						cb();
					});
				} else {
					cb();
				}
			}
		};
		var setHtml = function(layer, cb) {
			layer.onload(function() { // все данные загружены
				if (typeof(layer.tplString) === 'string') {
					infra.parsetpl(layer.tplString, layer, function(htmlString) {
						layer.htmlString = htmlString;
						cb();
					});
				} else {
					infra.log.error('Wrong tplString ' + layer.tpl);
					layer.htmlString = ' ';
					cb();
				}
			});
		};
		var setTemplate = function(layer, cb) {
			if (!layer.tplString) {
				layer.tplString = ' ';
				if (layer.tpl) {
					infra.load(layer.tpl, function(err, txt) {
						if (!err) {
							layer.tplString = txt;
						}
						cb();
					});
				} else {
					cb();
				}
			} else {
				cb();
			}
		};
/*
 * Разбирает строку шаблона.
 *
 * @param {String} html Строка шаблона.
 * @param {Object} ctx Контекст для шаблона.
 * @param {Object} callback Callback-функция, один аргумент разобранный шаблон.
 */
		infra.parsetpl = function(html, ctx, callback) {
			var res = Mustache.to_html(html, ctx);
			if (callback) { callback(res); } else { return res; }
		};
		infra.on('insert', function(layer, cb) {
			// Правило: Слои здесь точно скрыты
			var counter = 2;
			var parse = function() {
				if (-- counter === 0) {
					setHtml(layer, function() { // распарсить
						cb();
					});
				}
			};
			if (layer.htmlString) {
				cb();
			} else if (layer.tpl || layer.tplString) {
				setTemplate(layer, function() { // загрузить шаблон
					parse();
				});
				setData(layer, function() { // загрузить данные
					parse();
				});
			} else {
				cb(1);
			}
		});
	};
	if (typeof Infra !== "undefined") {
		Infra.ext(template);
	}
	if (typeof module !== "undefined" && module.exports) {
		module.exports.template = template;
	}
})();
Infra.ext(function() { // Расширение позволяющие сборке работать со ссылками
	var infra = this;
	var ignore_protocols = ['^mailto:','^http://','^https://','^ftp://','^//'];
/*
 * Возвращает отформатированный вариант состояния.
 *
 * Убираеются двойные слэши, добавляются слэш в начале и в конце.
 *
 * @param {String} pathname Строка с именем состояния.
 * @return {String} Отформатированный вариант состояния.
 */
	infra.getState = function(pathname) {
		if (!pathname) { pathname = '/'; }
		var now_location = decodeURIComponent(location.pathname);
		pathname = decodeURIComponent(pathname);
		pathname = pathname.replace(/#.+/,''); // убрать location.hash
		if (pathname[0] != '/') { pathname = now_location + '/' + pathname; }
		//if (pathname.slice(-1) != '/') pathname = pathname + '/'; // добавить последний слэш если его нет
		pathname = pathname.replace(/\/{2,}/g,"\/"); // заменять двойные слэши
		return pathname;
	};

	// Поиск родительской ссылки
	var parent_a = function(targ) {
		if (targ.nodeName == 'A') {
			return targ;
		} else {
			if ((!targ.parentNode) || (targ.parentNode == 'HTML')) {
				return false;
			} else { return parent_a(targ.parentNode); }
		}
	};

	// Обработчик для ссылок
	var handler = function(e) {
		e = e || window.event;
		//e.stopPropagation ? e.stopPropagation() : (e.cancelBubble=true);
		if (!e.metaKey && !e.shiftKey && !e.altKey && !e.ctrlKey) {
			var targ = e.target || e.srcElement;
			targ = parent_a(targ);
			if (targ) {
				var href = targ.getAttribute('href');
				var ignore = false;
				if (href) {
					if (!targ.getAttribute('target')) {
						for (var i = ignore_protocols.length; --i >= 0;) {
							if (RegExp(ignore_protocols[i], "gim").test(href)) ignore = true;
						}
						if (!ignore) {
							try {
								e.preventDefault ? e.preventDefault() : (e.returnValue=false)
								infra.state = infra.getState(href);
								infra.check(function(cb) {
									infra.hash = targ.hash;
									cb();
								});
								//var x = window.scrollY; var y = window.scrollX;
							} catch(e) {
								window.location = href;
							}
						}
					}
				}
			}
		}
	}

	// Подменить ссылки
	var setHrefs = function() {
		var a = document.getElementsByTagName('a');
		for (var i = a.length; --i >= 0;) {
			a[i].onclick = handler;
		}
	}

/*
 * Подмена всех ссылок и осуществление переходов по страницам.
 *
 * @return {Undefined}
 */
	if (!infra.set) { infra.set = {}; }
	infra.set.links = function() {
		setHrefs();
		infra.on('start', function() {
			if (!infra.noscroll) window.scrollTo(0,0);
			infra.noscroll = false;
		})
		infra.on('end', function() { // Слои обработались
			setHrefs();
		})
	}
});
Infra.ext(function() {
	var infra = this;
/*
 * Включает управление адресной строкой
 * @return {Undefined}
 */
	infra.set.addressBar = function() {
		infra.state = infra.getState(location.pathname);
		infra.log.debug('setting onpopstate event for back and forward buttons');
		setTimeout(function() {
			window.onpopstate = function(e) {
				// кнопки вперед и назад и изменение хэштэга
				infra.log.debug('onpopstate');
				if (!infra.hash) {
					var now_state = infra.getState(location.pathname);
					infra.state = now_state;
					infra.check(function(cb) {
						infra.hash = location.hash;
						cb();
					});
				}
			};
		},1000); // chrome bug
		var now_state;
		// менять location.state в начале check
		infra.on('start', function() {
			// изменение адресной строки
			now_state = infra.getState(location.pathname);
			if (infra.state != now_state) { // изменилась
				infra.log.debug('push state ' + infra.state + ' replace hash ' + infra.hash);
				history.pushState(null, null, infra.state);
			}
		});
		// менять location.hash в конце check
		infra.on('end', function() { // Слои обработались
			if (infra.state != now_state) {
				if (infra.hash) {
					location.replace(infra.hash);
				}
			} else { // очистить адрес от хэша
				infra.log.debug('replace state ' + infra.state + ' push hash ' + infra.hash);
				history.replaceState(null, null, infra.state);
				if (infra.hash) {
					location.href = infra.hash;
				}
			}
			infra.hash = '';
		});
	};
});
Infra.ext(function() {
	var infra = this;
/*
 * Загружает кэш, вставленный на странице сервером.
 *
 * @return {Undefined}
 */
	var empty = function(){};
	var getCache = function() {
		infra.load.cache = Infra.server.cache;
		var i;
		for (i = infra.layers.length; --i >= 0;) {
			var layer = infra.layers[i];
			layer.show = Infra.server.showns[i];
			if (layer.show) {
				// КЭШ
				if (!layer.data && layer.json && infra.load.cache.data[layer.json]) {
					layer.data = infra.load.cache.data[layer.json];
				}
				if (!layer.htmlString && !layer.tplString && layer.tpl && infra.load.cache.text[layer.tpl]) {
					layer.tplString = infra.load.cache.text[layer.tpl];
				}
				layer.reg_state = infra.state.match(new RegExp('^'+layer.state,'im'));
				// Событие показа
				try {
					layer.onshow.bind(layer)(empty);
				} catch (e) {
					infra.log.error('onshow() ' + i + ' ' + e);
				}
			}
		}
		//var infra_server_cache = document.getElementById('infra_server_cache');
		//infra_server_cache.parentNode.removeChild(infra_server_cache);
	};
	infra.set.cache = function() {
		infra.once('start', function() {
			try {
				getCache();
			} catch(e) { // можно открыть просто index.html
				infra.log.warning('fail cache');
			}
		});
	};
});
(function() { // Вспомогательные средства для работы со слоями
	var tools = function() {
		var infra = this;
/*
 * Перепарсить слой при следующем чеке.
 *
 * @param {Object} layer Слой, который будет перепарсен.
 */
		infra.reparseLayer = function(layer) {
			layer.show = false;
			// если есть данные для загрузки, убрать данные сохраненные у слоя
			if (layer.json) {
				layer.data = false;
			}
			// если есть шаблон для загрузки, убрать текст сохраненный у слоя
			if (layer.tpl) {
				layer.tplString = '';
				layer.htmlString = '';
			} else if (layer.tplString) {
				layer.htmlString = '';
			}
			// если есть наследники, то скрыть их и показать заново
			if (layer.childs) {
				var i = layer.childs.length;
				for (; --i >= 0;) {
					//infra.reparseLayer(layer.childs[l]);
					layer.childs[i].show = false;
				}
			}
		};
/*
 * Перепарсить все слои.
 *
 * @return {Undefined}
 */
		infra.reparseAll = function() {
			var i = infra.layers.length;
			for (; --i >= 0;) {
				infra.reparseLayer(infra.layers[i]);
			}
		};
	/*!
		var externals = 0;
		var waitExternals = function(cb) {
			if (externals) {
				setTimeout(function() {
					waitExternals(cb)
				}, 100);
			} else cb();
		}

		infra.externalLayer = function(path) {
			externals++;
			var layer = {};
			infra.load(path + 'layer.js', function(err, ans) {
				externals--;
				eval(ans);
			});
			return layer;
		}
		// Переопределим compile, для загрузки externals
		var compile = infra.compile;
		infra.compile = function(index, cb) {
			waitExternals(function() {
				compile(index, cb);
			});
		}
	*/

		var _checkExists = function(state, cb) {
			var exist;
			var i; for (i = infra.layers.length; --i >= 0;) {
				exist = new RegExp('^'+infra.layers[i].state+'$').test(state);
				if (exist) {
					//console.log(state, infra.layers[i].state);
					break;
				}
			}
			cb(exist);
		};
/*
 * Проверяет, существуют ли check при переданном состоянии.
 *
 * @param {String} state Проверяемое состояние.
 * @param {Function} cb Callback-функция, один агрумент результат проверки.
 */
		infra.checkExists = function(state, cb) {
			if (!infra.layers.length) {
				infra.compile(infra.index, function() {
					_checkExists(state, cb);
				});
			} else {
				_checkExists(state, cb);
			}
		};
/*
 * Заменяет шаблонные данные в параметрах слоя.
 * oncheck-функция.
 *
 * @param {Function} cb Callback-функция.
 * @param {Object} layer, слой если не передан, то будет считаться значением в this.
 */
		infra.oncheckTplOptions = function(cb, layer) {
			if (!layer) { layer = this; }
			var counter = 2;
			var _cb = function() {
				if ( -- counter === 0 ) {
					cb();
				}
			};
			infra.parsetpl(layer.tpl, layer, function(data) {
				layer.tpl = data;
				_cb();
			});
			infra.parsetpl(layer.json, layer, function(data) {
				layer.json = data;
				_cb();
			});
		};
	};
	if (typeof Infra !== "undefined") {
		Infra.ext(tools);
	}
	if (typeof module !== "undefined" && module.exports) {
		module.exports.tools = tools;
	}
})();
Infra.ext(function() { // Расширение позволяющие сборке работать со ссылками
	var infra = this;
	infra.set.head = function(headObj) {
		var updateMeta = function(metatags, attr, head) {
			var update = false;
			var cnt; for (cnt = 0; cnt < metatags.length; cnt++) {
				var name = metatags[cnt].getAttribute("name");
				if (name) {
					name = name.toLowerCase();
					if (name == attr) {
						update = true;
						metatags[cnt].setAttribute("content", infra.meta[attr]);
					}
				}
			}
			if (!update) { // создаем новый
				var meta = document.createElement('meta');
				meta.setAttribute("name", attr);
				meta.setAttribute("content", infra.meta[attr]);
				head.appendChild(meta);
			}
		};
		var titleObj = headObj.title;
		var metaObj = headObj.meta;
		var not_found = titleObj['404'];
		var main = titleObj.main;
		var sub = titleObj.sub;
		infra.on('start', function() {
			infra.meta = {};
			infra.meta.keywords = metaObj.keywords;
			infra.meta.description = metaObj.description;
			infra.status_code = 200;
			infra.title = false;
		});
		infra.on('end', function() {
			if (!infra.title) { // если до этого не определился вручную
				if (infra.status_code == 404) {
					infra.title = not_found;
				} else if (infra.state === '/') {
					infra.title = main;
				} else {
					infra.title = infra.state.replace(/\/+$/, '').replace(/^\/+/, '').split('/').reverse().join(' / ') + sub;
				}
				infra.last_status_code = infra.status_code;
			}
			if (typeof(window) != 'undefined') { // на сервере title ставится из infra.title
				document.title = infra.title;
				// установить метатэги
				var metatags = document.getElementsByTagName("meta");
				var head = document.getElementsByTagName('head')[0];
				if (!infra.meta.keywords) { infra.meta.keywords=''; }
				if (!infra.meta.description) { infra.meta.description=''; }
				updateMeta(metatags, 'keywords', head);
				updateMeta(metatags, 'description', head);
			}
		});
	};
});
(function() {
	var compile = function() {
		var infra = this;
		infra.on('compile', function(layer, prop, value) {
			if (prop == 'jsontpl') {
				layer[prop] = value;
			}
		});
		infra.once('start', function() {
			var i; for (i = infra.layers.length; --i >= 0;) {
				if (infra.layers[i].jsontpl) {
					infra.layers[i].json = infra.parsetpl(infra.layers[i].jsontpl, infra.layers[i]);
				}
			}
		});
	};

	if (typeof Infra !== "undefined") {
		Infra.ext(compile);
	}
	if (typeof module !== "undefined" && module.exports) {
		module.exports.compile = compile;
	}
})();
