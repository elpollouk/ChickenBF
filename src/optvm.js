/*
	Reference VM Implementation
	This VM has no optimisations and is designed in order to meet the basic BF spec
*/

(Chicken.register("OptVM", ["BFVM", "BfIO"], function(BFVM, bfio) {
	"use strict";

var workerMain = function (global) {
	"use strict";

	var memorySize = 30000;
	var memory = new Array(memorySize);
	var stack = new Array(1024);
	var dp = 0;
	var ip = 0;
	var sp = -1;
	var prog;
	var stdin = "";
	var stdout = "";

	for (var i = 0; i < memory.length; i++)
		memory[i] = 0;


	var execute = function workerMain_execute() {

		var progSize = prog.length;
		var loopCounter = 0;

		while (ip < progSize)
		{
			var code = prog[ip];

			switch (code) {
				case ">":
					if (dp === (memorySize-1)) {
						global.postMessage({
							id: "error",
							message: "Attempted to move beyond upper limit of memory"
						});
						return;
					}
					dp++;
					break;

				case "<":
					if (dp === 0) {
						global.postMessage({
							id: "error",
							message: "Attempted to move beyond lower limit of memory"
						});
						return;
					}
					dp--;
					break;

				case "+":
					memory[dp]++;
					break;

				case "-":
					memory[dp]--;
					break;

				case ".":
					var value = memory[dp];
					stdout += String.fromCharCode(memory[dp]);

					if (value === 10) {
						global.postMessage({
							id: "stdout",
							data: stdout
						});
						stdout = "";
					}
					break;

				case ",":
					if (stdin === null) {
						memory[dp] = 0;
					}
					else if (stdin.length === 0) {
						global.postMessage({
							id: "stdin"
						});
						return;
					}
					else {
						memory[dp] = stdin.charCodeAt(0);
						stdin = stdin.slice(1);
					}
					break;

				case "[":
					if (memory[dp] === 0) {
						loopCounter = 1;
						while (loopCounter !== 0) {
							ip++;
							if (prog[ip] === '[') loopCounter++;
							else if (prog[ip] === ']') loopCounter--;
						}
					}
					else {
						stack[++sp] = ip;
					}
					break;

				case "]":
					if (memory[dp] !== 0) {
						ip = stack[sp];
					}
					else {
						--sp;
					}
					break;
			};

			ip++;
		}

		global.postMessage({
			id: "end"
		});
	};

	global.onmessage = function (e) {
		var data = e.data;
		switch (data.id) {
			case "load":
				prog = data.prog;
				break;

			case "stdin":
				if (data.text) {
					stdin += data.text;
				}
				else {
					stdin = null;
				}
				break;

			case "exec":
				execute();
				break;

			default:
				throw new Error("Worker: Unrecognised message");
		};
	};
};

	// VM Implementation
	return Chicken.Class(function (memorySize, memoryType) {

		// Set up the default config options
		this.config = {
		};

		this.io = new bfio();
		this._eventCallback = null;
		var that = this;

		this._worker = Chicken.startWorker(workerMain, function (e) {

			var data = e.data;
			switch (data.id) {
				case "end":
					that._eventCallback(BFVM.EventId.END);
					break;

				case "stdout":
					that._eventCallback(BFVM.EventId.STDOUT, data.data);
					break;

				case "stdin":
					that._eventCallback(BFVM.EventId.NEEDS_INPUT);
					break;

				case "error":
					that._eventCallback(BFVM.EventId.RUNTIME_ERROR, { message: data.message });
					break;

				default:
					throw Error("Main: Unrecognised message");
			}

		});

	}, {
		load: function RefVM_load(prog) {

			if (typeof prog !== "string") throw new Error("Illegal Argument");

			// Validate the loops
			var counter = 0;
			for (var i = 0; i < prog.length; i++) {
				switch (prog[i]) {
					case "[":
						counter++;
						break;

					case "]":
						if (counter === 0) throw new Error("Loop closed but not opened");
						counter--;
						break;
				}
			}
			if (counter !== 0) throw new Error("Loop opened but not closed");

			this._worker.postMessage({
				id: "load",
				prog: prog
			});

		},

		execute: function RefVM_execute(eventCallback) {
			
			this._eventCallback = eventCallback || function () {};

			this._worker.postMessage({
				id: "exec"
			});

		}
	});

}));