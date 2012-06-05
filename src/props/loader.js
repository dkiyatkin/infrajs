if (typeof window !== "undefined") {
Infra.ext(function() {
	var infra = this;
	var html = document.getElementsByTagName('html')[0];
	var Loader = function() {
		var loader = document.createElement('img');
		loader.setAttribute('style', 'z-index:1000;display:block;width:30px;height:30px;left:50%;top:50%;position:fixed;margin-left:-15px;margin-top:-15px;');
		return {
			src: '../images/loader.gif',
			show: function() {
				try {
					loader.setAttribute('src', this.src);
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
		};
	};
/*
 * Объект содержит дополнительные опции сборки.
 */
	if (!infra.set) { infra.set = {}; }
	infra.set.loader = function(src) {
/*
 * Объект позволяющий управлять графическим индикатором загрузки.
 *
 * Примеры:
 *		infra.loader.show() // показать лоадер
 *		infra.loader.hide() // скрыть лоадер
 */
		infra.loader = Loader();
		if (src) { infra.loader.src = src; }
		infra.on('start', function() {
			html.setAttribute('style','cursor:progress');
			infra.loader.show();
		});
		infra.on('end', function() {
			html.setAttribute('style','cursor:auto');
			infra.loader.hide();
		});
	};
});
}
