window.exports = {};
window.checkLayer = exports;

exports.test_check_layer = function(test) {
	var infra = Infra.init();
	infra.index = {
		html: '<div id="base_text"></div>',
		tag: '#base_html',
		states: {
			'Страница': { // здесь будет добавлен слэш
				html: 'path/to/tpl2',
				tag: '#noid'
			}
		}
	};
	infra.state = '/';
	infra.removeAllListeners('layer');
	infra.check(); // собрать layers
	infra.circle.last = true;
	test.expect(4);
	infra.on('end', function() {
		test.done();
	});
	infra.layers[0].reg_state = infra.circle.state.match(new RegExp('^'+infra.layers[0].state,'im'));
	infra.layers[1].reg_state = infra.circle.state.match(new RegExp('^'+infra.layers[1].state,'im'));
	//console.log(infra.layers[0].reg_state, infra.layers[1].reg_state);
	//console.log(infra.layers[0].state, infra.layers[1].state);
	test.ok(!infra.checkLayer(infra.layers[0]), 'status queue');
	infra.layers[0].status = 'queue';
	infra.layers[1].status = 'queue';
	test.strictEqual(infra.checkLayer(infra.layers[0]), true, infra.layers[0].check);
	infra.layers[0].show = true;
	test.ok(!infra.checkLayer(infra.layers[1]), 'status queue 2');
	test.strictEqual(infra.layers[1].check, 'not inserted', 'not inserted');
};
