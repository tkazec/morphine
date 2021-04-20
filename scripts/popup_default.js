(function () {

	async function modelToView() {
		let data = await Data.getAll();
		$("#balance-output").html( misc.balanceSecondsToString(data["balance"]) );
	}

	function init() {
		modelToView();
		chrome.storage.onChanged.addListener(function (changes, namespace) {
			modelToView();
		});
	}
	init();

})();
