(function() {
	var empty = function(cb) { cb(); };
	var compile = function() {
		var infra = this;
		infra.labels = {};
		infra.ids = {};
		var id = 0;
		this.on('compile', function(layer, prop, value) {
			if (!layer.state) {
				layer.state = '/'; // устанавливаем общий state всем слоям
			}
			if (!layer.id) {
				layer.id = id++;
				infra.ids[layer.id] = layer;
			}
			var oneprops = ['tag','state', 'html', 'css', 'json', 'tpl', 'label', 'ext', 'config', 'data', 'htmlString', 'id'];
			if (oneprops.indexOf(prop) != -1) {
				if (this.layers.indexOf(layer) == -1) {
					this.layers.push(layer);
				}
				if (prop == 'config' || prop == 'data') { // объекты
					if (Object.prototype.toString.apply(value) === '[object Object]') {
						layer[prop] = value;
					} else {
						infra.log.error('bad value', prop, value);
					}
				} else { // строки
					if (Object.prototype.toString.apply(value) === '[object String]') {
						layer[prop] = value;
						if (prop == 'label') {
							var labels = value.replace(/^\s+|\s+$/g,'').split(' ');
							var i; for (i = labels.length; --i >= 0;) {
								if (!infra.labels[labels[i]]) {
									infra.labels[labels[i]] = [];
								}
								infra.labels[labels[i]].push(layer);
							}
						}
						if (prop == 'id') {
							infra.ids[prop] = layer;
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
if (typeof(window) != 'undefined') { Infra.ext(compile); }
if (typeof(window) == 'undefined') { module.exports = compile; }
})();
