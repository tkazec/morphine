(function () { "use strict";

/*** setup ***/
var background = chrome.extension.getBackgroundPage();
var loading = false;

var $balance = $("#time-balance");
var $meter = $("#time-meter");
var $use = $("button");
var $usecustom = $("#use-custom");

var loc = new Uri(location);
var isTab = !!loc.query().toString();
var url = loc.getQueryParamValue("url");
var rule = loc.getQueryParamValue("rule");

if (isTab) {
	$("title").text(rule);
	
	var ruleindex = url.indexOf(rule);
	$("#url-left").text(url.slice(0, ruleindex));
	$("#url-rule").text(rule);
	$("#url-right").text(url.slice(ruleindex + rule.length));
	$("#url").show();
}

background._gaq.push(["_trackPageview", isTab ? "/tab" : "/popup"]);


/*** sync ***/
var update = window.update = function () {
	var balance = background.state.balance;
	var meter = background.state.meter;
	
	$balance.text(balance).toggleClass("badge-info", !!balance);
	$meter.text(meter).toggleClass("badge-warning", !!meter);
	
	$use.each(function () {
		this.disabled = parseInt(this.innerText, 10) > balance;
	});
	
	$usecustom.text("+" + balance).parent().prop("disabled", !balance);
	
	if (meter && isTab && !loading) {
		location.replace(url);
		
		loading = true;
	}
};

update();


/*** events ***/
$("body").on("click", "button", function () {
	var amount = parseInt(this.innerText, 10);
	
	background.state.balance -= amount;
	background.state.meter += amount;
	background.state.use.start();
	
	background._gaq.push(["_trackEvent", "Balance", "Use", isTab ? "tab" : "popup", amount]);
	
	background.state.sync();
});

})();