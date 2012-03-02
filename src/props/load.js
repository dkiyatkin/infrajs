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
