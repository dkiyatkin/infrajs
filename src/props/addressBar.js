Infra.ext(function() {
	var infra = this;
/*
 * Включает управление адресной строкой
 * @return {Undefined}
 */
	infra.set.addressBar = function() {
		infra.state = infra.getState(location.pathname);
		infra.log.debug('setting onpopstate event for back and forward buttons');
		setTimeout(function() {
			window.onpopstate = function(e) {
				// кнопки вперед и назад и изменение хэштэга
				infra.log.debug('onpopstate');
				if (!infra.hash) {
					var now_state = infra.getState(location.pathname);
					infra.state = now_state;
					infra.check(function(cb) {
						infra.hash = location.hash;
						cb();
					});
				}
			};
		},1000); // chrome bug
		var now_state;
		// менять location.state в начале check
		infra.on('start', function() {
			// изменение адресной строки
			now_state = infra.getState(location.pathname);
			if (infra.state != now_state) { // изменилась
				infra.log.debug('push state ' + infra.state + ' replace hash ' + infra.hash);
				history.pushState(null, null, infra.state);
			}
		});
		// менять location.hash в конце check
		infra.on('end', function() { // Слои обработались
			if (infra.state != now_state) {
				if (infra.hash) {
					location.replace(infra.hash);
				}
			} else { // очистить адрес от хэша
				infra.log.debug('replace state ' + infra.state + ' push hash ' + infra.hash);
				history.replaceState(null, null, infra.state);
				if (infra.hash) {
					location.href = infra.hash;
				}
			}
			infra.hash = '';
		});
	};
});
