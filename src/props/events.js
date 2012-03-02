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
