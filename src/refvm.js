/*
	Reference VM Implementation
	This VM has no optimisations and is designed in order to meet the basic BF spec
*/

(Chicken.register("RefVM", ["BFVM", "BfIO", "Date"], function(BFVM, bfio, Date) {
	"use strict";

	// VM Implementation
	return Chicken.Class(function (memorySize, memoryType) {

		memorySize = memorySize || 30000;
		memoryType = memoryType || Int32Array;

		// Set up the default config options
		this.config = {
			yieldthreshold: 100,
		};

		var memory = new memoryType(memorySize);
		for (var i = 0; i < memory.length; i++)
			memory[i] = 0;

		this.memory = memory;
		this.dp = 0;
		this.ip = 0;
		this.sp = -1;
		this.io = new bfio();
		this.stack = new Array(1024);

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

			this._prog = prog;

		},

		execute: function RefVM_execute(eventCallback) {
			
			eventCallback = eventCallback || function () {};

			// Execution context
			var ip = this.ip;
			var dp = this.dp;
			var sp = this.sp;
			var stack = this.stack;
			var prog = this._prog;
			var progSize = prog.length;
			var memory = this.memory;
			var memorySize = memory.length;

			// Yield checker
			var loopCounter = 0;
			var startTime = Date.now();
			var yieldthreshold = this.config.yieldthreshold;
			var yieldCheckCounter = 50;
			var that = this;

			// A yielder function that checks how many times it has been called and will store the execution context if execution should yield
			var shouldYield = function () {
				if (--yieldCheckCounter === 0) {
					if ((Date.now() - startTime) >= yieldthreshold) {
						that.ip = ip + 1; // Resume execution at the next instruction
						that.dp = dp;
						that.sp = sp;
						return true;
					}
					yieldCheckCounter = 50;
				}
				return false;
			};

			while (ip < progSize)
			{
				var code = prog[ip];

				switch (code) {
					case ">":
						if (dp === (memorySize-1)) {
							this.dp = dp;
							this.ip = ip;
							this.sp = sp;
							eventCallback(BFVM.EventId.RUNTIME_ERROR, { message: "Attempted to move beyond upper limit of memory" });
							return;
						}
						dp++;
						break;

					case "<":
						if (dp === 0) {
							this.dp = dp;
							this.ip = ip;
							this.sp = sp;
							eventCallback(BFVM.EventId.RUNTIME_ERROR, { message: "Attempted to move beyond lower limit of memory" });
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
						eventCallback(BFVM.EventId.STDOUT, String.fromCharCode(memory[dp]));
						break;

					case ",":
						var value = this.io.getch(memory[dp]);
						if (value === null) {
							// Save execution context and yield
							this.dp = dp;
							this.ip = ip; // We want to resume execution at this instruction so it can attempt to read again
							this.sp = sp;
							eventCallback(BFVM.EventId.NEEDS_INPUT);
							return;
						}
						memory[dp] = value;
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

						if (shouldYield()) {
							eventCallback(BFVM.EventId.YIELD);
							return;
						}
						break;

					case "]":
						if (memory[dp] !== 0) {
							ip = stack[sp];
						}
						else {
							--sp;
						}

						if (shouldYield()) {
							eventCallback(BFVM.EventId.YIELD);
							return;
						}
						break;
				};

				ip++;
			}

			// Save the execution context
			this.ip = ip;
			this.dp = dp;
			this.sp = sp;

			eventCallback(BFVM.EventId.END);
		}
	});

}));