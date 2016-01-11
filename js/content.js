chrome.runtime.onMessage.addListener(function(request) {
	console.log(request);
	if (request.action === "make_list") {
		makeList(request.data);
	} else if (request.action === "open_tab") {
		chrome.tabs.create({url: request.url});
	}
});

function makeList(options)
{
	options = options || {};

	var $table = $('#main table.results')
		, data = {first: [], last: [], email: [], position: [], company: [], other: [], tickettype: [], status: []}
		, tmpDeck
		, csv = "data:text/csv;charset=utf-8,"
		, lines = [['First', 'Last', 'Email', 'Position', 'Company', 'Other']]
		, link = document.createElement('a')
		, prepareEmailName
		, rowCount = 0
		, statusesLength = 0
		, ticketTypesLength = 0
		, urlParameters = {}
		, r
		;

	if (options.ticketTypes && typeof options.ticketTypes === 'string') {
		options.ticketTypes = options.ticketTypes.split(',').map(function (elem) {
			return elem.trim();
		});
	}

	if (options.statuses && typeof options.statuses === 'string') {
		options.statuses = options.statuses.split(',').map(function (elem) {
			return elem.trim();
		});
	}

	options.emailTemplate = options.emailTemplate || "{$name}@test.eventfarm.com";

	if (options.ticketTypes && options.ticketTypes.length) {
		lines[0].push('Ticket Type');
		ticketTypesLength = options.ticketTypes.length;
	}

	if (options.statuses && options.statuses.length) {
		lines[0].push('Status');
		statusesLength = options.statuses.length;
	}

	// force lower case and get rid of any dots at the start or end of the string
	prepareEmailName = function (name) {
		name = name.toLowerCase();

		if (name.substr(0, 1) === '.') {
			name = name.substr(1);
		}

		if (name.substr(-1) === '.') {
			name = name.substr(0, name.length - 1);
		}

		return name;
	};

	// gather data
	$table.find('td.name').each(function (i, element) {
		var name = $(element).find('> a').text().trim()
			, parts = name.split(' ')
			, description = $(element).find('.description').text().split(',')
			, position = description[0] ? String(description[0]).trim() : ''
			, company = description[1] ? String(description[1]).trim(): ''
			, email = options.emailTemplate.replace('{$name}', parts.map(prepareEmailName).join('.'))
			, last = parts.pop()
			, first = parts.join(' ')
			, nameHref = $(element).find('> a').attr('href').split('/')
			, other = nameHref[2] ? String(nameHref[2]).trim() : ''
			;

		data.first.push(first);
		data.last.push(last);
		data.email.push(email);
		data.other.push(other);
		data.company.push(company);
		data.position.push(position);

		if (ticketTypesLength) {
			data.tickettype.push(options.ticketTypes[Math.floor(Math.random() * (ticketTypesLength))])
		}

		if (statusesLength) {
			data.status.push(options.statuses[Math.floor(Math.random() * (statusesLength))]);
		}

		rowCount++;
	});

	// post process any data
	if (options.shuffleCompany) {
		shuffleArray(data.company);
	}

	if (options.shuffleFirst) {
		// attempt to keep the position with the first name just to make the data make a bit more sense
		tmpDeck = [];

		for (r = 0; r < rowCount; r++) {
			tmpDeck.push({
				first: data.first[r],
				position: data.position[r]
			});
		}

		shuffleArray(tmpDeck);

		for (r = 0; r < rowCount; r++) {
			data.first[r] = tmpDeck[r].first;
			data.position[r] = tmpDeck[r].position;
		}
	}

	// create lines
	for (r = 0; r < rowCount; r++) {
		var line = [
			data.first[r],
			data.last[r],
			options.emailTemplate.replace('{$name}', [data.first[r], data.last[r]].join(' ').split(' ').map(prepareEmailName).join('.')),
			data.position[r],
			data.company[r],
			data.other[r]
		];

		if (ticketTypesLength) {
			line.push(data.tickettype[r]);
		}

		if (statusesLength) {
			line.push(data.status[r]);
		}

		lines.push(line.join(','));
	}

	window.location.href.split('?').pop().split('&').forEach(function (element) {
		var pieces = element.split('=');

		urlParameters[pieces[0]] = pieces[1];
	});

	csv += lines.join("\n");
	link.setAttribute('href', encodeURI(csv));
	link.setAttribute(
		'download',
		'IMdb-' + (urlParameters['birth_monthday'] ? urlParameters['birth_monthday'] : urlParameters['birth_month'] + '-' + urlParameters['birth_day'])
		+ ((ticketTypesLength || statusesLength) ? '-guest-list' : '-group') + '-'
		+ parseInt($table.find('tr.detailed:first .number').text()) + '_' + parseInt($table.find('tr.detailed:last .number').text())
		+ '.csv'
	);
	//link.style = "visibility:hidden";
	//document.body.appendChild(link);
	link.click();
	//document.body.removeChild(link);
}

// http://bost.ocks.org/mike/shuffle/
function shuffleArray(array)
{
	var m = array.length, t, i;

	// While there remain elements to shuffle...
	while (m) {
		// Pick a remaining element…
		i = Math.floor(Math.random() * m--);

		// And swap it with the current element.
		t = array[m];
		array[m] = array[i];
		array[i] = t;
	}

	return array;
}