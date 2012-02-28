window.exports = {};
window.layer = exports;

exports.test_bad_layer = function(test) {
	test.expect(2);
	var infra = Infra.init();
	infra.index = {
		HTML: 'adf',
		tag: '#base_html',
		label: 'error_layer wow',
		id: '213'
	};
	infra.state = '/';
	infra.once('end', function() {
		test.equal(infra.labels.wow[0].status, 'wrong insert', 'labels');
		test.equal(infra.ids['213'], infra.layers[0], 'ids');
		test.done();
	});
	infra.check();
};

exports.test_layer = function(test) {
	test.expect(1);
	var infra = Infra.init();
	infra.index = {
		htmlString: '<div id="base_text"></div>',
		tag: '#base_html'
	};
	infra.state = '/';
	infra.once('end', function() {
		test.equal(infra.ids.length, infra.layers[0].length, 'ids length');
		test.done();
	});
	infra.check();
};

exports.test_layer2 = function(test) {
	var infra = Infra.init();
	infra.index = {
		htmlString: '<div id="base_text"></div>',
		tag: '#base_html',
		tags: {
			'#base_text': { // здесь будет добавлен слэш
				htmlString: '<div id="base_left"></div>',
				states: {
					'Страницы': {
						tag: '#base_left',
						htmlString: 'state1 ok'
					},
					'Галерея': {
						tag: '#base_left',
						htmlString: 'state2 ok'
					}
				}
			},
			'#noid': {
				htmlString: '123'
			}
		}
	};
	test.expect(15);
	infra.state = '/Страницы/';
	infra.once('end', function() {
		test.ok(infra.layers[0].show, 'layer 0 show');
		test.ok(infra.layers[1].show, 'layer 1 show');
		test.ok(infra.layers[2].show, 'layer 2 show');
		test.ok(!infra.layers[3].show, 'layer 3 not show');
		test.ok(!infra.layers[4].show, 'layer 4 not show');
		infra.state = '/Галерея/';
		infra.once('end', function() {
			test.ok(infra.layers[0].show, 'layer 0 show');
			test.ok(infra.layers[1].show, 'layer 1 show');
			test.ok(!infra.layers[2].show, 'layer 2 not show');
			test.ok(infra.layers[3].show, 'layer 3 show');
			test.ok(!infra.layers[4].show, 'layer 4 not show');
			infra.state = '/';
			infra.once('end', function() {
				test.ok(infra.layers[0].show, 'layer 0 show');
				test.ok(infra.layers[1].show, 'layer 1 show');
				test.ok(!infra.layers[2].show, 'layer 2 not show');
				test.ok(!infra.layers[3].show, 'layer 3 not show');
				test.ok(!infra.layers[4].show, 'layer 4 not show');
				test.done();
			});
			infra.check();
		});
		infra.check();
	});
	infra.check();
};
