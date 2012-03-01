if (typeof(window) == 'undefined') {
	var Infra = require('../../src/core.js');
	Infra.ext(require('../../src/props/logger.js').logger);
	Infra.ext(require('../../src/props/events.js').events);
	Infra.ext(require('../../src/props/check.js').setCheck);
	Infra.ext(require('../../src/props/compile1lvl.js').compile);
	Infra.ext(require('../../src/props/compile2lvl.js').compile);
} else {
	window.exports = {};
	window.compile2lvl = exports;
}

exports.test_states = function(test) {
	var infra = Infra.init();
	infra.index = {
		tpl: 'path/to/tpl1',
		tag: '#base_html',
		states: {
			'Страница': { // здесь будет добавлен слэш
				tpl: 'path/to/tpl2',
				tag: '#base_text'
			}
		}
	};
	infra.check();
	test.expect(3);
	var key;
	for (key in infra.index.states) { if (infra.index.states.hasOwnProperty(key)) {}}
	test.strictEqual(infra.layers[1].state, '/' + key + '/', 'state');
	test.strictEqual(infra.layers[0], infra.layers[1].parent, 'parent');
	test.strictEqual(infra.layers[0].states[infra.layers[1].state], infra.layers[1], 'states');
	test.done();
};

exports.test_tags = function(test) {
	var infra = Infra.init();
	infra.index = {
		tpl: 'path/to/tpl1',
		state: '/Главная/', // здесь никто сам не добавит последний слэш
		tag: '#base_html',
		tags: {
			'#base_text': {
				tpl: 'path/to/tpl2'
			}
		}
	};
	infra.check();
	test.expect(3);
	test.strictEqual(infra.layers[0].state, infra.layers[1].state, 'state');
	test.strictEqual(infra.layers[0], infra.layers[1].parent, 'parent');
	test.strictEqual(infra.layers[0].tags[infra.layers[1].tag], infra.layers[1], 'tags');
	test.done();
};
