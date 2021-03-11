(function () {

///////////////////////////////////////////////////////////////////////////////
// Setup
///////////////////////////////////////////////////////////////////////////////
var background = chrome.extension.getBackgroundPage();

var isTab = location.search && JSON.parse(decodeURIComponent(location.search.slice(1)));
var loading = false;
console.log('popup 1', location.search, isTab);

let matchType = isTab.matchType;
let speed = isTab.speed;

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

var updatePopup = async function () {
//	if( matchType=='speed' ) {
//		speed = await background.state.getChargeDefaultSpeed();
//	}
	let balance = await background.state.getBalance();
	let allowedSeconds = await background.state.getAllowedSeconds();

	var balanceMinutes = Math.floor(balance/60);
	//var meter = background.state.meter;
	let meter = Math.floor(allowedSeconds / 60);

	console.log('popup balance=',balance,'matchType=',matchType,'speed=',speed,'allowedSeconds=',allowedSeconds, 'meter=',meter,'loading=',loading,'isTab=',isTab);

	$balanceState.text(balanceMinutes).toggleClass("badge-info", !!balanceMinutes);
	$meterState.text(meter).toggleClass("badge-warning", !!meter);
	
	$use.each(function () {
		let v = parseInt(this.textContent, 10);
		if( v * speed > balanceMinutes ) {
			this.disabled = true;
		}
		// this.disabled = parseInt(this.textContent, 10) > balanceMinutes;
	});
	
	//$usecustom.text("+" + balanceMinutes).parent().prop("disabled", !balanceMinutes);
	$usecustom.text("+" + balanceMinutes ).parent().prop("disabled",  speed > 1 );
	
//	if (meter && isTab && !loading) {
	if (allowedSeconds && isTab && !loading) {
		console.log('updatePopup location.replace', isTab.url);
		location.replace(isTab.url);
		loading = true;
	}
	console.log('upd1-1');

};

window.update = async function() {
	console.log('window.update', isTab, isTab.url);
	await updatePopup();
};

console.log('upd1');
updatePopup().then(function() {
	console.log('upd2');
	$("body").on("focus", "*", function () {
		!isTab && this.blur();
		$("body").off("focus", "*");
		
	}).on("click", "button", async function () {
		var amount = parseInt(this.textContent, 10);
		await background.state.useBalance( amount, speed );
	});
	
	$("#balance-reset").click(async function () {
		await background.state.resetBalance();
	});
	
	$("#meter-reset").click(async function () {
		await background.state.resetAllowedTime();
		//background.state.meter = 1;
		//background.state.use.fn();
	});
});


})();
