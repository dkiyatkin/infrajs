/**
* Объект Infra содержит методы для создания и расширения контроллера слоев.
*/
var Infra = {

/**
* Создает новый контроллер **infra**.
*
* Примеры:
*
*		infra = Infra.init();
*
* @return {Object} infra Контроллер слоев.
* @receiver Infra
*/
	init: function() {
		var supportsHistoryAPI=!!(window.history && history.pushState && history.replaceState); // =true если поддерживается, иначе =false
		//if (window.console && window.console.log) {
			if ([].indexOf) {
				if (supportsHistoryAPI) {
					// Откомпилировать слой, считать статусы
					return {
						layers: [] // готовые слои
					};
				} else {
					throw 'HTML5 History API not supported';
				}
			} else {
				throw 'Array indexOf not supported';
			}
		//}
	},

/**
* Расширяет, переопределяет и дополняет **Infra.init**.
*
* Примеры:
*
*		Infra.ext(function() {
*			this.value = 2;
*		})
*		var infra = Infra.init();
*		console.log(infra.value); // 2
*
* @param {Function} prop Функция добавляющая новые свойства для контроллера.
* @receiver Infra
 */
	ext: function(cb) {
		var init = this.init;
		this.init = function() {
			var infra = init.apply(this, arguments);
			cb.apply(infra, arguments);
			//infra.constructor = arguments.callee;
			return infra;
		};
	}
};
if (typeof module !== "undefined" && module.exports) {
	Infra.init = function() {
		return {
			layers: []
		};
	};
	module.exports = Infra;
}
