window.exports = {};
window.loader = exports;
exports.loaderShowHide = function(test) {
	var infra = Infra.init();
	test.expect(2);
	test.ok(infra.loader.show(), 'show loader');
	test.ok(infra.loader.hide(), 'hide loader');
	test.done();
};
