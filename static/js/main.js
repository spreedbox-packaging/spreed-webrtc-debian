/*
 * Spreed WebRTC.
 * Copyright (C) 2013-2014 struktur AG
 *
 * This file is part of Spreed WebRTC.
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 *
 */
require.config({
	waitSeconds: 300,
	paths: {
		// Major libraries
		"text": "libs/require/text",
		"jquery": 'libs/jquery/jquery.min',
		"underscore": 'libs/lodash.min', // alternative to underscore
		"modernizr": 'libs/modernizr',
		'webrtc.adapter': 'libs/webrtc.adapter',
		'angular': 'libs/angular/angular.min',
		'ui-bootstrap': 'libs/angular/ui-bootstrap-tpls.min',
		'ua-parser': 'libs/ua-parser',
		'Howler': 'libs/howler.min',
		'desktop-notify': 'libs/desktop-notify',
		'bigscreen': 'libs/bigscreen.min',
		'moment': 'libs/moment.min',
		'angular-sanitize': 'libs/angular/angular-sanitize.min',
		'angular-animate': 'libs/angular/angular-animate.min',
		'angular-route': 'libs/angular/angular-route.min',
		'angular-humanize': 'modules/angular-humanize',
		'toastr': 'libs/toastr',
		'visibly': 'libs/visibly',
		'avltree': 'libs/avltree',
		'injectCSS': 'libs/jquery/jquery.injectCSS',
		'mobile-events': 'libs/jquery/jquery.mobile-events',
		'jed': 'libs/jed',
		'audiocontext': 'libs/audiocontext',
		'rAF': 'libs/rAF',
		'humanize': 'libs/humanize',
		'sha': 'libs/sha',
		'sjcl': 'libs/sjcl',
		'pdf': 'libs/pdf/pdf',
		'pdf.worker': 'libs/pdf/pdf.worker',
		'pdf.compatibility': 'libs/pdf/compatibility',
		'webodf': 'libs/webodf',
		'bootstrap-file-input': 'libs/bootstrap.file-input',

		'partials': '../partials',
		'sounds': '../sounds',
		'translation': '../translation'
	},
	shim: {
		'modernizr': {
			exports: 'Modernizr'
		},
		'underscore': {
			exports: '_'
		},
		'angular': {
			deps: ['jquery'],
			exports: 'angular'
		},
		'ui-bootstrap': {
			deps: ['angular']
		},
		'desktop-notify': {
			exports: 'notify'
		},
		'bigscreen': {
			exports: 'BigScreen'
		},
		'moment': {
			exports: 'moment'
		},
		'angular-sanitize': {
			deps: ['angular'],
			exports: 'angular'
		},
		'angular-animate': {
			deps: ['angular'],
			exports: 'angular'
		},
		'angular-humanize': {
			deps: ['angular', 'humanize'],
			exports: 'angular'
		},
		'toastr': {
			deps: ['jquery'],
			exports: 'toastr'
		},
		'visibly': {
			exports: 'visibly'
		},
		'avltree': {
			exports: 'AvlTree'
		},
		'injectCSS': {
			deps: ['jquery'],
			exports: '$'
		},
		'mobile-events': {
			deps: ['jquery'],
			exports: '$'
		},
		'sjcl': {
			exports: 'sjcl'
		},
		'pdf': {
			deps: ['pdf.compatibility'],
			exports: 'PDFJS'
		},
		'webodf': {
			exports: 'odf',
			init: function() {
				return {
					webodf: webodf,
					odf: odf,
					runtime: runtime
				};
			}
		},
		'bootstrap-file-input': {
			deps: ['jquery'],
			exports: '$'
		},
	}
});

(function() {
	var debugDefault = window.location.href.match(/(\?|&)debug($|&|=)/);
	// Overwrite console to not log stuff per default.
	// Write debug(true) in console to enable or start with ?debug parameter.
	window.consoleBackup = null;
	window.debug = function(flag) {
		if (!flag) {
			if (window.consoleBackup === null) {
				window.consoleBackup = window.console;
			}
			window.console = {
				log: function() {},
				info: function() {},
				warn: function() {},
				error: function() {},
				debug: function() {},
				trace: function() {}
			}
		} else {
			if (window.consoleBackup) {
				window.console = window.consoleBackup;
			}
		}
	};
	window.debug(debugDefault && true);
}());

require.onError = (function() {
	var retrying = false;
	return function(err) {
		if (retrying) {
			console.error("Error while loading " + err.requireType, err.requireModules);
			return;
		}
		if (err.requireType === "timeout" || err.requireType === "scripterror") {
			alert('Failed to load application. Confirm to retry.');
			retrying = true;
			document.location.reload(true);
		} else {
			throw err;
		}
	};
}());

// Make sure the browser knows ES5.
if (Object.create) {

	define([
		'jquery',
		'underscore',
		'angular',
		'require',
		'base'], function($, _, angular, require) {

		// Dynamic app loader with plugin support.
		var load = ['app'];
		_.each(document.getElementsByTagName('script'), function(script) {
			var dataPlugin = script.getAttribute('data-plugin');
			if (dataPlugin) {
				load.push(dataPlugin);
			}
		});

		require(load, function(App) {

			// All other arguments are plugins.
			var args = Array.prototype.slice.call(arguments, 1);

			// Prepare our promised based initialization.
			var promises = [];
			var loading = $.Deferred();
			promises.push(loading.promise());

			// Add Angular modules from plugins.
			var modules = [];
			_.each(args, function(plugin) {
				if (plugin && plugin.module) {
					plugin.module(modules);
				}
			});

			// External plugin support.
			var externalPlugin;
			if (window.externalPlugin) {
				externalPlugin = window.externalPlugin($, _, angular);
				if (externalPlugin && externalPlugin.module) {
					externalPlugin.module(modules);
				}
			}

			// Create Angular app.
			var app = App.create(modules);

			// Helper function to initialize with deferreds.
			var initialize = function(obj) {
				if (obj && obj.initialize) {
					var result = obj.initialize(app);
					if (result && result.done) {
						// If we got a promise add it to our wait queue.
						promises.push(result);
					}
				}
			};

			// Wait until dom is ready before we initialize.
			angular.element(document).ready(function() {

				// Init base application.
				initialize(App);

				// Init plugins.
				_.each(args, function(plugin) {
					initialize(plugin);
				});

				// Init external plugin.
				if (externalPlugin) {
					initialize(externalPlugin);
				}

				// Resolve the base loader.
				loading.resolve();

				// Wait for all others to complete and then boostrap the app.
				$.when.apply($, promises).done(function() {
					console.log("Bootstrapping ...");
					angular.bootstrap(document, ['app'], {
						strictDi: true
					});
				});

			});

		});

	});

} else {
	alert("Your browser does not support this application. Please update your browser to the latest version.");
}
