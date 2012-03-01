if (typeof(window) == 'undefined') {
	var Infra = require('../../src/core.js');
	Infra.ext(require('../../src/props/logger.js').logger);
	Infra.ext(require('../../src/props/events.js').events);
	Infra.ext(require('../../src/props/check.js').setCheck);
	Infra.ext(require('../../src/props/compile1lvl.js').compile);
} else {
	window.exports = {};
	window.compile1lvl = exports;
}

exports.test_tag = function(test) {
	test.expect(1);
	var infra = Infra.init();
	infra.index = { tag: '#base_html' };
	infra.check();
	test.strictEqual(infra.layers[0].tag, '#base_html', 'tag');
	test.done();
};

exports.test_double__check = function(test) {
	var infra = Infra.init();
	infra.index = { tag: '#base_html' };
	test.expect(4);
	infra.on('layer', function(layer, num, layers_length, first) {
		test.ok(true, 'double _check');
	});
	infra.check(function(cb) {
		cb();
	});
	infra.check(function(cb) {
		cb();
	});
	infra.check(function(cb) {
		test.done();
		cb();
	});
};

exports.test_layer_listeners = function(test) {
	test.expect(2);
	var infra = Infra.init();
	infra.index = {
		tag: '#base_html',
		onshow: function(cb) {
			test.ok(true, 'onshow');
			cb();
		}
	};
	infra.check();
	var testfunc = function() {
		test.ok(true, 'onchecked');
	};
	infra.layers[0].oncheck(testfunc);
	infra.layers[0].onshow(test.done);
};
