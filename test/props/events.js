/* Проверка работы событий */
if (typeof(window) == 'undefined') {
	var Infra = require('../../src/core.js');
	Infra.ext(require('../../src/props/logger.js').logger);
	Infra.ext(require('../../src/props/events.js').events);
	Infra.ext(require('../../src/props/check.js').setCheck);
} else {
	window.exports = {};
	window.events = exports;
}
exports.test_on_event = function(test) {
	var infra = Infra.init();
	test.expect(3);
	infra.on('test_on_event', function(param) {
		test.ok(param, 'send params');
	});
	infra.emit('test_on_event', true);
	infra.emit('test_on_event', true);
	test.strictEqual(infra.listeners('test_on_event').length, 1, 'length on listeners');
	test.done();
};
exports.test_once_event_and_listeners = function(test) {
	var infra = Infra.init();
	var listeners;
	test.expect(4);
	listeners = infra.listeners('test_once_event');
	test.strictEqual(listeners.length, 0, 'length once listeners');
	infra.once('test_once_event', function(param) {
		test.ok(param, 'bad send params');
	});
	test.strictEqual(listeners.length, 1, 'length once listeners');
	infra.emit('test_once_event', true);
	infra.emit('test_once_event', false);
	test.strictEqual(listeners.length, 0, 'length once listeners');
	test.done();
};
exports.test_once_event_and_listeners2 = function(test) {
	var infra = Infra.init();
	var listeners = infra.listeners('test_once_event2');
	test.expect(2);
	infra.once('test_once_event2', function() {
		test.equal(listeners.length, 0, 'length once listeners0');
		test.done();
	});
	test.equal(listeners.length, 1, 'length once listeners1');
	infra.emit('test_once_event2');
};
exports.test_on_check_event = function(test) {
	var infra = Infra.init();
	infra.index = {};
	test.expect(5);
	infra.once('end', function() {
		test.ok(true, 'queue1');
	});
	infra.once('end', function() {
		test.ok(true, 'queue2');
	});
	infra.once('end', function() {
		test.ok(true, 'queue3');
	});
	infra.once('end', function() {
		test.ok(true, 'queue4');
	});
	infra.once('end', function() {
		test.ok(true, 'queue5');
		test.done();
	});
	infra.check();
};
