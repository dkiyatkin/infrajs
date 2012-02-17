(function() {
	var pasteLayer = function() {
		var infra = this;
		var js_last_unick = 0;// time последней точки
		var js_first_unick = new Date().getTime();// Начало отсчёта для всех точек
		var getUnick = function() { // Возвращаем всегда уникальную метку, цифры
			var m = new Date().getTime();
			m -= js_first_unick; // Отсчёт всего времени идёт с момента загрузки страницы в миллисекундах
			var last_unick = js_last_unick||m;
			while (last_unick >= m) { m++; }
			js_last_unick = m;
			return m;
		};

		// Получить у элемента значение css-свойства
		var getStyle = function(el, cssprop){
			if (el.currentStyle) {//IE
				return el.currentStyle[cssprop];
			} else if (document.defaultView && document.defaultView.getComputedStyle) { //Firefox
				return document.defaultView.getComputedStyle(el, "")[cssprop];
			} else { //try and get inline style
				return el.style[cssprop];
			}
		};

		// вставить html, выполнить css и script или получить весь html, если html не передан
		var html = function(el, html) {
			var res;
			if (html !== undefined) {
				if (/<(style+)([^>]+)*(?:>)/gim.test(html) || /<(script+)([^>]+)*(?:>)/gim.test(html)) {
					this.scriptautoexec = false;
					this.styleautoexec = false;
					var tempid = 'infrahtml' + getUnick(); // Одинаковый id нельзя.. если будут вложенные вызовы будет ошибка
					html='<span id="'+tempid+'" style="display:none">'+ '<style>#'+tempid+'{ width:3px }</style>'+
						'<script type="text/javascript">infra.scriptautoexec=true;</script>'+ '1</span>'+html;
					try {
						res = (el.innerHTML = html);
					} catch(e) {
						el.innerHTML = 'Ошибка, Возможно из-за вставки блочного элемента в строчный или другое какое-то не логичное действие';
					}
					if (!this.scriptautoexec) {
						var scripts = el.getElementsByTagName("script");
						for (var i = 1,script; script = scripts[i]; i++) {
							infra.load.script(script);
						}
					}
					var bug = document.getElementById(tempid);
					if (bug) {
						var b = getStyle(bug, 'width');
						if (b !== '3px') {
							var _css = el.getElementsByTagName("style");
							for (var i = 0,css; css=_css[i]; i++){
								var t = css.cssText; //||css.innerHTML; для IE будет Undefined ну и бог с ним у него и так работает а сюда по ошибке поподаем
								infra.load.styles(t);
							}
						}
						try {
							el.removeChild(bug);
						} catch(e) {
							infra.log.error('Ошибка при удалении временного элемента в pasteLayer html');
						}
					}
				} else {
					return el.innerHTML = html;
				}
			} else {
				res = el.innerHTML;
			}
			return res;
		}

/*
 * Вставляет html в DOM-узел на странице.
 *
 * @param {Object} node DOM-узел в который нужно вставить html.
 * @param {String} html для вставки.
 */
		infra.pasteNode = function(node, htmlString) {
			if (node.length) {
				for (var n=0, ll=node.length; n<ll; n++) {
					html(node[n], htmlString)
				}
			} else {
				html(node, htmlString);
			}
		};
	};
	Infra.ext(pasteLayer);
})();
