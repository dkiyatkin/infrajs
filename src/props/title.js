Infra.ext(function() { // Расширение позволяющие сборке работать со ссылками
	var infra = this;
	infra.set.title = function(titleObj) {
		var updateMeta = function(metatags, attr, head) {
			var update = false;
			var cnt; for (cnt = 0; cnt < metatags.length; cnt++) {
				var name = metatags[cnt].getAttribute("name");
				if (name) {
					name = name.toLowerCase();
					if (name == attr) {
						update = true;
						metatags[cnt].setAttribute("content", infra.meta[attr]);
					}
			  	}
			}
			if (!update) { // создаем новый
				var meta = document.createElement('meta');
				meta.setAttribute("name", attr);
				meta.setAttribute("content", infra.meta[attr]);
				head.appendChild(meta);
			}
		};
		var not_found = titleObj['404'];
		var main = titleObj.main;
		var sub = titleObj.sub;
		infra.on('start', function() {
			infra.meta = {};
			infra.status_code = 200;
			infra.title = false;
		});
		infra.on('end', function() {
			if (!infra.title) { // если до этого не определился вручную
				if (infra.status_code == 404) {
					infra.title = not_found;
				} else if (infra.state === '/') {
					infra.title = main;
				} else {
					infra.title = infra.state.replace(/\/+$/, '').replace(/^\/+/, '').split('/').reverse().join(' / ') + sub;
				}
				infra.last_status_code = infra.status_code;
			}
			if (typeof(window) != 'undefined') { // на сервере title ставится из infra.title
				document.title = infra.title;
				// установить метатэги
				var metatags = document.getElementsByTagName("meta");
				var head = document.getElementsByTagName('head')[0];
				if (infra.meta.keywords) { updateMeta(metatags, 'keywords', head); }
				if (infra.meta.description) { updateMeta(metatags, 'description', head); }
			}
		});
	};
});
