/*jshint node: true, camelcase: false */


module.exports = function (grunt) {
	'use strict';

	grunt.loadNpmTasks('grunt-contrib-watch');
	grunt.loadNpmTasks('grunt-contrib-concat');
	grunt.loadNpmTasks('grunt-contrib-connect');
	grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.loadNpmTasks('grunt-blanket-mocha');
	grunt.loadTasks('build/tasks');

	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),

		watch: {
			files: ['test/**/*'],
			tasks: ['fixture', 'build']
		},
		rules: {
			lib: {
				dest: {
					rules: 'dist/rules.js',
					full: 'dist/rules.full.js',
					checks: 'dist/checks.js'
				}
			}
		},
		uglify: {
			minify: {
				files: [{
					src: ['<%= rules.lib.dest.rules %>'],
					dest: 'dist/rules.min.js'
				}, {
					src: ['<%= rules.lib.dest.full %>'],
					dest: 'dist/rules.full.min.js'
				}, {
					src: ['<%= rules.lib.dest.checks %>'],
					dest: 'dist/checks.min.js'
				}]
			},
			beautify: {
				files: [{
					src: ['<%= rules.lib.dest.rules %>'],
					dest: '<%= rules.lib.dest.rules %>'
				}, {
					src: ['<%= rules.lib.dest.full %>'],
					dest: '<%= rules.lib.dest.full %>'
				}, {
					src: ['<%= rules.lib.dest.checks %>'],
					dest: '<%= rules.lib.dest.checks %>'
				}],
				options: {
					mangle: false,
					compress: false,
					beautify: true
				}
			}
		},
		connect: {
			test: {
				options: {
					hostname: '0.0.0.0',
					port: 9876,
					base: ['.']
				}
			}
		},
		fixture: {
			checks: {
				src: '<%= rules.lib.dest.checks %>',
				dest: 'test/checks/index.html',
				options: {
					fixture: 'test/checks/runner.tmpl',
					testCwd: 'test/checks'
				}
			},
			rules: {
				src: '<%= rules.lib.dest.rules %>',
				dest: 'test/rules/index.html',
				options: {
					fixture: 'test/rules/runner.tmpl',
					testCwd: 'test/rules'
				}
			}
		},
		blanket_mocha: {
			source: {
				options: {
					urls: [
						'http://localhost:9876/test/unit',
						'http://localhost:9876/test/integration'
					],
					reporter: grunt.option("reporter") || (process.env.XUNIT_FILE ? 'xunit-file' : 'Spec'),
					timeout: 10000,
					threshold: 90
				}
			}
		}
	});

	grunt.registerTask('server', ['fixture', 'connect:test:keepalive']);
	grunt.registerTask('test', ['fixture', 'connect:test', 'blanket_mocha']);
	grunt.registerTask('build', ['rules', 'uglify']);
	grunt.registerTask('default', ['build']);

};