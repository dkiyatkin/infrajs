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
