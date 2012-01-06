(function(){
"use strict";

$("#activate-morphine").click(function(){
	chrome.browserAction.setBadgeText({
		text: "15"
	});
}).one("focus", function(){
	this.blur();
});

})();