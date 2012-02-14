(function() {
	var empty = function(cb){cb()};
	var compile = function() {
		var infra = this;
		this.on('compile', function(layer, prop, value) {
			if (!layer.state) layer.state = '/'; // устанавливаем общий state всем слоям
			if (prop == 'tag' || prop == 'state' || prop == '_ext' || prop == 'ext') {
				if (this.layers.indexOf(layer) == -1) this.layers.push(layer);
				layer[prop] = value;
			} else if (prop == 'div') {
				if (this.layers.indexOf(layer) == -1) this.layers.push(layer);
				layer['tag'] = '#'+value;
			}
		});
		this.on('compile', function(layer, prop, value) {
			if (prop == '_tpl' || prop == 'html' || prop == 'tpl' || prop == '_data' || prop == 'data' || prop == 'config') {
				if (this.layers.indexOf(layer) == -1) this.layers.push(layer);
				layer[prop] = value;
			}
			if (prop == 'onload' || prop == 'onshow' || prop == 'oncheck') {
				layer['_'+prop] = value;
				layer[prop] = function(cb) {
					try {
						value.call(layer, cb);
					} catch (e) {
						infra.log.error(prop + ' ' +e);
						cb();
					}
				}
			}
			if (!layer.config) layer.config = {};
			if (!layer.oncheck) {
				layer.oncheck = empty; layer._oncheck = false;
			}
			if (!layer.onload) {
				layer.onload = empty; layer._onload = false;
			}
			if (!layer.onshow) {
				layer.onshow = empty; layer._onshow = false;
			}
		})
	}
if (typeof(window) != 'undefined')
	Infra.ext(compile)
if (typeof(window) == 'undefined') module.exports = compile
})();
