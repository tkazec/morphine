(function () {

///////////////////////////////////////////////////////////////////////////////
// Setup
///////////////////////////////////////////////////////////////////////////////
var background = chrome.extension.getBackgroundPage();
var isTab = location.search && JSON.parse(decodeURIComponent(location.search.slice(1)));
var loading = false;

var $balanceState = $("#balance-state");
var $balanceReset = $("#balance-reset");
var $meterState = $("#meter-state");
var $meterReset = $("#meter-reset");
var $use = $("button");
var $usecustom = $("#use-custom");

if (isTab) {
	$("title").text(isTab.rule);
	$("#url").text(isTab.url).show();
}

background._gaq.push(["_trackPageview", isTab ? "/tab" : "/popup"]);


///////////////////////////////////////////////////////////////////////////////
// Sync
///////////////////////////////////////////////////////////////////////////////
var update = window.update = function () {
	var balance = background.state.balance;
	var meter = background.state.meter;
	
	$balanceState.text(balance).toggleClass("badge-info", !!balance);
	$meterState.text(meter).toggleClass("badge-warning", !!meter);
	
	$use.each(function () {
		this.disabled = parseInt(this.textContent, 10) > balance;
	});
	
	$usecustom.text("+" + balance).parent().prop("disabled", !balance);
	
	if (meter && isTab && !loading) {
		location.replace(isTab.url);
		
		loading = true;
	}
};

update();


///////////////////////////////////////////////////////////////////////////////
// Events
///////////////////////////////////////////////////////////////////////////////
$("body").on("focus", "*", function () {
	!isTab && this.blur();
	
	$("body").off("focus", "*");
}).on("click", "button", function () {
	var amount = parseInt(this.textContent, 10);
	
	background.state.balance -= amount;
	background.state.meter += amount;
	background.state.use.start();
	
	background._gaq.push(["_trackEvent", "Balance", "Use", isTab ? "tab" : "popup", amount]);
});

$("#balance-reset").click(function () {
	background.state.balance = 0;
	background.state.sync();
	
	background._gaq.push(["_trackEvent", "Balance", "Reset", isTab ? "tab" : "popup"]);
});

$("#meter-reset").click(function () {
	background.state.meter = 1;
	background.state.use.fn();
	
	background._gaq.push(["_trackEvent", "Meter", "Reset", isTab ? "tab" : "popup"]);
});

})();
