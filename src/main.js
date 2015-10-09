(function () {
	var htmlEscape = function htmlEscape(text) {
		return text
			.replace(/</g,"&lt;")
			.replace(/>/g,"&gt;")
			.replace(/ /g, "&nbsp;")
			.replace(/\r\n/g, "<br />")
			.replace(/\n/g, "<br />")
			.replace(/\r/g, "<br />");
	};

	window.onload = function () {
		
		document.getElementById("execute").onclick = function () {

			var refvm = Chicken.fetch("RefVM");

			var vm = new refvm(30000, Uint32Array);

			vm.load(document.getElementById("progInput").value);

			var startTime = new Date();
			vm.execute();
			var timeTaken = (new Date() - startTime) / 1000;

			var output = vm.io.stdout || "No output";

			output = "Time taken = " + timeTaken + "s\n" + output;
			output = htmlEscape(output);

			document.getElementById("progOutput").innerHTML = output;
		};

	};
})();