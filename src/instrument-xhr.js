function instrumentXHR()
{
	var proxy_XMLHttpRequest,
	    orig_XMLHttpRequest = window.XMLHttpRequest,
	    readyStateMap;

	if (!orig_XMLHttpRequest) {
		// Nothing to instrument
		return;
	}

	readyStateMap = [ "uninitialized", "open", "responseStart", "domInteractive", "responseEnd" ];

	// We could also inherit from window.XMLHttpRequest, but for this implementation,
	// we'll use composition
	proxy_XMLHttpRequest = function() {
		var req, perf = { timing: {}, resource: {} }, orig_open, orig_send;

		req = new orig_XMLHttpRequest;

		orig_open = req.open;
		orig_send = req.send;

		req.open = function(method, url, async) {
			if (async) {
				req.addEventListener('readystatechange', function() {
					perf.timing[readyStateMap[req.readyState]] = new Date().getTime();
				}, false);
			}

			req.addEventListener('load', function() {
				perf.timing["loadEventEnd"] = new Date().getTime();
				perf.resource.status = req.status;
			}, false);
			req.addEventListener('timeout', function() { perf.timing["timeout"] = new Date().getTime(); }, false);
			req.addEventListener('error', function() { perf.timing["error"] = new Date().getTime(); }, false);
			req.addEventListener('abort', function() { perf.timing["abort"] = new Date().getTime(); }, false);

			perf.resource.name = url;
			perf.resource.method = method;

			// call the original open method
			return orig_open.apply(req, arguments);
		};

		req.send = function() {
			perf.timing["requestStart"] = new Date().getTime();

			// call the original send method
			return orig_send.apply(req, arguments);
		};

		req.performance = perf;

		return req;
	};

	window.XMLHttpRequest = proxy_XMLHttpRequest;
}
