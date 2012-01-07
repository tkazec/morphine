(function(){
"use strict";

var check = function(url, tID){
	if (!((url = url.match(/:\/\/(.+?)\//)) && (url = url[1]))) {
		return;
	}
	
	var block = JSON.parse(localStorage.blocked),
		allow = JSON.parse(localStorage.allowed);
	
	var matches = block.some(function(rule){
		var index = url.indexOf(rule);
		
		if (index !== -1 && index === url.length - rule.length) {
			var allowed = allow.some(function(rule){
				var index = url.indexOf(rule);
				
				if (index !== -1 && index === url.length - rule.length) {
					return true;
				}
			});
			
			if (!allowed) {
				return true;
			}
		}
	});
	
	matches && chrome.tabs.update(tID, {
		url: "nope.webm"
	});
};

chrome.tabs.onCreated.addListener(function(tab){
	tab.url && check(tab.url, tab.id);
});

chrome.tabs.onUpdated.addListener(function(tID, changed, tab){
	changed.url && check(changed.url, tID);
});

chrome.browserAction.setBadgeBackgroundColor({
	color: [0, 60, 255, 255]
});

})();