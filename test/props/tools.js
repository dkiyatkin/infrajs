if (typeof(window) == 'undefined') {
	var prefix = '../../src/';
	var Infra = require(prefix + 'core.js');
	Infra.ext(require(prefix + 'props/logger.js').logger);
	Infra.ext(require(prefix + 'props/events.js').events);
	Infra.ext(require(prefix + 'props/load.js').load);
	Infra.ext(require(prefix + 'props/check.js').setCheck);
	Infra.ext(require(prefix + 'props/compile1lvl.js').compile);
	Infra.ext(require(prefix + 'props/compile2lvl.js').compile);
	Infra.ext(require(prefix + 'props/checkLayer.js').checkLayer);
	Infra.ext(require(prefix + 'props/layer.js').layer);
	Infra.ext(require(prefix + 'props/template.js').template);
	Infra.ext(require(prefix + 'props/tools.js').tools);
} else {
	window.exports = {};
	window.tools = exports;
}

exports.checkExists = function(test) {
	Infra.ext(function(){
		var infra = this;
		infra.index = {
			tag: '#base_html',
			tpl: '/infra/layers/index.tpl',
			tags: {
				'#header': {
					tpl: '/infra/layers/header.tpl',
					states: {
						'bla': {
							htmlString: '123',
							tag: '#one'
						}
					}
				}
			}
		};
	});
	var infra = Infra.init();
	infra.checkExists('/', function(exist) {
		test.ok(exist, 'state1');
		infra.checkExists('/bla/', function(exist) {
			test.ok(exist, 'state2');
			infra.checkExists('/no/', function(exist) {
				test.ok(!exist, 'state3');
				test.done();
			});
		});
	});
};
