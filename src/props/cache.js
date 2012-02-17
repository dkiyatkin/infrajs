Infra.ext(function() {
	var infra = this;
/*
 * Загружает кэш, вставленный на странице сервером.
 *
 * @return {Undefined}
 */
	var empty = function(){};
	infra.set.cache = function() {
		infra.load.cache = Infra.server.cache;
		var i;
		for (i = infra.layers.length; --i >= 0;) {
			var layer = infra.layers[i];
			layer.show = Infra.server.showns[i];
			if (layer.show) {
				// КЭШ
				if (!layer.data && layer.json && infra.load.cache.data[layer.json]) {
					layer.data = infra.load.cache.data[layer.json];
				}
				if (!layer.htmlString && !layer.tplString && layer.tpl && infra.load.cache.text[layer.tpl]) {
					layer.tplString = infra.load.cache.text[layer.tpl];
				}
				layer.reg_state = infra.state.match(new RegExp('^'+layer.state,'im'));
				// Событие показа
				try {
					layer.onshow.bind(layer)(empty);
				} catch (e) {
					infra.log.error('onshow() ' + i + ' ' + e);
				}
			}
		}
		//var infra_server_cache = document.getElementById('infra_server_cache');
		//infra_server_cache.parentNode.removeChild(infra_server_cache);
	};
});
