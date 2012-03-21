(function () { "use strict";

var background = chrome.extension.getBackgroundPage(),
	isTab = location.search;

var $balance = $("#time-balance"),
	$meter = $("#time-meter"),
	$use = $("button"),
	$usecustom = $("#use-custom");

var update = window.update = function () {
	var balance = background.state.balance,
		meter = background.state.meter;
	
	$balance.text(balance).toggleClass("badge-info", !!balance);
	$meter.text(meter).toggleClass("badge-warning", !!meter);
	
	$use.each(function () {
		this.disabled = parseInt(this.innerText, 10) > balance;
	});
	
	$usecustom.text(balance).parent().prop("disabled", !balance);
	
	if (meter && isTab) {
		location.replace(decodeURIComponent(isTab.substr(1)));
	}
};

$("body").on("focus", "*", function () {
	!isTab && this.blur();
	
	$("body").off("focus", "*");
}).on("click", "button", function () {
	var amount = parseInt(this.innerText, 10);
	
	background.state.balance -= amount;
	background.state.meter += amount;
	background.state.use.start();
	
	background._gaq.push(["_trackEvent", "Balance", "Use", isTab ? "tab" : "popup", amount]);
	
	background.state.sync();
});

update();

background._gaq.push(["_trackPageview", isTab ? "/tab" : "/popup"]);

})();