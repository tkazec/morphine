(function(){
"use strict";

/*** setup ***/
var version = "1.0";

!Data.has("charge-interval") && Data.set("charge-interval", 10);
!Data.has("charge-size") && Data.set("charge-size", 1);

!Data.has("target-block") && Data.set("target-block", []);
!Data.has("target-allow") && Data.set("target-allow", []);

!Data.has("block") && Data.set("block", "<nope.avi>");


/*** monitoring ***/
var check = function(url, tID){
	if (!((url = url.match(/:\/\/(.+?)\//)) && (url = url[1]))) {
		return;
	}
	
	var block = Data.get("target-block"),
		allow = Data.get("target-allow");
	
	var apply = function(url, rule){
		var index = url.indexOf(rule);
		
		return index !== -1 && index === url.length - rule.length && (index > 0 ? url[index - 1] === "." : true);
	};
	
	var matches = block.some(function(rule){
		if (apply(url, rule)) {
			var allowed = allow.some(function(rule){
				return apply(url, rule);
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