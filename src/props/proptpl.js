(function() {
	var compile = function() {
		var infra = this;
		infra.on('compile', function(layer, prop, value) {
			if (prop == 'jsontpl') {
				layer[prop] = value;
			}
		});
		infra.once('start', function() {
			var i; for (i = infra.layers.length; --i >= 0;) {
				if (infra.layers[i].jsontpl) {
					infra.layers[i].json = infra.parsetpl(infra.layers[i].jsontpl, infra.layers[i]);
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
