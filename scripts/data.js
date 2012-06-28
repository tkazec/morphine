(function () { "use strict";

var Data = window.Data = {
	has: function (key) {
		return localStorage.getItem(key) !== null;
	},
	get: function (key) {
		return Data.has(key) ? JSON.parse(localStorage.getItem(key)) : undefined;
	},
	set: function (key, val) {
		localStorage.setItem(key, JSON.stringify(val));
	},
	def: function (key, val) {
		!Data.has(key) && Data.set(key, val);
	},
	del: function (key) {
		localStorage.removeItem(key);
	}
};

})();