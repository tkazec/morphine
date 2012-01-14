(function(){
"use strict";

$("body").on("focus", "button", function(){
	this.blur()
	
	$("body").off("focus", "button");
});

})();