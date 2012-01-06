(function(){
"use strict";

chrome.webNavigation.onCommitted.addListener(function(details){
	if (details.frameId === 0 && details.url.indexOf("reddit.com") !== -1) {
		chrome.tabs.update(details.tabId, {
			url: "nope.webm"
		});
	}
});

})();