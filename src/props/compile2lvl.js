(function() {
	var compile = function() {
		this.on('compile', function(layer, prop, value) {
			if (prop == 'childs') {
				if (this.layers.indexOf(layer) == -1) this.layers.push(layer);
				if (!layer.childs) layer.childs = {};
				// TODO: labels // if (value['label'] && (typeof(value['label'])=='string')) { this.label[value['label']] = []; }
				// childs назначаются без последнего слэша, но он потом добавляется
				// для отдельного state последний слэш не добавляется
				for (var state in value) if (value.hasOwnProperty(state)) {
					if (typeof(value[state]) == 'object') {
						var child_layer = {};
						child_layer.parent = layer;
						if ((state[0] == '^') || (state.slice(-1) == '$')) {
							child_layer.state = state;
						} else {
							child_layer.state = child_layer.parent.state + state + '/';
						}
						this.layers.push(child_layer);
						layer.childs[child_layer.state] = child_layer;
						for (var prop2 in value[state]) if (value[state].hasOwnProperty(prop2)) {
							this.emit('compile', child_layer, prop2, value[state][prop2]);
						}
					}
				}
			}
		});
		this.on('compile', function(layer, prop, tags) {
			if (prop == 'tags') {
				if (this.layers.indexOf(layer) == -1) this.layers.push(layer);
				if (!layer.tags) layer.tags = {};
				for (var tag in tags) if (tags.hasOwnProperty(tag)) {
					if (typeof(tags[tag]) == 'object') {
						var child_layer = {};
						child_layer.parent = layer;
						child_layer.tag = tag; // тэги не прибавляются как state у childs
						child_layer.state = layer.state;
						this.layers.push(child_layer);
						layer.tags[child_layer.tag] = child_layer;
						for (var prop2 in tags[tag]) if (tags[tag].hasOwnProperty(prop2)) { // собрать слой
							this.emit('compile', child_layer, prop2, tags[tag][prop2]);
						}
					}
				}
			}
		})
	}
if (typeof(window) != 'undefined')
	Infra.ext(compile)
if (typeof(window) == 'undefined') module.exports = compile
})();
