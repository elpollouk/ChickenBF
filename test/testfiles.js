(function () {
	"use strict";

	// External libs
	Test.addScripts(
		"../libs/ChickenFW/js/mix.js",
		"../libs/ChickenFW/js/namespace.js",
		"../libs/ChickenFW/js/class.js",
		"../libs/ChickenFW/js/inject.js"
	);

	//              System under test                   Test script
	Test.addScripts("../src/bfvm.js");
	Test.addScripts("../src/bfio.js",					"bfio.tests.js");
	Test.addScripts("../src/optvm.js");
	Test.addScripts("../src/refvm.js",					"refvm.tests.js");
})();