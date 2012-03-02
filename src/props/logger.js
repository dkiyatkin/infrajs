(function() {
var Logger = function() {
	var loggers = ['ERROR', 'WARNING', 'INFO', 'DEBUG'];
	var _log = function(messages, level, logger, quiet) {
		var i, message;
		for (i in messages) { if (messages.hasOwnProperty(i)) {
			if (!message) {
				message = messages[i];
			} else {
				message = message + ' ' + messages[i];
			}
		}}
		var l;
		for (l = loggers.length; --l >= level;) {
			if (loggers[l] == logger) {
				var msg = '[' + new Date().toGMTString() + '] ' + loggers[level] + ' ' + message;
				if (!quiet) {
					console.log(msg);
				}
				return msg;
			}
		}
	};
	return {
		quiet: false,
		logger: 'WARNING',
		debug: function() {
			return _log(arguments, 3, this.logger, this.quiet);
		},
		info: function() {
			return _log(arguments, 2, this.logger, this.quiet);
		},
		warning: function() {
			return _log(arguments, 1, this.logger, this.quiet);
		},
		error: function() {
			return _log(arguments, 0, this.logger, this.quiet);
		}
	};
};
var logger = function() {
	var infra = this;
/*
 * Предоставляет интерфейс управления отладочными сообщениями.
 *
 * Примеры:
 *
 *		infra.log.error('test error'); // вернет и выведет в консоль 'test error'
 *		infra.log.warning('test warning'); // вернет и выведет в консоль 'test warning'
 *		infra.log.info('test info'); // вернет и выведет в консоль 'test info'
 *		infra.log.logger = 'WARNING'; // выбрать уровень логгера
 *		// доступны 4 соответсвующих уровня: ERROR, WARNING (выбран по умолчанию), INFO и DEBUG
 *		infra.log.debug('test debug'); // ничего не произойдет, потому что логгер задан уровнем выше
 */
	infra.log = Logger();
};
if (typeof Infra !== "undefined") {
	Infra.ext(logger);
}
if (typeof module !== "undefined" && module.exports) {
	module.exports.logger = logger;
}
})();
