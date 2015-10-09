/*
	Reference VM Implementation
	This VM has no optimisations and is designed in order to meet the basic BF spec
*/

(Chicken.register("RefVM", [], function() {
	"use strict";

	// VM Implementation
	return Chicken.Class(function (memorySize, memoryType, io) {

		memorySize = memorySize || 30000;
		memoryType = memoryType || Int32Array;

		var memory = new memoryType(memorySize);
		for (var i = 0; i < memory.length; i++)
			memory[i] = 0;

		this.memory = memory;
		this.dp = 0;
		this.io = io;

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
			
			var ip = 0;
			var prog = this._prog;
			var loopCounter = 0;

			while (ip < prog.length)
			{
				var code = prog[ip];

				switch (code) {
					case ">":
						if (this.dp === (this.memory.length-1)) throw new RangeError("Attempted to move beyond upper limit of memory");
						this.dp++;
						break;

					case "<":
						if (this.dp === 0) throw new RangeError("Attempted to move beyond lower limit of memory");
						this.dp--;
						break;

					case "+":
						this.memory[this.dp]++;
						break;

					case "-":
						this.memory[this.dp]--;
						break;

					case ".":
						this.io.putch(this.memory[this.dp]);
						break;

					case ",":
						this.memory[this.dp] = this.io.getch();
						break;

					case "[":
						if (this.memory[this.dp] === 0) {
							loopCounter = 1
							while (loopCounter !== 0) {
								ip++;
								if (prog[ip] === '[') loopCounter++;
								else if (prog[ip] === ']') loopCounter--;
							}
						}
						break;

					case "]":
						if (this.memory[this.dp] !== 0) {
							loopCounter = 1;
							while (loopCounter !== 0) {
								ip--;
								if (prog[ip] == '[') loopCounter--;
								else if (prog[ip] === ']') loopCounter++;
							}
						}
						break;
				};

				ip++;
			}

		}
	});

}));