(function() {
	var layer = function() {
		var infra = this;

		// скрыть слой и всех его потомков
		var hideLayer = function(layer) {
			layer.show = false; // отметка что слой скрыт
			layer.status = 'hidden'; // убираем из цикла
			if (layer.childs) {
				var i = layer.childs.length;
				for (; --i >= 0;) {
					hideLayer(layer.childs[i]);
				}
			}
			// очищаем место слоя
			if (infra.existLayerNode(layer.node)) {
				infra.pasteNode(layer.node, '');
			}
		};
/*
 * Проверяет равенство узлов.
 *
 * @param {Object} node1 Первый DOM-узел для сравнения.
 * @param {Object} node1 Второй DOM-узел для сравнения.
 * @return {Boolean} Возвращает **true** если узлы равны.
 */
		infra.eqLayerNodes = function(node1, node2) {
			if (node1 == node2) { return true; }
		};
		// Скрыть слои которые замещает переданный слой, убрать их из цикла
		//
		// Правила:
		// переданный слой обязательно будет показан, и не может быть скрыт в этом infra.check
		// в показанном слое не могут быть дочерние слои
		//
		var hideLayers = function(layer) {
			// если слой-родитель скрывается, то все его дети уже не могут показаться, за исключением текущего и его потомков
			//layer.node = infra.getLayerNode(layer); // есть
			var i;
			for (i = infra.layers.length; --i >= 0;) {
				if (infra.layers[i].show) {
					infra.layers[i].node = infra.getLayerNode(infra.layers[i]);
					// или такой же или посмотреть есть ли node слоя в текущем слое
					if (infra.eqLayerNodes(infra.layers[i].node, layer.node) || infra.existLayerNode(layer.node, infra.layers[i])) {
						hideLayer(infra.layers[i]);
					}
				}
			}
		};
		// Загрузиться и вставиться
		//
		// даже если слой не сможет загрузить свои данные, он не может не показаться, какие бы ошибки в нем не были,
		// слой в любом случае покажется, если ошибки есть, то пустым
		//
		// Правила:
		// У слоя должно быть место чтобы вставиться
		// Если в слое ошибка, появиться пустой слой
		var insert = function(layer, cb) {
			setTimeout(function() { // здесь в любом случае должна быть ассинхронность
				if (infra.circle.interrupt) {
					infra.log.debug('check interrupt 1');
					cb();
				} else {
					infra.emit('external', layer, function() {
						layer.oncheck(function() { // сработает у всех слоев которые должны быть показаны
							layer.status = 'insert';
							if (!layer.show) {
								infra.emit('insert', layer, function(err) {
									if (err) {
										infra.log.error('layer can not be inserted', layer.id);
										layer.status = 'wrong insert';
										cb();
									} else {
										if (infra.circle.interrupt) {
											infra.log.debug('check interrupt 2');
											cb();
										} else {
											infra.pasteNode(layer.node, layer.htmlString);
											layer.show = true;
											layer.onshow(cb);
										}
									}
								});
							} else { cb(); }
						});
					});
				}
			}, 1);
		};
		infra.on('layer', function(layer, num, layers_length) {
			if (infra.circle.state) {
				if (infra.circle.first) {
					layer.status = 'queue'; // в первом круге все помещаем в очередь
					// совпавшее состояние слоя, может быть не полностью равным infra.circle.state
					var re = new RegExp('^'+layer.state,'im');
					layer.reg_state = infra.circle.state.match(re);
				}
				// Пойти на проверки, вернуть в очередь
				if (infra.checkLayer(layer)) { // показанные слои заходят, так как для них тоже нужно забить места
					// Изменить условия проверок для других слоев, занимаем тэги
					infra.circle.occupied[layer.tag] = layer;
					// Скрыть и убрать из цикла те слои, которые будут замещены вставленным слоем
					if (!layer.show) { hideLayers(layer); } // этот слой может быть показан с прошлого infra.check
					// Вставиться
					infra.circle.loading++; // отправит infra.check в бесконечный цикл, пока не закончится insert
					insert(layer, function() {
						infra.circle.loading--; // выведет infra.check из бесконечного цикла
					});
				}
				// Если слой показан, и не прошел проверки, но ни один другой слой его не скрыл, слой все равно должен скрыться
				if (layer.show && (layer.status == 'queue')) {
					if (infra.circle.last) { // не в первый круг, и когда кончились загрузки
						hideLayer(layer);
						infra.circle.last = false;
					}
				}
			} else {
				infra.log.info('no set circle.state');
			}
		});
	};
	if (typeof Infra !== "undefined") {
		Infra.ext(layer);
	}
	if (typeof module !== "undefined" && module.exports) {
		module.exports.layer = layer;
	}
})();
