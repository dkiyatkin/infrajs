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
			for (var i = infra.layers.length; --i >= 0;) {
				exist = new RegExp('^'+infra.layers[i].state+'$').test(state);
				if (exist) {
					//console.log(state, infra.layers[i].state);
					break;
				}
			}
			cb(exist);
		}
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
				})
			} else _checkExists(state, cb);
		}
	}
if (typeof(window) != 'undefined')
	Infra.ext(tools);
if (typeof(window) == 'undefined') module.exports = tools
})();
