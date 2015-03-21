(function () {

///////////////////////////////////////////////////////////////////////////////
// Setup
///////////////////////////////////////////////////////////////////////////////
var background = chrome.extension.getBackgroundPage();
var isTab = location.search && JSON.parse(decodeURIComponent(location.search.slice(1)));
var loading = false;

var $balance = $("#time-balance");
var $meter = $("#time-meter");
var $use = $("button");
var $usecustom = $("#use-custom");
var $resetbalance = $("#reset-balance");
var $resetmeter = $("#reset-meter");

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
	
	$balance.text(balance).toggleClass("badge-info", !!balance);
	$meter.text(meter).toggleClass("badge-warning", !!meter);
	
	$use.each(function () {
		this.disabled = parseInt(this.textContent, 10) > balance;
	});
	
	$usecustom.text("+" + balance).parent().prop("disabled", !balance);

	// reset balance (if available)
	$resetbalance.text("Dump Balance").parent().prop("disabled", !balance);
	// reset meter (if available)
	$resetmeter.text("Dump Meter").parent().prop("disabled", !meter);

	
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
$(".add-charge").on("focus", "*", function () {
	!isTab && this.blur();
	
	$(".add-charge").off("focus", "*");
}).on("click", "button", function () {
	var amount = parseInt(this.textContent, 10);
	
	background.state.balance -= amount;
	background.state.meter += amount;
	background.state.use.start();
	
	background._gaq.push(["_trackEvent", "Balance", "Use", isTab ? "tab" : "popup", amount]);
	
	background.state.sync();
});

// dumps balance completely, does not add to meter (if currently existing)
$(".dump-charge").on("focus", "*", function () {
	!isTab && this.blur();
	
	$(".dump-charge").off("focus", "*");
}).on("click", "button", function () {

	// resets balance
	background.state.balance = 0;
	background.state.use.start();
	background._gaq.push(["_trackEvent", "Balance", "Use", isTab ? "tab" : "popup", amount]);
	
	background.state.sync();
});

// dumps meter (if currently existing)
$(".dump-meter").on("focus", "*", function () {
	!isTab && this.blur();
	
	$(".dump-meter").off("focus", "*");
}).on("click", "button", function () {

	// resets meter
	background.state.meter = 0;
	background.state.use.start();
	background._gaq.push(["_trackEvent", "Balance", "Use", isTab ? "tab" : "popup", amount]);
	
	background.state.sync();
});

})();