(function () {
	'use strict';

	angular.module('app.ListMaker', []).controller('ListMakerCtrl', [
		'$q', '$scope',
		function ($q, $scope) {
			var vm = this;

			angular.extend(vm, {
				make: make,
				openBirthdayLink: openBirthdayLink,
				settings: {},
				scrape: scrape,
				scrapeAndDownload: scrapeAndDownload,
				scrapeAndNextPage: scrapeAndNextPage,
				submit: angular.noop,
				form: {}
			});

			initialize();

			//////////////////////////////////////////// controller methods ////////////////////////////////////////////

			/**
			 * Sends the event to the content page to download the list with the given data
			 * @param {object} data
			 */
			function download(data)
			{
				chrome.tabs.query({active: true, currentWindow: true}, function (tabs) {
					chrome.tabs.sendMessage(tabs[0].id, {
						action: "download",
						data: data
					});
				});
			}

			/**
			 * Initializes the controller
			 */
			function initialize()
			{
				chrome.storage.local.get(null, function (options) {
					options = options || {};

					angular.forEach(options.settings, function (setting, key) {
						vm.settings[key] = setting;
					});

					$scope.$applyAsync();
				});
			}

			/**
			 * Sends the event to the content page to parse the current IMDb birthday page and downloads the list
			 * @returns {Promise}
			 */
			function make()
			{
				var deferred = $q.defer();

				chrome.tabs.query({active: true, currentWindow: true}, function (tabs) {
					chrome.tabs.sendMessage(tabs[0].id, {
						action: "make_list",
						deferred: deferred,
						data: vm.settings
					});
				});

				chrome.storage.local.set({settings: vm.settings});

				return deferred.promise;
			}

			/**
			 * Sends the event to content page to go to the next page
			 */
			function nextPage()
			{
				chrome.tabs.query({active: true, currentWindow: true}, function (tabs) {
					chrome.tabs.sendMessage(tabs[0].id, {
						action: "next_page"
					});
				});
			}

			function openBirthdayLink()
			{
				var date = new Date();

				chrome.tabs.create({url: "http://www.imdb.com/search/name?refine=birth_monthday&birth_monthday=" + (date.getMonth() + 1) + '-' + date.getDate()});
			}

			/**
			 * Sends the event to the content page to parse the current IMDb birthday page
			 */
			function scrape()
			{
				var deferred = $q.defer();

				chrome.tabs.query({active: true, currentWindow: true}, function (tabs) {
					chrome.tabs.sendMessage(tabs[0].id, {
						action: "scrape_list",
						data: vm.settings
					}, function (response) {
						deferred.resolve(response.data || {});
					});
				});

				chrome.storage.local.set({settings: vm.settings});

				return deferred.promise.then(function (data) {
					var deferred = $q.defer();

					if (!angular.isObject(data)) {
						return $q.reject({status: 400, statusText: "Invalid data"});
					}

					// get current
					chrome.storage.local.get(null, function (options) {
						options = options || {};

						if (!angular.isObject(options.data)) {
							options.data = {};
						}

						if (angular.equals({}, options.data)) { // no previous data
							options.data = data;
						} else { // append new data
							['company', 'email', 'first', 'last', 'other', 'position', 'status', 'tickettype'].forEach(function (key) {
								if (!angular.isArray(options.data[key])) {
									options.data[key] = [];
								}

								options.data[key] = options.data[key].concat(data[key]);
							});

							options.data.length += data.length;
						}

						// update ending range
						options.data.end = data.end;

						chrome.storage.local.set({data: options.data}, function () {
							deferred.resolve(options.data);
						});
					});

					return deferred.promise;
				});
			}

			function scrapeAndDownload()
			{
				var deferred = $q.defer();

				return scrape().then(function (data) {
					download(data);

					chrome.storage.local.set({data: {}}, function () {
						deferred.resolve(data);
					});

					return deferred.promise;
				});
			}

			function scrapeAndNextPage()
			{
				return scrape().then(function (data) {
					nextPage();

					return data;
				});
			}
		}
	]);

	angular.element(document).ready(function () {
		angular.bootstrap(document, ['app.ListMaker']);
	});
})();