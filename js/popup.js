(function(){
"use strict";

$("#activate-morphine").click(function(){
	chrome.browserAction.setBadgeText({
		text: "15"
	});
});


$("body").on("focus", "button", function(){
	this.blur()
	
	$("body").off("focus", "button");
});

$("#activate-options").click(function(){
	window.open("options.html");
});

})();