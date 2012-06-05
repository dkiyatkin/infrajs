Infra.ext(function() { // Расширение позволяющие сборке работать со ссылками
	var infra = this;
	var ignore_protocols = ['^mailto:','^http://','^https://','^ftp://','^//'];
/*
 * Возвращает отформатированный вариант состояния.
 *
 * Убираеются двойные слэши, добавляются слэш в начале и в конце.
 *
 * @param {String} pathname Строка с именем состояния.
 * @return {String} Отформатированный вариант состояния.
 */
	infra.getState = function(pathname) {
		if (!pathname) { pathname = '/'; }
		var now_location = decodeURIComponent(location.pathname);
		pathname = decodeURIComponent(pathname);
		pathname = pathname.replace(/#.+/,''); // убрать location.hash
		if (pathname[0] != '/') { pathname = now_location + '/' + pathname; }
		//if (pathname.slice(-1) != '/') pathname = pathname + '/'; // добавить последний слэш если его нет
		pathname = pathname.replace(/\/{2,}/g,"\/"); // заменять двойные слэши
		return pathname;
	};

	// Поиск родительской ссылки
	var parent_a = function(targ) {
		if (targ.nodeName == 'A') {
			return targ;
		} else {
			if ((!targ.parentNode) || (targ.parentNode == 'HTML')) {
				return false;
			} else { return parent_a(targ.parentNode); }
		}
	};

	// Обработчик для ссылок
	var handler = function(e) {
		e = e || window.event;
		//e.stopPropagation ? e.stopPropagation() : (e.cancelBubble=true);
		if (!e.metaKey && !e.shiftKey && !e.altKey && !e.ctrlKey) {
			var targ = e.target || e.srcElement;
			targ = parent_a(targ);
			if (targ) {
				var href = targ.getAttribute('href');
				var ignore = false;
				if (href) {
					if (!targ.getAttribute('target')) {
						for (var i = ignore_protocols.length; --i >= 0;) {
							if (RegExp(ignore_protocols[i], "gim").test(href)) ignore = true;
						}
						if (!ignore) {
							try {
								e.preventDefault ? e.preventDefault() : (e.returnValue=false)
								infra.state = infra.getState(href);
								infra.check(function(cb) {
									infra.hash = targ.hash;
									cb();
								});
								//var x = window.scrollY; var y = window.scrollX;
							} catch(e) {
								window.location = href;
							}
						}
					}
				}
			}
		}
	}

	// Подменить ссылки
	var setHrefs = function() {
		var a = document.getElementsByTagName('a');
		for (var i = a.length; --i >= 0;) {
			a[i].onclick = handler;
		}
	}

/*
 * Подмена всех ссылок и осуществление переходов по страницам.
 *
 * @return {Undefined}
 */
	if (!infra.set) { infra.set = {}; }
	infra.set.links = function() {
		setHrefs();
		infra.on('start', function() {
			if (!infra.noscroll) window.scrollTo(0,0);
			infra.noscroll = false;
		})
		infra.on('end', function() { // Слои обработались
			setHrefs();
		})
	}
});
