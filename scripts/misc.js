(function () {

var misc = {

	balanceSecondsToString: function(seconds) {
		if (seconds < 60) {
			return seconds + " second" + (seconds > 1 ? 's' : '');
		}
		if (seconds < 3600) {
//			let minutes = Math.round(seconds / 60);
			let minutes = Math.floor(seconds / 60);
			return minutes + " minute" + (minutes > 1 ? 's' : '');
		}
		let hours = Math.floor(seconds / 3600);
//		let minutes = Math.round((seconds - hours * 3600) / 60);
		let minutes = Math.floor((seconds - hours * 3600) / 60);
		if (minutes == 0) {
			return hours + " hour" + (hours > 1 ? 's' : '');
		}
		return hours + " hour" + (hours > 1 ? 's' : '') + " and " + minutes + " minute" + (minutes > 1 ? 's' : '');
	}


};

window.misc = misc;

})();