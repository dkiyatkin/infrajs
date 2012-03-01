if (typeof(window) == 'undefined') {
	var Infra = require('../../src/core.js');
	Infra.ext(require('../../src/props/logger.js').logger);
} else {
	window.exports = {};
	window.logger = exports;
}
exports.test_logger = function(test) {
	test.expect(2);
	var infra = Infra.init();
	infra.log.quiet = true;
	infra.log.logger = 'WARNING';
	test.equal(infra.log.debug('logger', 'sdf'), undefined, 'logger level 1');
	infra.log.logger = 'INFO';
	test.equal(infra.log.info('logger', 'sdf').split(' ').slice(-3).join(' '), 'INFO logger sdf', 'logger level 2');
	test.done();
};
