/* Проверка работы событий */
if (typeof(window) == 'undefined') {
	var Infra = require('../../src/core.js');
	Infra.ext(require('../../src/props/logger.js'));
	Infra.ext(require('../../src/props/events.js'));
} else {
	window.exports = {};
	window.events = exports;
}

exports.test_on_event = function(test) {
	var infra = Infra.init();
	test.expect(3);
	infra.on('test_on_event', function(param) {
		test.ok(param, 'send params');
	})
	infra.emit('test_on_event', true);
	infra.emit('test_on_event', true);
	test.strictEqual(infra.listeners('test_on_event').length, 1, 'length on listeners')
	test.done();
}
exports.test_once_event_and_listeners = function(test) {
	var infra = Infra.init();
	test.expect(4);
	var listeners = infra.listeners('test_once_event')
	test.strictEqual(listeners.length, 0, 'length once listeners')
	infra.once('test_once_event', function(param) {
		test.ok(param, 'bad send params');
	})
	var listeners = infra.listeners('test_once_event')
	test.strictEqual(listeners.length, 1, 'length once listeners')
	infra.emit('test_once_event', true);
	infra.emit('test_once_event', true);
	listeners = infra.listeners('test_once_event')
	test.strictEqual(listeners.length, 0, 'length once listeners')
	test.done();
}
