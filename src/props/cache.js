Infra.ext(function() {
	var infra = this;
/*
 * Загружает кэш, вставленный на странице сервером.
 *
 * @return {Undefined}
 */
	infra.set.cache = function() {
		infra.load.cache = Infra.server.cache;
		for (var i = infra.layers.length; --i >= 0;) {
			var layer = infra.layers[i];
			layer.show = Infra.server.showns[i];
			if (layer.show) {
				// КЭШ
				if (!layer._data && layer.data && infra.load.cache.json[layer.data]) {
					layer._data = infra.load.cache.json[layer.data];
				}
				if (!layer.html && !layer._tpl && layer.tpl && infra.load.cache.text[layer.tpl]) {
					layer._tpl = infra.load.cache.text[layer.tpl];
				}
				layer.reg_state = infra.state.match(new RegExp('^'+layer.state,'im'));
				// Событие показа
				try {
					layer.onshow.bind(layer)(function(){});
				} catch (e) {
					infra.log.error('onshow() ' + i + ' ' + e);
				}
			}
		}
		//var infra_server_cache = document.getElementById('infra_server_cache');
		//infra_server_cache.parentNode.removeChild(infra_server_cache);
	}
});
