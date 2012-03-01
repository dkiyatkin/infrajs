/* Проверка работы check */

if (typeof(window) == 'undefined') {
	var Infra = require('../../src/core.js');
	Infra.ext(require('../../src/props/logger.js').logger);
	Infra.ext(require('../../src/props/events.js').events);
	Infra.ext(require('../../src/props/check.js').setCheck);
} else {
	window.exports = {};
	window.check = exports;
}

exports.test_many_check = function(test) {
	var infra = Infra.init();
	infra.index = {};
	var a = 0;
	var last = false;
	test.expect(2);
	infra.check(function(cb) {
		test.ok(true, 'queue');
		a++;
		cb();
	});
	infra.check(function(cb) {
		test.ok(false, 'queue');
		a++;
		cb();
	});
	infra.check(function(cb) {
		test.ok(false, 'queue');
		a++;
		cb();
	});
	infra.check(function(cb) {
		test.ok(false, 'queue');
		a++;
		cb();
	});
	infra.check(function(cb) {
		a++;
		test.strictEqual(a, 2, 'last');
		test.done();
		cb();
	});
};

exports.test_wait_check = function(test) {
	var infra = Infra.init();
	infra.index = {};
	var a = 0;
	test.expect(4);
	infra.on('start', function() {
		test.ok(true, 'start');
	});
	infra.on('end', function() {
		a++;
		if (a == 2) {
			test.done();
		}
	});
	infra.check(true);
	infra.check(function(cb) {
		test.ok(true, 'resume');
		cb();
	});
	infra.check(function(cb) {
		test.ok(false, 'queue1');
		cb();
	});
	infra.check(function(cb) {
		test.ok(false, 'queue2');
		cb();
	});
	infra.check(function(cb) {
		test.ok(true, 'queue3');
		cb();
	});
};
