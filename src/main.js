(Chicken.inject(["RefVM", "BFVM"], function (RefVM, BFVM) {

	"use strict";

	var vm;
	var startTime;
	var timerOutput;
	var outputElement;

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

	var updateScreen = function () {
		updateTime();
	};

	var executeSlice = function () {

		vm.execute(function (eventId, data) {
			switch (eventId) {
				case BFVM.EventId.END:
					updateScreen();
					document.getElementById("execute").disabled = false;
					break;

				case BFVM.EventId.YIELD:
					updateScreen();
					setTimeout(executeSlice, 0);
					break;

				case BFVM.EventId.STDOUT:
					outputElement.innerText += data;
					break;

				default:
					throw new Error("Unrecognised stop reason");
			}
		});

	};


	window.onload = function () {

		timerOutput = document.getElementById("timerOutput");
		
		document.getElementById("execute").onclick = function () {

			vm = new RefVM(1000, Uint32Array);

			vm.load(document.getElementById("progInput").value);
			this.disabled = true;

			outputElement = document.getElementById("progOutput");
			outputElement.innerHTML = "";
			startTime = Date.now();
			
			executeSlice();

		};

	};
}));