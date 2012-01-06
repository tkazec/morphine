(function(){
"use strict";

chrome.tabs.onCreated.addListener(function(tab){
	tab.url && handle(tab.id, tab.url);
});

chrome.tabs.onUpdated.addListener(function(tID, changed, tab){
	changed.url && handle(tID, changed.url);
});

var handle = function(tID, url){
	if (url.indexOf("reddit.com") !== -1) {
		chrome.tabs.update(tID, {
			url: "nope.webm"
		});
	}
};

chrome.browserAction.setBadgeBackgroundColor({
	color: [0, 60, 255, 255]
});

})();