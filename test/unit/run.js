describe('dqre.run', function () {
	'use strict';

	function createFrames(num, callback) {
		var frame,
			loaded = 0;

		function onLoad() {
			loaded++;
			if (loaded >= (num + 1)) {
				callback();
			}
		}

		for (var i = 0; i < num; i++) {
			frame = document.createElement('frame');
			frame.src = '../mock/frames/e2e.html';

			frame.addEventListener('load', onLoad);
			fixture.appendChild(frame);

		}
		frame = document.createElement('frame');
		frame.src = '../mock/frames/nocode.html';
		frame.addEventListener('load', onLoad);
		fixture.appendChild(frame);
	}

	var fixture = document.getElementById('fixture');

	afterEach(function () {
		fixture.innerHTML = '';
		dqre.audit = null;
	});

	it('should throw if no audit is configured', function () {

		assert.throws(function () {
			dqre.run(document, {});
		}, Error, /^No audit configured/);
	});

	it('should work', function (done) {
		dqre.configure(window.mockAudit);

		createFrames(2, function () {
			dqre.run(document, {}, function () {
				done();
			});

		});
	});

	it('should call audit.after', function (done) {
		var called = false;
		dqre.configure(window.mockAudit);

		dqre.audit.after = function (context, options, results, fn) {
			called = true;
			fn(results);
		};
		createFrames(2, function () {
			dqre.run(document, {}, function () {
				assert.ok(called);
				done();
			});
		});
	});
});
