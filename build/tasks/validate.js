/*jshint node: true */
'use strict';

function validateProperties(actual, expected, objName, error) {
	for (var prop in actual) {
		if (!expected.hasOwnProperty(prop)) {
			error('Invalid "' + prop + '" property on ' + objName);
		} else if (expected[prop]) {
			if (typeof(actual[prop]) !== expected[prop]) {
				error('The "' + prop + '" property must be a ' + expected[prop]);
			}
		}
	}
}


module.exports = function (grunt) {
	grunt.registerMultiTask('validatechecks', function() {

		var checksSeen = {};

		var success = true;
		this.files.forEach(function (f) {
			f.src.forEach(function(filepath) {
				var error = function (msg) {
					grunt.log.error(filepath + ': ' + msg);
					success = false;
				};

				//verify legit JSON
				var check;
				try {
					check = grunt.file.readJSON(filepath);
				} catch (e) {
					error('Invalid JSON');
					return;
				}

				//verify that mandatory elements are there
				if (!check.id) { error('Missing required "id" property'); }
				if (!check.metadata) { error('Missing required "metadata" property'); }
				if (!check.metadata.failureMessage) { error('Missing required "metadata.failureMessage" property'); }
				if (!check.evaluate) { error('Missing required "evaluate" property'); }


				//verify that non-permitted elements aren't there, and all elements are proper type
				validateProperties(check, {
					'id': 'string',
					'evaluate': 'string',
					'after': 'string',
					'url': 'string',
					'selector': 'string',
					'type': 'string',
					'matches': 'string',
					'metadata': 'object',
					'options': null },
					'check',
					error);

				//verify that the check is not a duplicate
				if (check.id) {
					if (checksSeen.hasOwnProperty(check.id)) {
						error('Duplicate check ID: ' + check.id + '. Also in: ' + checksSeen[check.id]);
					} else {
						checksSeen[check.id] = filepath;
					}
				}

				grunt.verbose.ok(filepath + ": Checked");
			});
		});
		return success;
	});


	grunt.registerMultiTask('validaterules', function () {
		var rulesSeen = {};
		var success = true;
		this.files.forEach(function (f) {
			f.src.forEach(function (filepath) {
				var error = function (msg) {
					grunt.log.error(filepath + ': ' + msg);
					success = false;
				};

				//verify legit JSON
				var rule;
				try {
					rule = grunt.file.readJSON(filepath);
				} catch (e) {
					error('Invalid JSON');
					return;
				}

				//verify that mandatory elements are there
				if (!rule.id) { error('Missing required "id" property'); }
				if (!rule.metadata) { error('Missing required "metadata" property'); }
				if (!rule.metadata.help) { error('Missing required "metadata.help" property'); }
				if (!rule.checks) { error('Missing required "checks" property'); }
				if (!rule.tags) { error('Missing required "tags" property'); }

				//verify that non-permitted elements aren't there, and all elements are proper type
				validateProperties(rule, {
					'id': 'string',
					'metadata': 'object',
					'url': 'string',
					'matches': 'string',
					'checks': null,
					'tags': null,
					'selector': 'string',
					'pageLevel': 'boolean',
					'excludeHidden': 'boolean'},
					'rule',
					error);

				//verify that 'tags' is an array of strings
				if (rule.tags) {
					if (!Array.isArray(rule.tags)) {
						error('The "tags" property must be an array');
					} else {
						rule.tags.map(function (t) {
							if (typeof t !== 'string') {
								error('Elements of the "tags" array must be strings');
							}
						});
					}
				}

				//verify that the rule is not a duplicate
				if (rule.id) {
					if (rulesSeen.hasOwnProperty(rule.id)) {
						error('Duplicate rule ID: ' + rule.id + '. Also in: ' + rulesSeen[rule.id]);
					} else {
						rulesSeen[rule.id] = filepath;
					}
				}

				//verify that checks is an array of the right things
				if (rule.checks) {
					if (!Array.isArray(rule.checks)) {
						error('The "checks" property must be an array');
					} else {
						rule.checks.map(function (c) {
							if (typeof c !== 'object' && typeof c !== 'string') {
								error('Elements of the "checks" array must be strings or objects');
							}

							if (typeof c === 'object') {
								if (!c.id) { error('Missing required "id" property on check'); }
								validateProperties(c, {'id': 'string', 'options': null}, 'rules.check', error);
							}
						});
					}
				}

				grunt.verbose.ok(filepath + ": Checked");
			});
		});
		return success;
	});
};
