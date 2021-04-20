(function () {

var dd = Data;
var ss = store;

var state = {

	// used by popup.js
	getBalance: async function() {
		let balance = await dd.get("balance");
		return balance;
	},
	// used by popup.js
	//setBalance: async function(v) {
	//	await Data.set("balance", v);
	//},

	getChargeDefaultSpeed: async function() {
		return await Data.get("charge-speed");
	},

	useBalance: async function(amount, speed) {
		let balance = await Data.get("balance");
		
		let newBalance = balance - amount * 60 * speed;
		if( newBalance < 0 ) newBalance = 0;
		await Data.set("balance", newBalance);

		let timeTillAllowed = Math.floor(new Date()/1000) + amount * 60; // allow for Amount minutes, but decrease Balance for Amount*speed minutes
		await Data.set("time-till-allowed", timeTillAllowed);

		console.log('useBalance amount='+amount+' speed='+speed+' timeTillAllowed -> '+timeTillAllowed+' balance '+balance+' -> '+newBalance+' now='+Math.floor(new Date()/1000));
		//state.meter += amount;
				
		state.use.start();
	},

	resetBalance: async function() {
		await Data.set("balance", 0);
		state.sync();
	},

	resetAllowedTime: async function() {
		await Data.set("time-till-allowed", 0);
		state.use.fn();
	},

	getAllowedSeconds: async function() {
		let now = Math.floor( new Date() / 1000 );
		let timeTillAllowed = await Data.get("time-till-allowed");
		let seconds = timeTillAllowed - now;
		if( seconds < 0 ) seconds = 0;
		return seconds;
	},

	//meter: 0,

	add: {
		id: -1,
		fn: async function () {
			if(state.use.id != null) {
				console.log('state.add.fn skip (user is in spending mode)');
				return;
			}
			var size = await Data.get("charge-size");
			var balance = await Data.get("balance");
			var max = await Data.get("charge-max");
			console.log('state.add.fn size=', size, 'balance=',balance,'max=',max);
			balance = balance + size;
			//var max = Math.floor((size * (60 / Data.get("charge-interval"))) * 6);
			//state.balance = Math.min(balance, max);
			if(max>0 && balance>max) {
				balance = max;
			}
			await Data.set("balance", balance);
			console.log('state.add.fn new balance=',balance);
			state.sync();
			//checkall();
		},
		start: async function () {
			// todo: run timer every minute, add charge-size to balance if(now >= Data.timeNextBalanceIncrement) { balance += charge-size; Data.timeNextBalanceIncrement += charge-interval; }
				// OR: timeBalanceIncrementedLastTime,and if(timeBalanceIncrementedLastTime+charge-interval > now) ...
			clearInterval(state.add.id);
//			state.add.id = setInterval(state.add.fn, 1000 * 60 * Data.get("charge-interval"));
			let chargeInterval = await Data.get("charge-interval");
			console.log('state.add.start chargeInterval=', chargeInterval);
			state.add.id = setInterval( state.add.fn, chargeInterval * 1000 );
		}
	},
	use: {
		id: null,
		//seconds: null,
		fn: async function () {
			// setInterval may be every 30-60 seconds, not related to Data.get("charge-interval"), as options can be changed in other browsers and synced

			//state.meter = state.meter - 1; // 1 minute?
			let allowedSeconds = await state.getAllowedSeconds();
			console.log('state.use.fn allowedSecond=',allowedSeconds);
			if (allowedSeconds == 0) { // == 0
				clearInterval(state.use.id);
				state.use.id = null;
				//state.meter = 0;
				checkall();
			}
			state.use.display();
		},

		start: function () {
			if (!state.use.id) {
				state.use.id = setInterval(state.use.fn, 1000 * 60);
			}
			//state.use.seconds = null;
			state.use.display();
		},
		display: async function () {

			var allowedSeconds = await state.getAllowedSeconds();
			if( allowedSeconds > 60 ) {
				let minutes = Math.floor( allowedSeconds / 60 );
				chrome.browserAction.setBadgeBackgroundColor({ color: [0, 0, 255, 255] });
				chrome.browserAction.setBadgeText({ text: ""+minutes });
			} else if( allowedSeconds > 0 ) {
				chrome.browserAction.setBadgeBackgroundColor({ color: [255, 0, 0, 255]  });
				chrome.browserAction.setBadgeText({ text: "0:"+(allowedSeconds<10?'0':'')+allowedSeconds });
				setTimeout(state.use.display, 1000);
			} else {
				chrome.browserAction.setBadgeText({ text: "" });
			}
			state.sync();
			//checkall();
		}
	},

		
	sync: function () {
		chrome.extension.getViews().forEach(function (tab) {
			// TODO: triggers onUpdated events on every tab, why not just call checkall() ?
			console.log('sync ',tab.update);
			typeof tab.update === "function" && tab.update();
		});
	}
	
};

var check = async function (url, tabID) {
	let allowedSeconds = await state.getAllowedSeconds();
	if (allowedSeconds > 0) {
		return;
	}
	console.log('check 1', url, tabID);
	
	var block = await Data.get("target-block");
	var speed = await Data.get("target-speed");
	var allow = await Data.get("target-allow");
	var uri = new Uri(url);
	var match = false;
	var matchSpeed = false;
	
	// TODO: ensure rule is trimmed before used
	var checkRule = function (rule) {
		var rule = new Uri(rule);
		var uhost = uri.host();
		var rhost = rule.host();
		var upath = uri.path();
		var rpath = rule.path();
		var index = uhost.indexOf(rhost);
		
		return index !== -1 && index === uhost.length - rhost.length && (index > 0 ? uhost[index - 1] === "." : true)
			&& upath.indexOf(rpath) === 0 && (upath.length > rpath.length ? (rpath.substr(-1) === "/" || upath[rpath.length] === "/") : true);
	};
	
	if( allow.some(checkRule) ) return;

	var matches = block.some(function (rule) {
		match = rule;
		return checkRule(rule);
	});
	if(matches) { 
		console.log('check matched');
		chrome.tabs.update(tabID, {	url: "popup.html?" + encodeURIComponent(JSON.stringify({ url: url, rule: match, matchType: 'block', speed:1 })) });
	} else {
		console.log('check matched speed');
		var matchesSpeed = speed.some(function (rule) {
			matchSpeed = rule;
			return checkRule(rule);
		});
		if( matchesSpeed ) {
			let chargeSpeed = await Data.get("charge-speed");
			chrome.tabs.update(tabID, { url: "popup.html?" + encodeURIComponent(JSON.stringify({ url: url, rule: matchSpeed, matchType: 'speed', speed:chargeSpeed }))	});
		}
	};
};

var checkall = function () {
	chrome.tabs.query({}, function (tabs) {
		tabs.forEach(function (tab) {
			check(tab.url, tab.id);
		});
	});
};


async function init() {
	//await Data.def("first_run", 1);
	await Data.def("balance", 30*60);	// 30 minutes
	await Data.def("charge-interval", 20*60);	// 20 minutes
	await Data.def("charge-size", 5*60);	// 5 minutes
	await Data.def("charge-max", 3*3600); // 3 hours
	await Data.def("charge-speed", 2); // 2x
	await Data.def("target-block", ['wikipedia.org', 'quora.com']);
	await Data.def("target-speed", ['facebook.com', 'twitter.com', 'youtube.com']);
	await Data.def("target-allow", ['drive.google.com','gmail.com','github.com']);
	await Data.def("time-till-allowed", 0);

	
	// recover timer for Spending, if alowedSeconds available
	if(state.use.id==null) {
		let allowedSeconds = await state.getAllowedSeconds();
		if( allowedSeconds > 0 ) {
			state.use.start();
		}
	}
}

init().then(() => {
	window.state = state;

	chrome.tabs.onCreated.addListener(function (tab) {
		tab.url && check(tab.url, tab.id);
	});

	chrome.tabs.onUpdated.addListener(function (tabID, changed, tab) {
		changed.url && check(changed.url, tabID);
	});

	state.add.start();

});


})();
