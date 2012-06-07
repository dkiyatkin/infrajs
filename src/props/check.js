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
