(function () {

	var background = chrome.extension.getBackgroundPage();

	// TODO: access Data through background.getAll() / setAll() ? not include data.js in options.html

	async function modelToView() {
		console.log('modelToView getAll start');
		let data = await Data.getAll();
		console.log('modelToView getAll stop');

		$("#balance-output").html( misc.balanceSecondsToString(data["balance"]) );
		
		//let allowedTill = data["time-till-allowed"] - (new Date()/1000);
//		let allowedSeconds = await background.state.getAllowedSeconds();
//		if( allowedSeconds > 0 ) {
//			$("#allowed-till-output").html( "<h4>Limited and Speedball sites are allowed</h4>" );
//			$("#allowed-till-output").html( "<h4>Limited and Speedball sites allowed for less than "+balanceSecondsToString(allowedSeconds)+"</h4>" );
//		} else {
//			$("#allowed-till-output").html( "<h4>Access to Limited and Speedball sites is restricted</h4>" );
//			$("#allowed-till-output").html( "" );
//		}
		
		$("#charge-interval").val( data["charge-interval"] );
		$("#charge-size").val( data["charge-size"] );
		$("#charge-max").val( data["charge-max"] );
		$("#charge-speed").val( data["charge-speed"] );
		$("#target-block").val( targetArrayToString(data["target-block"])+"\n" );
		$("#target-speed").val( targetArrayToString(data["target-speed"])+"\n" );
		$("#target-allow").val( targetArrayToString(data["target-allow"])+"\n" );
	}

	async function viewToModel() {
		let data = {};
		data["charge-interval"] = $("#charge-interval").val() * 1;
		data["charge-size"] = $("#charge-size").val() * 1;
		data["charge-max"] = $("#charge-max").val() * 1;
		data["charge-speed"] = $("#charge-speed").val() * 1;
		data["target-block"] = targetStringToArray( $("#target-block").val() );
		data["target-speed"] = targetStringToArray( $("#target-speed").val() );
		data["target-allow"] = targetStringToArray( $("#target-allow").val() );
		console.log('viewToModel setAll start');
		await Data.setAll(data);
		console.log('viewToModel setAll stop');
	}
/*
	function balanceSecondsToString(seconds) {
		if (seconds < 60) {
			return seconds + " second" + (seconds > 1 ? 's' : '');
		}
		if (seconds < 3600) {
			let minutes = Math.round(seconds / 60);
			return minutes + " minute" + (minutes > 1 ? 's' : '');
		}
		let hours = Math.floor(seconds / 3600);
		let minutes = Math.round((seconds - hours * 3600) / 60);
		if (minutes == 0) {
			return hours + " hour" + (hours > 1 ? 's' : '');
		}
		return hours + " hour" + (hours > 1 ? 's' : '') + " and " + minutes + " minute" + (minutes > 1 ? 's' : '');
	}
*/
	function targetArrayToString(arr) {
		return arr.join("\n");
	}

	function targetStringToArray(str) {
		let list = str.split("\n");
		let target = [];
		for(let i=0; i< list.length; i++) {	
			let t = list[i].trim();
			if( t=="" ) continue;
			target.push(t);
		}
		return target;
	}

	function changeValue() {
		viewToModel();
		// TODO: background.notifyModelUpdated() -> background restarts timers by its own ?
		background.state.add.start();
	}

	function init() {
		// every Browser shows Welcome message separately; synchronous localStorage instead of chrome.storage.sync to avoid sync to other browsers
		if ( ! localStorage.getItem("first_run") ) {
			localStorage.setItem("first_run", 1);
			$(".alert").show();
		};

		modelToView();

		// todo: rethink what happens if values stored in synced storage by multiple Browsers at once
			// todo: fill charge.size list with only values (show/hide select.values?), which are smaller than charge.interval (half of charge.interval or less)
		$("#charge-interval").change( changeValue );
		$("#charge-size").change( changeValue );
		$("#charge-max").change( async function() {
			let chargeMax = $("#charge-max").val() * 1;
			if( chargeMax > 0 ) {
				let balance = await Data.get("balance");
				if( balance > chargeMax ) {
					await Data.set("balance", chargeMax);
				}
			}
			changeValue();
		} );
		$("#charge-speed").change( changeValue );
		$("#target-block").change( changeValue );
		$("#target-speed").change( changeValue );
		$("#target-allow").change( changeValue );

		// TODO: use this listener only in background.js, notify options.js somehow??
		chrome.storage.onChanged.addListener(function (changes, namespace) {
			console.log('chrome.storage.onChanged', changes, namespace);
			modelToView();
			background.state.add.start();
		});
	
	}
	init();

})();
