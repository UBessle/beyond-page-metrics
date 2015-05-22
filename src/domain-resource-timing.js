function getAverageDurationForDomains(domains) {
	var entries = window.performance.getEntriesByType("resource");
	var result = {
		total: 0,
		count: 0,
		domains: {}
	};

	for (var entry = 0; entry < entries.length; entry++) {
		var split = entries[entry].name.split("://");
		var resourceName = split[split.length - 1];

		for (var domain = 0; domain < domains.length; domain++) {
			if (resourceName.indexOf(domains[domain]) === 0) {
				result.count++;
				result.total += entries[entry].duration;

				result.domains[domains[domain]] = result.domains[domains[domain]] ||
					{
						total: 0,
						count: 0
					};
				result.domains[domains[domain]].count++;
				result.domains[domains[domain]].total += entries[entry].duration;
			}
		}
	}

	function calcAverage(o) {
		o.average = o.total / o.count;
	}

	calcAverage(result);
	//console.log("average:" + result.average);

	for (var domainName in result.domains) {
		calcAverage(result.domains[domainName]);
		//console.log(domainName + ":" + result.domains[domainName].average);
	}

	return result;
}
