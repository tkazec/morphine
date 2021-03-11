(function () {

//var store = chrome.storage.local;
var store = chrome.storage.sync;


var Data = {

	getAll: async function() {
		//chrome.storage.local.get(null, function(d) { console.log(d);} );
		return new Promise(resolve => {
			store.get(null, data => {
				resolve(data);
			});
		});
	},

	setAll: async function (data) {
		return new Promise(resolve => {
			store.set(data, () => {
				resolve();
			});
		});
	},

	get: async function (key) {
//		console.log('get',key);
		return new Promise(resolve => {
			store.get(key, data => {
				resolve(data[key]);
			});
		});
	},

	set: async function (key, val) {
//		console.log('set',key,val);
		//await store.set(data);
		return new Promise(resolve => {
			let data = {};
			data[key] = val;
			store.set(data, () => {
				resolve();
			});
		});
//		console.log('set_result',key, val, 'done');
	},

	// todo: defAll -> getAll, for all undefined values -> setAll
	def: async function (key, val) {
		let v = await Data.get(key);
		if( v === undefined ) {
			await Data.set(key, val);
		}
	},

};

window.Data = Data;
window.store = store;

})();