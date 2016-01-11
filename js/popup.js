$(function () {
	$('form').on('submit', function (e) {
		e.preventDefault();

		chrome.tabs.query({active: true, currentWindow: true}, function (tabs) {
			chrome.tabs.sendMessage(tabs[0].id, {
				action: "make_list",
				data: {
					shuffleFirst: $('#shuffle-first').is(':checked'),
					shuffleCompany: $('#shuffle-company').is(':checked'),
					emailTemplate: $('#email-template').val(),
					statuses: $('#statuses').val(),
					ticketTypes: $('#ticket-types').val()
				}
			});
		});
	});

	$('#birthday-link').on('click', function (e) {
		var date = new Date();

		e.preventDefault();

		chrome.tabs.query({active: true, currentWindow: true}, function (tabs) {
			/*chrome.tabs.sendMessage(tabs[0].id, {
				action: "open_tab",
				url: "http://www.imdb.com/search/name?refine=birth_monthday&birth_monthday=" + (date.getMonth() + 1) + '-' + date.getDate()
			});*/
			chrome.tabs.create({url: "http://www.imdb.com/search/name?refine=birth_monthday&birth_monthday=" + (date.getMonth() + 1) + '-' + date.getDate()});
		});
	});

	// defaults
	$('#email-template').val("{$name}@test.eventfarm.com");
});