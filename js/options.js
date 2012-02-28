(function () { "use strict";

/*** setup ***/
var background = chrome.extension.getBackgroundPage();

background._gaq.push(["_trackPageview", "/options"]);


/*** charging ***/
var charge = {
	$interval: $("#charge-interval"),
	$intervaltext: $("output[for='charge-interval']"),
	$size: $("#charge-size"),
	$sizetext: $("output[for='charge-size']")
};

charge.$interval.change(function (e, real) {
	charge.$intervaltext.text("(every " + this.value + " minutes)");
	charge.$size.prop("max", (this.value / 10) * 2).change();
	
	Data.set("charge-interval", this.valueAsNumber);
	
	real !== false && background.state.add.start();
});

charge.$size.change(function () {
	charge.$sizetext.text("(+" + this.value + " per charge)");
	
	Data.set("charge-size", this.valueAsNumber);
});

charge.$size.val(Data.get("charge-size"));
charge.$interval.val(Data.get("charge-interval")).trigger("change", [false]);


/*** targeting ***/
var target = {
	$block: $("#target-block"),
	$allow: $("#target-allow"),
	get: function (key) {
		return Data.get("target-" + key).join("\n");
	},
	set: function (key, val) {
		Data.set("target-" + key, val.split("\n").map(function (v) {
			return v.trim();
		}).filter(function (v) {
			return v;
		}));
	}
};

target.$block.on("input", function () {
	target.set("block", this.value);
});

target.$allow.on("input", function () {
	target.set("allow", this.value);
});

target.$block.val(target.get("block"));
target.$allow.val(target.get("allow"));

})();