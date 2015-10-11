/*
	Reference VM Implementation
	This VM has no optimisations and is designed in order to meet the basic BF spec
*/

(Chicken.register("RefVM", ["BF_StopReason", "BfIO"], function(StopReason, bfio) {
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
		this.io = new bfio();

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

		execute: function RefVM_execute() {
			
			var ip = this.ip;
			var dp = this.dp;
			var prog = this._prog;
			var loopCounter = 0;
			var yieldthreshold = this.config.yieldthreshold;
			var that = this;

			// A yielder function that checks how many times it has been called and will store the execution context if execution should yield
			var shouldYield = function () {
				if (--yieldthreshold == 0) {
					that.ip = ip + 1; // Resume execution at the next instruction
					that.dp = dp;
					return true;
				}
				return false;
			};

			while (ip < prog.length)
			{
				var code = prog[ip];

				switch (code) {
					case ">":
						if (dp === (this.memory.length-1)) throw new RangeError("Attempted to move beyond upper limit of memory");
						dp++;
						break;

					case "<":
						if (dp === 0) throw new RangeError("Attempted to move beyond lower limit of memory");
						dp--;
						break;

					case "+":
						this.memory[dp]++;
						break;

					case "-":
						this.memory[dp]--;
						break;

					case ".":
						this.io.putch(this.memory[dp]);
						break;

					case ",":
						this.memory[dp] = this.io.getch();
						break;

					case "[":
						if (this.memory[dp] === 0) {
							loopCounter = 1
							while (loopCounter !== 0) {
								ip++;
								if (prog[ip] === '[') loopCounter++;
								else if (prog[ip] === ']') loopCounter--;
							}
						}

						if (shouldYield()) return StopReason.YIELD;
						break;

					case "]":
						if (this.memory[dp] !== 0) {
							loopCounter = 1;
							while (loopCounter !== 0) {
								ip--;
								if (prog[ip] == '[') loopCounter--;
								else if (prog[ip] === ']') loopCounter++;
							}
						}

						if (shouldYield()) return StopReason.YIELD;
						break;
				};

				ip++;
			}

			// Save the execution context
			this.ip = ip;
			this.dp = dp;

			return StopReason.END;
		}
	});

}));