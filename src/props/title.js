Infra.ext(function() { // Расширение позволяющие сборке работать со ссылками
	var infra = this;
	infra.set.title = function(titleObj) {
		var not_found = titleObj['404'];
		var main = titleObj.main;
		var sub = titleObj.sub;
		infra.on('start', function() {
			infra.status_code = 200;
		});
		infra.on('end', function() {
			if (infra.status_code == 404) {
				infra.title = not_found;
			} else if (infra.state === '/') {
				infra.title = main;
			} else {
				infra.title = infra.state.replace(/\/+$/, '').replace(/^\/+/, '').split('/').reverse().join(' / ') + sub;
			}
			infra.last_status_code = infra.status_code;
			document.title = infra.title;
		});
	};
});
