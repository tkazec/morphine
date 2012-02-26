(function () { "use strict";

var Data = window.Data = {
	has: function (key) {
		return localStorage.getItem(key) !== null;
	},
	get: function (key) {
		return Data.has(key) ? JSON.parse(localStorage.getItem(key)) : null;
	},
	set: function (key, val) {
		localStorage.setItem(key, JSON.stringify(val));
	},
	del: function (key) {
		localStorage.removeItem(key);
	}
};

})();