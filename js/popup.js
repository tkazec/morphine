(function(){
"use strict";

var background = chrome.extension.getBackgroundPage();

var $balance = $("#time-balance"),
	$meter = $("#time-meter"),
	$use = $("button");

var update = function(){
	var balance = background.state.balance,
		meter = background.state.meter;
	
	$balance.text(balance);
	$meter.text(meter);
	
	$use.each(function(){
		this.disabled = parseInt(this.innerText, 10) > balance;
	});
};

$("body").on("focus", "button", function(){
	this.blur();
	
	$("body").off("focus", "button");
}).on("click", "button", function(){
	var amount = parseInt(this.innerText, 10);
	
	background.state.balance -= amount;
	background.state.meter += amount;
	background.state.use.start();
	
	update();
	
	history.back();
});

update();

})();