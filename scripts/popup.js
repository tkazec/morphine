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
// add to meter, reduce balance
$(".add-meter").on("focus", "*", function () {
	!isTab && this.blur();
	
	$(".add-meter").off("focus", "*");
}).on("click", "button", function () {
	var amount = parseInt(this.textContent, 10);
	
	background.state.balance -= amount;
	background.state.meter += amount;
	background.state.use.start();
	
	background._gaq.push(["_trackEvent", "Balance", "Use", isTab ? "tab" : "popup", amount]);
	
	background.state.sync();
});

// dumps balance (if currently existing)
$(".dump-balance").on("focus", "*", function () {
	!isTab && this.blur();
	
	$(".dump-balance").off("focus", "*");
}).on("click", "button", function () {

	// resets balance
	var amount = background.state.balance;
	background.state.balance -= amount;
	background.state.sync();
	background._gaq.push(["_trackEvent", "Balance", "Use", isTab ? "tab" : "popup", amount]);
});

// dumps meter (if currently existing)
$(".dump-meter").on("focus", "*", function () {
	!isTab && this.blur();
	
	$(".dump-meter").off("focus", "*");
}).on("click", "button", function () {

	// resets meter
	var amount = background.state.meter;
	background.state.meter -= amount;
	background.state.use.start();
	background._gaq.push(["_trackEvent", "Balance", "Use", isTab ? "tab" : "popup", amount]);
	background.state.sync();
	background.monitor.checkall(); // load popup.html page
});

})();
