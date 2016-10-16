var _gaq = _gaq || [];

(function () {

///////////////////////////////////////////////////////////////////////////////
// Setup
///////////////////////////////////////////////////////////////////////////////
var version = "1.0.5";

Data.def("charge-interval", 10);
Data.def("charge-size", 1);

Data.def("target-block", []);
Data.def("target-allow", []);

Data.def("balance", 0);

_gaq.push(
	["_setAccount", "##GAID##"],
	["_setSessionCookieTimeout", 0],
	["_setCustomVar", 1, "Version", version, 1],
	["_setCustomVar", 2, "ChargeInterval", Data.get("charge-interval").toString(), 1],
	["_setCustomVar", 3, "ChargeSize", Data.get("charge-size").toString(), 1],
	["_trackPageview", "/"]
);

!Data.has("version") && window.open("options.html?firstrun");
Data.set("version", version);

document.body.appendChild(function () {
	var el = document.createElement("script");
	el.src = "https://ssl.google-analytics.com/ga.js";
	return el;
}());


///////////////////////////////////////////////////////////////////////////////
// State
///////////////////////////////////////////////////////////////////////////////
var state = window.state = {
	get balance () {
		return Data.get("balance");
	},
	set balance (v) {
		Data.set("balance", v)
	},
	meter: 0,
	add: {
		id: -1,
		fn: function () {
			var size = Data.get("charge-size");
			var balance = state.balance + size;
			var max = Math.floor((size * (60 / Data.get("charge-interval"))) * 6);
			
			state.balance = Math.min(balance, max);
			state.sync();
		},
		start: function () {
			clearInterval(state.add.id);
			
			state.add.id = setInterval(state.add.fn, 1000 * 60 * Data.get("charge-interval"));
		}
	},
	use: {
		id: null,
		seconds: null,
		fn: function () {
			if (--state.meter === 0) {
				clearInterval(state.use.id);
				state.use.id = null;
				
				checkall();
			}
			
			state.use.display();
		},
		start: function () {
			if (!state.use.id) {
				state.use.id = setInterval(state.use.fn, 1000 * 60);
			}
			
			state.use.seconds = null;
			
			state.use.display();
		},
		display: function () {
			var text = state.meter.toString();
			
			if (text === "0") {
				text = "";
			} else if (text === "1") {
				var seconds = state.use.seconds || 60;
				
				text = "0:" + (seconds < 10 ? 0 : "") + seconds;
				
				if (state.use.seconds = --seconds) {
					setTimeout(state.use.display, 1000);
				}
			}
			
			chrome.browserAction.setBadgeBackgroundColor({ color: state.meter > 1 ? [0, 0, 255, 255] : [255, 0, 0, 255] });
			chrome.browserAction.setBadgeText({ text: text });
			
			state.sync();
		}
	},
	sync: function () {
		chrome.extension.getViews().forEach(function (tab) {
			typeof tab.update === "function" && tab.update();
		});
	}
};

state.add.start();


///////////////////////////////////////////////////////////////////////////////
// Monitoring
///////////////////////////////////////////////////////////////////////////////
var check = function (url, tID) {
	if (state.meter) {
		return;
	}
	
	var block = Data.get("target-block");
	var allow = Data.get("target-allow");
	var uri = new Uri(url);
	var match;
	
	var apply = function (rule) {
		var rule = new Uri(rule);
		var uhost = uri.host();
		var rhost = rule.host();
		var upath = uri.path();
		var rpath = rule.path();
		var index = uhost.indexOf(rhost);
		
		return index !== -1 && index === uhost.length - rhost.length && (index > 0 ? uhost[index - 1] === "." : true)
			&& upath.indexOf(rpath) === 0 && (upath.length > rpath.length ? (rpath.substr(-1) === "/" || upath[rpath.length] === "/") : true);
	};
	
	var matches = block.some(function (rule) {
		match = rule;
		
		return apply(rule) && !allow.some(apply);
	});
	
	matches && chrome.tabs.update(tID, {
		url: "popup.html?" + encodeURIComponent(JSON.stringify({ url: url, rule: match }))
	});
};

var checkall = function () {
	chrome.tabs.query({}, function (tabs) {
		tabs.forEach(function (tab) {
			check(tab.url, tab.id);
		});
	});
};

chrome.tabs.onCreated.addListener(function (tab) {
	tab.url && check(tab.url, tab.id);
});

chrome.tabs.onUpdated.addListener(function (tID, changed, tab) {
	changed.url && check(changed.url, tID);
});

})();