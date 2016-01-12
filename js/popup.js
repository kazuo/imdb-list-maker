$(function () {
	$('form').on('submit', function (e) {
		e.preventDefault();

		var data = {
			shuffleFirst: $('#shuffle-first-name').is(':checked'),
			shuffleCompany: $('#shuffle-company').is(':checked'),
			emailTemplate: $('#email-template').val(),
			statuses: $('#statuses').val(),
			ticketTypes: $('#ticket-types').val()
		};

		chrome.tabs.query({active: true, currentWindow: true}, function (tabs) {
			chrome.tabs.sendMessage(tabs[0].id, {
				action: "make_list",
				data: data
			});

			// save options on make
			chrome.storage.local.set({settings: data});
		});
	});

	$('#birthday-link').on('click', function (e) {
		var date = new Date();

		e.preventDefault();

		chrome.tabs.create({url: "http://www.imdb.com/search/name?refine=birth_monthday&birth_monthday=" + (date.getMonth() + 1) + '-' + date.getDate()});
	});

	chrome.storage.local.get(null, function (options) {
		var settings;

		options = options || {};
		settings = options.settings || {};

		$('#shuffle-first-name').prop('checked', !!settings.shuffleFirst);
		$('#shuffle-company').prop('checked', !!settings.shuffleCompany);
		$('#email-template').val(settings.emailTemplate || '');
		$('#statuses').val(settings.statuses || '');
		$('#ticket-types').val(settings.ticketTypes || '');
	});
});