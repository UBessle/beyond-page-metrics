/**
\file usertiming.js
Plugin to capture user timing
*/

(function() {
var w, d, p;

BOOMR = BOOMR || {};
BOOMR.plugins = BOOMR.plugins || {};

var impl = {
	marks: [],
	measures: [],
	initialized: false,

	captureTimings: function(vars) {
		var res, i, j, found=false, data = {};
		// Check performance.mark
		res = p.getEntriesByType("mark");
		for(i=0; i<res.length; i++) {
			for(j=0; j<impl.marks.length; j++) {
				if(res[i].name === impl.marks[j]) {
					data[res[i].name] = res[i].startTime;
					found=true;
				}
			}
		}

		// Check performance.measure
		res = p.getEntriesByType("measure");
		for(i=0; i<res.length; i++) {
			for(j=0; j<impl.measures.length; j++) {
				if(res[i].name === impl.measures[j]) {
					data[res[i].name] = res[i].startTime + ":" + res[i].duration;
					found=true;
				}
			}
		}

		if(found) {
			BOOMR.addVar(data);
		}

		// No need to call sendBeacon since this method is called from before_beacon
	}
};

BOOMR.plugins.UT = {
	init: function(config) {
		var i, properties = ["marks", "measures"];

		BOOMR.utils.pluginConfig(impl, config, "UT", properties);

		w = BOOMR.window;
		d = w.document;
		p = w.performance;

		if (impl.initialized) {
			return this;
		}

		BOOMR.subscribe("before_beacon", impl.captureTimings, null, impl);

		return this;
	},

	is_complete: function() {
		return true;	// since we do all our work in before_beacon, we will always return true
	}
};

}());
