/* Проверка объекта Infra */

if (typeof(window) == 'undefined') {
	var Infra = require('../src/core.js');
} else {
	window.exports = {};
	window.core = exports;
}

exports.test_init = function(test) {
	var infra = Infra.init();
	test.expect(1);
	test.strictEqual(infra.layers.length, 0, 'infra.layers');
	test.done();
};

exports.test_ext = function(test){
	Infra.ext(function() {
		var a = 1;
		var func_a = function() {};
		this.test_value = 2;
	});
	Infra.ext(function() {
		this.testFunction = function() {
			return this.test_value + 1;
		};
	});
	var infra = Infra.init();
	test.expect(4);
	test.strictEqual(infra.a, undefined, 'no ext value');
	test.strictEqual(infra.c, undefined, 'no ext value');
	test.strictEqual(infra.test_value, 2, 'ext value');
	test.strictEqual(infra.testFunction(), 3, 'ext function');
	test.done();
};

exports.many_init = function(test) {
	test.expect(1);
	var infra = Infra.init();
	var infra2 = Infra.init();
	test.ok(infra != infra2, 'new obj');
	test.done();
};
