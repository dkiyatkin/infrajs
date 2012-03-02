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
