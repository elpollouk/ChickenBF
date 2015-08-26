(function () {
	"use strict";

	// External libs
	Test.addScripts("../libs/ChickenFW/js/mix.js", "../libs/ChickenFW/js/namespace.js", "../libs/ChickenFW/js/class.js");

	//              System under test                   Test script
	Test.addScripts("../src/refvm.js",					"refvm.tests.js");
})();