if (typeof window !== "undefined") {
(function() {
	Infra.ext(function() {
		var infra = this;
/*
 * Объект содержит методы для определения используемого браузера.
 *
 * Примеры:
 *
 *		infra.browser.ie // вернет цифру, номер версии браузера, елси используется Internet Explorer или 0
 *		infra.browser.opera // вернет положительное значение если используется Opera
 *		infra.browser.chrome // true если используется Chrome
 *		infra.browser.webkit // true если используется WebKit
 *		infra.browser.safari // true если используется Safari
 */
		infra.browser = {};
		this.browser.IE = (function () {
			if (window.opera) {
				return false;
			}
			var rv = 0;
			if (navigator.appName == 'Microsoft Internet Explorer') {
				var ua = navigator.userAgent;
				var re = new RegExp("MSIE ([0-9]{1,}[.0-9]{0,})");
				//var re = new RegExp("MSIE ([0-9]{1,}[\.0-9]{0,})");
				if (re.exec(ua) !== null) {
					rv = parseFloat(RegExp.$1);
				}
			}
			return rv;
		})();
		this.browser.opera = /opera/.test(navigator.userAgent) || window.opera;
		this.browser.chrome = /Chrome/.test(navigator.userAgent);
		this.browser.webkit = /WebKit/.test(navigator.userAgent);
		this.browser.safari = (this.browser.webkit && !this.browser.chrome);
	});
})();
}
