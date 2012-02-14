(function(){
	var template = function() {
		var infra = this;
		var setData = function(layer, cb) {
			if (layer._data) cb();
			else {
				layer._data = {};
				if (layer.data) {
					infra.load.json(layer.data, function(err, json) {
						if (!err) layer._data = json;
						cb()
					})
				} else cb();
			}
		};
		var setHtml = function(layer, cb){
			layer.onload(function() { // все данные загружены
				if (typeof(layer._tpl) === 'string') {
					// передаем конфиг слоя в шаблон тоже в качестве переменной config в контексте
					if (layer._data) layer._data.config = layer.config;
					infra.parsetpl(layer._tpl, layer._data, function(html) {
						layer.html = html;
						cb()
					})
				} else {
					infra.log.error('Wrong _tpl ' + layer.tpl);
					layer.html = ' ';
					cb()
				}
			})
		};
		var setTemplate = function(layer, cb) {
			if (!layer._tpl) {
				layer._tpl = ' ';
				if (layer.tpl) {
					infra.load(layer.tpl, function(err, txt) {
						if (!err) layer._tpl = txt;
						cb();
					})
				} else cb();
			} else cb();
		}
/*
 * Разбирает строку шаблона.
 *
 * @param {String} html Строка шаблона.
 * @param {Object} ctx Контекст для шаблона.
 * @param {Object} callback Callback-функция, один аргумент разобранный шаблон.
 */
		infra.parsetpl = function(html, ctx, callback) {
			callback(Mustache.to_html(html, ctx));
		}
		infra.on('insert', function(layer, cb) {
			// Правило: Слои здесь точно скрыты
			var counter = 2;
			var parse = function() {
				if (-- counter == 0) {
					setHtml(layer, function() { // распарсить
						cb();
					})
				}
			}
			if (!layer.html) {
				setTemplate(layer, function() { // загрузить шаблон
					parse();
				})
				setData(layer, function() { // загрузить данные
					parse();
				})
			} else cb();
		})
	}
if (typeof(window) != 'undefined')
		Infra.ext(template)
if (typeof(window) == 'undefined') module.exports = template
})();
