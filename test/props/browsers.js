window.browsers = {
	'test_browser': function(test) {
		var infra = Infra.init();
		test.expect(1);
		if (infra.browser.IE) test.equal(typeof(infra.browser.IE), 'number', 'ie');
		if (infra.browser.opera) test.ok(infra.browser.opera, 'opera');
		if (infra.browser.safari) test.ok(infra.browser.safari, 'safari');
		if (infra.browser.chrome) test.ok(infra.browser.chrome, 'chrome');
		test.done();
	}
}
