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
