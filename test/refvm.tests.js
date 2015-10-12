(function () {
	"use strict";

	var BFVM = Chicken.fetch("BFVM");

	//---------------------------------------------------------------------------------------------------------------//
	// Tests
	//---------------------------------------------------------------------------------------------------------------//
	window.Tests.RefVmTests = {

		testData: [
			{
				testId: "RefVM Int8Array",
				vm: "RefVM",
				memoryType: Int8Array,
				memorySize: 10,
				minusOne: -1
			},
			{
				testId: "RefVM Uint8Array",
				vm: "RefVM",
				memoryType: Uint8Array,
				minusOne: 0xFF
			},
			{
				testId: "RefVM Int16Array",
				vm: "RefVM",
				memoryType: Int16Array,
				memorySize: 1024,
				minusOne: -1
			},
			{
				testId: "RefVM Uint16Array",
				vm: "RefVM",
				memoryType: Uint16Array,
				minusOne: 0xFFFF
			},
			{
				testId: "RefVM Int32Array",
				vm: "RefVM",
				memoryType: Int32Array,
				memorySize: 30000,
				minusOne: -1
			},
			{
				testId: "RefVM Uint32Array",
				vm: "RefVM",
				memoryType: Uint32Array,
				minusOne: 0xFFFFFFFF
			},
		],

		_newVm: function (testData, mocks) {
			var refvm = Chicken.fetch(testData.vm, mocks);
			return new refvm(testData.memorySize, testData.memoryType);
		},

		construct: function (testData) {

			var vm = this._newVm(testData);

			Assert.isTrue(vm.memory instanceof testData.memoryType, "Memory was the wrong type");
			Assert.isSame(testData.memorySize || 30000, vm.memory.length, "Memory size wasn't correct");
			for (var i = 0; i < vm.memory.length; i++) {
				Assert.isSame(0, vm.memory[i], "Memory wasn't initialised to zero");
			}
			Assert.isSame(0, vm.ip, "Instruction pointer wasn't initialised correctly");
			Assert.isSame(0, vm.dp, "Data pointer wasn't initialised correctly");
			Assert.isNotNull(vm.io, "IO handler wasn't initialised");
			Assert.isTrue(vm.io.getch instanceof Function, "IO getch wasn't initialised");

			Assert.isSame(100, vm.config.yieldthreshold, "Incorrect yield threshold");
		},

		load_emptyprog: function (testData) {

			var vm = this._newVm(testData);
			vm.load("");

		},

		load_nullprog: function (testData) {

			var vm = this._newVm(testData);

			Assert.expectedException({
				message: "Illegal Argument"
			}, function () {
				vm.load(null);
			});
		},

		load_validprog: function (testData) {

			var vm = this._newVm(testData);
			vm.load("><+[-].,");

		},

		load_comments: function (testData) {

			var vm = this._newVm(testData);
			vm.load("abcdefg");

		},

		load_invalidopenloop: function (testData) {

			var vm = this._newVm(testData);

			Assert.expectedException({
				message: "Loop opened but not closed"
			}, function () { 
				vm.load("[[][][]");
			});

		},

		load_invalidcloseloop: function (testData) {

			var vm = this._newVm(testData);

			Assert.expectedException({
				message: "Loop closed but not opened"
			}, function () {
				vm.load("[][][]][]");
			});

		},

		execute_moveright: function (testData) {

			var vm = this._newVm(testData);
			vm.load(">");

			vm.execute();

			Assert.isSame(1, vm.dp, "Data pointer wasn't updated correctly");

		},

		execute_moveright_multiple: function (testData) {

			var vm = this._newVm(testData);
			vm.load(">>>>>");

			vm.execute();

			Assert.isSame(5, vm.dp, "Data pointer wasn't updated correctly");

		},

		execute_moveright_beyondmemory: function (testData) {

			var vm = this._newVm(testData);
			vm.load(">");
			vm.dp = vm.memory.length - 1;

			var eventMonitor = Test.monitor();
			vm.execute(eventMonitor);

			Assert.isSame(1, eventMonitor.calls.length, "Incorrect number of events raised");
			Assert.isSame(BFVM.EventId.RUNTIME_ERROR, eventMonitor.calls[0][0], "Incorrect event type raised");
			Assert.isSame("Attempted to move beyond upper limit of memory", eventMonitor.calls[0][1].message, "Incorrect error message");

		},

		execute_moveright_beyondmemorymultiple: function (testData) {

			var vm = this._newVm(testData);
			vm.load(">>>>");
			vm.dp = vm.memory.length - 2;

			var eventMonitor = Test.monitor();
			vm.execute(eventMonitor);

			Assert.isSame(1, eventMonitor.calls.length, "Incorrect number of events raised");
			Assert.isSame(BFVM.EventId.RUNTIME_ERROR, eventMonitor.calls[0][0], "Incorrect event type raised");
			Assert.isSame("Attempted to move beyond upper limit of memory", eventMonitor.calls[0][1].message, "Incorrect error message");

		},

		execute_moveleft: function (testData) {

			var vm = this._newVm(testData);
			vm.load("<");
			vm.dp = 1;

			vm.execute();

			Assert.isSame(0, vm.dp, "Data pointer wasn't updated correctly");

		},

		execute_moveleft_multiple: function (testData) {

			var vm = this._newVm(testData);
			vm.load("<<<<<");
			vm.dp = 6;

			vm.execute();

			Assert.isSame(1, vm.dp, "Data pointer wasn't updated correctly");

		},

		execute_moveleft_beyondmemory: function (testData) {

			var vm = this._newVm(testData);
			vm.load("<");

			var eventMonitor = Test.monitor();
			vm.execute(eventMonitor);

			Assert.isSame(1, eventMonitor.calls.length, "Incorrect number of events raised");
			Assert.isSame(BFVM.EventId.RUNTIME_ERROR, eventMonitor.calls[0][0], "Incorrect event type raised");
			Assert.isSame("Attempted to move beyond lower limit of memory", eventMonitor.calls[0][1].message, "Incorrect error message");

		},

		execute_moveleft_beyondmemorymultiple: function (testData) {

			var vm = this._newVm(testData);
			vm.load("<<<<<<");
			vm.dp = 3;

			var eventMonitor = Test.monitor();
			vm.execute(eventMonitor);

			Assert.isSame(1, eventMonitor.calls.length, "Incorrect number of events raised");
			Assert.isSame(BFVM.EventId.RUNTIME_ERROR, eventMonitor.calls[0][0], "Incorrect event type raised");
			Assert.isSame("Attempted to move beyond lower limit of memory", eventMonitor.calls[0][1].message, "Incorrect error message");

		},

		execute_add: function (testData) {

			var vm = this._newVm(testData);
			vm.load("+");

			vm.execute();

			Assert.isSame(1, vm.memory[0], "Cell wasn't incremented correctly");
			Assert.isSame(0, vm.dp, "Data pointer was changed");

		},

		execute_add_multiple: function (testData) {

			var vm = this._newVm(testData);
			vm.load("++++");

			vm.execute();

			Assert.isSame(4, vm.memory[0], "Cell wasn't incremented correctly");
			Assert.isSame(0, vm.dp, "Data pointer was changed");

		},

		execute_add_notfirstcell: function (testData) {

			var vm = this._newVm(testData);
			vm.load("+++++");
			vm.dp = 7;

			vm.execute();

			Assert.isSame(5, vm.memory[7], "Cell wasn't incremented correctly");
			Assert.isSame(0, vm.memory[0], "First cell was changed");
			Assert.isSame(7, vm.dp, "Data pointer was changed");

		},

		execute_sub: function (testData) {

			var vm = this._newVm(testData);
			vm.load("-");

			vm.execute();

			Assert.isSame(testData.minusOne, vm.memory[0], "Cell wasn't decremented correctly");
			Assert.isSame(0, vm.dp, "Data pointer was changed");

		},

		execute_sub_multiple: function (testData) {

			var vm = this._newVm(testData);
			vm.load("------");

			vm.execute();

			Assert.isSame(testData.minusOne-5, vm.memory[0], "Cell wasn't decremented correctly");
			Assert.isSame(0, vm.dp, "Data pointer was changed");

		},

		execute_sub_notfirstcell: function (testData) {

			var vm = this._newVm(testData);
			vm.load("---");
			vm.dp = 5;

			vm.execute();

			Assert.isSame(testData.minusOne-2, vm.memory[5], "Cell wasn't decremented correctly");
			Assert.isSame(0, vm.memory[0], "First cell was changed");
			Assert.isSame(5, vm.dp, "Data pointer was changed");

		},

		excute_loop_empty: function (testData) {

			var vm = this._newVm(testData);
			vm.load("[]");

			vm.execute();

			Assert.isSame(0, vm.dp, "Data pointer was changed");
		},

		execute_loop_zerocell: function (testData) {

			var vm = this._newVm(testData);
			vm.load("[-]");
			vm.memory[0] = 10;

			vm.execute();

			Assert.isSame(0, vm.memory[0], "Cell wasn't zeroed");
			Assert.isSame(0, vm.dp, "Data pointer was changed");

		},

		execute_loop_nested: function (testData) {

			var vm = this._newVm(testData);
			vm.load("[[-]>]");
			vm.memory[0] = 3;
			vm.memory[1] = 5;
			vm.memory[2] = 7;

			vm.execute();

			Assert.isSame(0, vm.memory[0], "Cell 0 wasn't cleared");
			Assert.isSame(0, vm.memory[1], "Cell 1 wasn't cleared");
			Assert.isSame(0, vm.memory[2], "Cell 2 wasn't cleared");
			Assert.isSame(3, vm.dp, "Data pointer wasn't updated correctly");

		},

		execute_out: function (testData) {

			var vm = this._newVm(testData);
			vm.load(".");
			vm.memory[5] = 65;
			vm.dp = 5;

			var eventMonitor = Test.monitor();
			vm.execute(eventMonitor);

			Assert.isSame(BFVM.EventId.STDOUT, eventMonitor.calls[0][0], "Incorrect event id registered");
			Assert.isSame("A", eventMonitor.calls[0][1], "Wrong value output");
			Assert.isSame(5, vm.dp, "Data pointer was changed");

		},

		execute_in: function (testData) {

			var vm = this._newVm(testData);
			vm.load(",");
			vm.dp = 7;
			vm.io.stdin = "C";

			vm.execute();

			Assert.isSame(67, vm.memory[7], "Wrong value input");
			Assert.isSame(7, vm.dp, "Data pointer was changed");

		},

		execute_in_yield: function (testData) {

			var vm = this._newVm(testData);
			vm.load(",");

			var eventMonitor = Test.monitor();
			vm.execute(eventMonitor);

			Assert.isSame(1, eventMonitor.calls.length, "Incorrect number of events raised");
			Assert.isSame(BFVM.EventId.NEEDS_INPUT, eventMonitor.calls[0][0], "Incorrect event id reported");

			vm.io.stdin = "A";

			vm.execute(eventMonitor);

			Assert.isSame(2, eventMonitor.calls.length, "Incorrect number of events raised");
			Assert.isSame(BFVM.EventId.END, eventMonitor.calls[1][0], "Incorrect event id reported");
			Assert.isSame(65, vm.memory[0], "Incorect value read into memory");

		},


		execute_in_eof_zero: function (testData) {

			var vm = this._newVm(testData);
			vm.load("++,");
			vm.io.close();

			var eventMonitor = Test.monitor();
			vm.execute(eventMonitor);

			Assert.isSame(1, eventMonitor.calls.length, "Incorrect number of events raised");
			Assert.isSame(BFVM.EventId.END, eventMonitor.calls[0][0], "Incorrect event id reported");
			Assert.isSame(0, vm.memory[0], "Memory location set incorrectly on EOF result");

		},

		execute_in_eof_minusOne: function (testData) {

			var vm = this._newVm(testData);
			vm.io.eofBehaviour = BFVM.EofBehaviour.MINUS_ONE;
			vm.load("++,");
			vm.io.close();

			var eventMonitor = Test.monitor();
			vm.execute(eventMonitor);

			Assert.isSame(1, eventMonitor.calls.length, "Incorrect number of events raised");
			Assert.isSame(BFVM.EventId.END, eventMonitor.calls[0][0], "Incorrect event id reported");
			Assert.isSame(testData.minusOne, vm.memory[0], "Memory location set incorrectly on EOF result");

		},

		execute_in_eof_noChange: function (testData) {

			var vm = this._newVm(testData);
			vm.io.eofBehaviour = BFVM.EofBehaviour.NO_CHANGE;
			vm.load("++,");
			vm.io.close();

			var eventMonitor = Test.monitor();
			vm.execute(eventMonitor);

			Assert.isSame(1, eventMonitor.calls.length, "Incorrect number of events raised");
			Assert.isSame(BFVM.EventId.END, eventMonitor.calls[0][0], "Incorrect event id reported");
			Assert.isSame(2, vm.memory[0], "Memory location set incorrectly on EOF result");

		},

		execute_EventId_end: function (testData) {

			var vm = this._newVm(testData);
			vm.load("++++++++++[-]");

			var eventMonitor = Test.monitor();
			vm.execute(eventMonitor);

			Assert.isSame(1, eventMonitor.calls.length, "Incorrect number of events raised");
			Assert.isSame(BFVM.EventId.END, eventMonitor.calls[0][0], "Incorrect event id reported");
		},

		execute_EventId_yield: function (testData) {

			var vm = this._newVm(testData, {
				"Date": {
					now: Test.monitor([1, 101])
				}
			});

			vm.load("+[]++");

			var eventMonitor = Test.monitor();
			vm.execute(eventMonitor);

			Assert.isSame(1, eventMonitor.calls.length, "Incorrect number of events raised");
			Assert.isSame(BFVM.EventId.YIELD, eventMonitor.calls[0][0], "Incorrect event id reported");
			Assert.isSame(2, vm.ip, "Instruction pointer not set at next instruction correctly");

			// Force the ip to break out of the loop so we can check ed ended state
			vm.ip = 3;

			vm.execute(eventMonitor);

			Assert.isSame(2, eventMonitor.calls.length, "Incorrect number of events raised");
			Assert.isSame(BFVM.EventId.END, eventMonitor.calls[1][0], "Incorrect event id reported, expected END");
			Assert.isSame(3, vm.memory[0], "Memory cell wasn't set correctly");

		},

		execute_helloworld: function (testData) {

			var vm = this._newVm(testData);
			vm.load("++++++++[>++++[>++>+++>+++>+<<<<-]>+>+>->>+[<]<-]>>.>---.+++++++..+++.>>.<-.<.+++.------.--------.>>+.>++.");

			var eventMonitor = Test.monitor();
			vm.execute(eventMonitor);

			Assert.isSame(BFVM.EventId.END, eventMonitor.calls[eventMonitor.calls.length-1][0], "Incorrect event id reported");

			// Build the output
			var output = "";
			for (var i = 0; i < eventMonitor.calls.length-1; i++) {
				Assert.isSame(BFVM.EventId.STDOUT, eventMonitor.calls[i][0], "Wrong event id logged");
				output += eventMonitor.calls[i][1];
			}
			Assert.isEqual("Hello World!\n", output, "Incorrect output from program");

			Test.log(output);

		},

	};

})();