Infra.ext(function() {
	var infra = this;
	var Loader = function() {
		var loader = document.createElement('img');
		loader.setAttribute('src', '/infra/plugins/infrajs/images/loader.gif');
		loader.setAttribute('style', 'display:block;width:30px;height:30px;left:50%;top:50%;position:fixed;margin-left:-15px;margin-top:-15px;');
		var html = document.getElementsByTagName('html')[0];
		return {
			show: function() {
				try {
					html.appendChild(loader);
					return true;
				} catch (e) {
					infra.log.error('error show loader');
				}
			},
			hide: function() {
				try {
					html.removeChild(loader);
					return true;
				} catch (e) {
					infra.log.error('error hide loader');
				}
			}
		}
	}
/*
 * Объект позволяющий управлять графическим индикатором загрузки.
 *
 * Примеры:
 *		infra.loader.show() // показать лоадер
 *		infra.loader.hide() // скрыть лоадер
 */
	infra.loader = Loader();
	infra.on('start', function() {
		infra.loader.show();
	})
	infra.on('end', function() {
		infra.loader.hide();
	})
});
