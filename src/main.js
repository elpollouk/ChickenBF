(Chicken.inject(["RefVM", "BF_StopReason"], function (RefVM, StopReason) {

	"use strict";

	var vm;
	var startTime;
	var timerOutput;
	var lastOutputLength;

	var htmlEscape = function htmlEscape(text) {
		return text
			.replace(/</g,"&lt;")
			.replace(/>/g,"&gt;")
			.replace(/ /g, "&nbsp;")
			.replace(/\r\n/g, "<br />")
			.replace(/\n/g, "<br />")
			.replace(/\r/g, "<br />");
	};

	var updateTime = function () {
		var timeTaken = (Date.now() - startTime);

		var hours = Math.floor(timeTaken / 3600000);
		timeTaken -= (hours * 3600000);
		hours = hours.toString();
		if (hours.length < 2) hours = "0" + hours;

		var minutes = Math.floor(timeTaken / 60000);
		timeTaken -= (minutes * 60000);
		minutes = minutes.toString();
		if (minutes.length < 2) minutes = "0" + minutes;

		var seconds = Math.floor(timeTaken / 1000);
		timeTaken -= (seconds * 1000);
		seconds = seconds.toString();
		if (seconds.length < 2) seconds = "0" + seconds;

		var ms = timeTaken.toString();
		if (ms.length == 1) ms = ms + "00";
		else if (ms.length == 2) ms = ms + "0";

		timerOutput.innerText = hours + ":" + minutes + ":" + seconds + "." + ms;
	};


	var executeSlice = function () {

		var reason = vm.execute();

		var output = vm.io.stdout;
		if (output && output.length != lastOutputLength) {
			output = htmlEscape(output);
			document.getElementById("progOutput").innerHTML = output;
			lastOutputLength = output.length;
		}

		updateTime();

		switch (reason) {
			case StopReason.END:
				document.getElementById("execute").disabled = false;
				break;

			case StopReason.YIELD:
				setTimeout(executeSlice, 0);
				break;

			default:
				throw new Error("Unrecognised stop reason");
		}

	};


	window.onload = function () {

		timerOutput = document.getElementById("timerOutput");
		
		document.getElementById("execute").onclick = function () {

			vm = new RefVM(1000, Uint32Array);

			vm.load(document.getElementById("progInput").value);
			vm.config.yieldthreshold = 100000;
			this.disabled = true;

			document.getElementById("progOutput").innerHTML = "";
			lastOutputLength = 0;
			startTime = Date.now();
			
			executeSlice();

		};

	};
}));