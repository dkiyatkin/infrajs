window.exports = {};
window.layer = exports;

exports.test_layer = function(test) {
	var infra = Infra.init()
	infra.index = {
		html: '<div id="base_text"></div>',
		tag: '#base_html',
		tags: {
			'#base_text': { // здесь будет добавлен слэш
				html: '<div id="base_left"></div>',
				childs: {
					'Страницы': {
						tag: '#base_left',
						html: 'state1 ok'
					},
					'Галерея': {
						tag: '#base_left',
						html: 'state2 ok'
					}
				}
			},
			'#noid': {
				html: '123',
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
			})
			infra.check();
		})
		infra.check();
	})
	infra.check();
}
