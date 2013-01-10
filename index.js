var Infra = require('./src/infra.js');

module.exports = function(options) {

	return function(req, res, next) {
		next();
	};
};
