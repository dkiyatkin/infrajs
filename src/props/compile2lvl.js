(function() {
	var compile = function() {
		var infra = this;
		infra.on('compile', function(layer, prop, value) {
			if (prop == 'states' || prop == 'tags' || prop == 'divs') {
				if (Object.prototype.toString.apply(value) === '[object Object]') {
					if (infra.layers.indexOf(layer) == -1) { infra.layers.push(layer); }
					if (!layer.childs) { layer.childs = []; }
					if ((prop == 'states') && !layer.states) { layer.states = {}; }
					if ((prop == 'tags' || prop == 'divs') && !layer.tags) { layer.tags = {}; }
					var key;
					for (key in value) { if (value.hasOwnProperty(key)) {
						if (Object.prototype.toString.apply(value[key]) === '[object Object]') {
							var child_layer = {};
							child_layer.parent = layer;
							infra.layers.push(child_layer);
							layer.childs.push(child_layer);
							if (prop == 'states') {
								var state = key;
								if ((state[0] == '^') || (state.slice(-1) == '$')) {
									child_layer.state = state;
								} else {
									child_layer.state = child_layer.parent.state + state + '/';
								}
								layer.states[child_layer.state] = child_layer;
							} else {
								var tag;
								if (prop == 'tags') {
									tag = key;
								} else {
									tag = '#'+key;
								}
								child_layer.tag = tag; // тэги не прибавляются как state у childs
								child_layer.state = layer.state; // state наследуется как у родителя
								layer.tags[child_layer.tag] = child_layer;
							}
							var prop2;
							for (prop2 in value[key]) { if (value[key].hasOwnProperty(prop2)) {
								infra.emit('compile', child_layer, prop2, value[key][prop2]);
							}}
						} else {
							infra.log.error('bad value', prop, value[key]);
						}
					}}
				} else {
					infra.log.error('bad value', prop, value);
				}
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
