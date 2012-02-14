window.exports = {};
window.load = exports;

exports.load_file = function(test) {
	test.expect(3);
	var infra = Infra.init();
	var text_file = '/infra/plugins/infrajs/test/README'
	infra.load(text_file, function(err, data) {
		test.ok(!err, 'errors');
		test.equal(data.split(' ')[0], '#Проверка', 'simple text load');
		test.equal(infra.load.cache.text[text_file], data, 'check cache');
		test.done();
	});
}
