(function() {
	var checkLayer = function() {
		var infra = this;
		var isPasted = function(layer) {
			layer.node = infra.getLayerNode(layer);
			if (infra.existLayerNode(layer.node)) {
				return true;
			}
		};
		// Проверяет наличие занятых дочерних и родительских тэгов
		var stateOk = function(layer) {
			// state устраивает или нет
			// возможно более первый state сюда не успел попасть, поэтому их нужно даждаться
			// TODO: Сделать по возрастанию совпадения, а не любое следующее
			if (infra.circle.last) { // не в первый круг, и когда кончились загрузки
				if (layer.reg_state && layer.reg_state[0]) {
					if (infra.circle.state == layer.reg_state[0]) { return true; }
					if ((infra.circle.count != 1) && (infra.circle.loading === 0)) {
						//infra.log.debug('match wait state');
						return true;
					}
					infra.circle.last = false; // совпадения по state есть, значит круг будет не последний
				}
			}
		};

/*
 * Проверяет есть ли данный узел в DOM.
 *
 * @param {Object} node DOM узел.
 * @param {Object} [layer] Если задан слой, то проверяет есть ли его узел **child_node** в переданом **node**.
 */
		infra.existLayerNode = function(node, layer) {
			if (!layer) {
				if (node && (node.length !== 0 || node.length === undefined)) { // смотрим есть ли он в DOM
					return true;
				} else {
					return false;
				}
			} else {
				var child_node;
				var occupied = false;
				if (node.length) {
					var i;
					for (i = node.length; --i >= 0;) {
						child_node = infra.getLayerNode(layer, node[i]);
						if (infra.existLayerNode(child_node)) {
							occupied = true;
							break;
						}
					}
					if (occupied) { return occupied; }
				} else {
					child_node = infra.getLayerNode(layer, node);
					if (infra.existLayerNode(child_node)) {
						occupied = true;
					}
				}
				return occupied;
			}
		};
		// если родитель скрыт, то и слой показаться не может
		var busyTag = function(layer) {
			if (infra.circle.occupied[layer.tag]) {
				return true;
			} else {
				return false;
			}
		};
		var busyTags = function(layer) {
			//layer.node = infra.getLayerNode(layer); // уже есть
			var tag;
			for (tag in infra.circle.occupied) { if (infra.circle.occupied.hasOwnProperty(tag)) {
				// дочерние тэги
				if (infra.existLayerNode(layer.node, infra.circle.occupied[tag])) {
					//infra.log.debug(layer.tag + '	' + layer.state + '	' + layer.show + '	' + layer.status + ' busy child tag ' + tag);
					return true;
				}
				// родительские тэги, зачем их проверять?
				//infra.circle.occupied[tag].node = infra.getLayerNode(infra.circle.occupied[tag]);
				//if (_occupied(infra.circle.occupied[tag].node, layer)) {
				//return true;
				//}
			}}
		};
		var _checkLayer = function(layer) {
			if (layer.parent && !layer.parent.show) {
				return 'no parent';
			}
			if (busyTag(layer)) {
				return 'busy tag ' + layer.tag;
			}
			if (!isPasted(layer)) { // вставляется ли слой
				return 'not inserted';
			}
			// посмотреть нет ли в текущем тэге каких-либо занятых тэгов
			if (!layer.show) { // у показанного слоя вполне себе могут быть заняты дочерние тэги
				if (busyTags(layer)) {
					return 4;
				}
			}
			// подходит ли state
			if (!stateOk(layer)) {
				return 'state mismatch';
			}
			return true;
		};

/*
 * Возвращает DOM-узел переданного слоя.
 *
 * @param {Object} layer Описание слоя.
 * @param {Object} [parent_element] Узел в котором бдет происходить поиск. Если не задан, то берется window.document.
 */
		infra.getLayerNode = function(layer, parent_element) {
			if (!parent_element) { parent_element = document; }
			var tag = layer.tag;
			if (!tag) {
				infra.log.warning('error set node, where layer.state ' + layer.state);
				return;
			}
			var node = false;
			var selector = tag.slice(1);
			if (tag[0] == '#') {
				if (parent_element == document) {
					node = document.getElementById(selector);
				} else {
					var child_elements = parent_element.getElementsByTagName('*');
					var i;
					for (i = child_elements.length; --i >= 0;) {
						if (selector == child_elements[i].id) {
							node = child_elements[i];
						}
					}
				}
			} else if (tag[0] == '.') {
				node = parent_element.getElementsByClassName(selector);
			} else {
				node = parent_element.getElementsByTagName(tag);
			}
			return node;
		};
/*
 * Проверяет слой, может ли он быть вставлен, возвращает в очередь при неудаче.
 *
 * Если **layer.status** равен shows и есть такой node, то это этот самый слой. Если слой будет замещен где то в одном из тэгов, то он скрывается во всех. Слой сначала скрывается, а потом на его пустое место вставляется другой.
 *
 * @param {Object} layer Описание слоя.
 */
		infra.checkLayer = function(layer) {
			if (layer.status != 'queue') { return false; }
			// проверка условий слоя, если не проходит, то слой отправляется в queue
			layer.status = 'check';
			layer.check = _checkLayer(layer);
			if (layer.check !== true) {
				// TODO: придумать имя или индификатор слоя, а то хз про какой речь идет
				//log(layer.tag, '	',layer.state,layer.reg_state, '	', layer.show, '	', layer.status, '	CIRCLE:', infra.circle.count, infra.circle.num, infra.circle.first, infra.circle.loading);
				//infra.log.debug('bad _checkLayer: ' + layer.check);
				if (layer.show) {
					//infra.log.debug('layer should be hidden: ' + layer.check);
				}
				layer.status = 'queue';
				return false; // возвращаем в очередь
			} else { return true; }
		};
	};
	if (typeof Infra !== "undefined") {
		Infra.ext(checkLayer);
	}
	if (typeof module !== "undefined" && module.exports) {
		module.exports.checkLayer = checkLayer;
	}
})();
