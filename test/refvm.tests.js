(function () {
	"use strict";

	var StopReason = Chicken.fetch("BF_StopReason");

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

		_newVm: function (testData) {
			var refvm = Chicken.fetch(testData.vm);
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
			Assert.isTrue(vm.io.putch instanceof Function, "IO putch wasn't initialised");

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

			Assert.expectedException({
				type: RangeError,
				message: "Attempted to move beyond upper limit of memory"
			}, function () {
				vm.execute();
			});

		},

		execute_moveright_beyondmemorymultiple: function (testData) {

			var vm = this._newVm(testData);
			vm.load(">>>>");
			vm.dp = vm.memory.length - 2;

			Assert.expectedException({
				type: RangeError,
				message: "Attempted to move beyond upper limit of memory"
			}, function () {
				vm.execute();
			});

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

			Assert.expectedException({
				type: RangeError,
				message: "Attempted to move beyond lower limit of memory"
			}, function () {
				vm.execute();
			});

		},

		execute_moveleft_beyondmemorymultiple: function (testData) {

			var vm = this._newVm(testData);
			vm.load("<<<<<<");
			vm.dp = 3;

			Assert.expectedException({
				type: RangeError,
				message: "Attempted to move beyond lower limit of memory"
			}, function () {
				vm.execute();
			});

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

			vm.execute(testData);

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

			vm.execute();

			Assert.isSame("A", vm.io.stdout, "Wrong value output");
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

		execute_stopreason_end: function (testData) {

			var vm = this._newVm(testData);
			vm.load("++++++++++[-]");

			var reason = vm.execute();

			Assert.isSame(StopReason.END, reason, "Incorrect stop reason reported");
		},

		execute_stopreason_yield: function (testData) {

			var vm = this._newVm(testData);
			vm.config.yieldthreshold = 5;
			/*
			 This program should execute 11 branch instructions in total on the RefVM
			*/
			vm.load("++++++++++[-]");

			var reason = vm.execute();

			Assert.isSame(StopReason.YIELD, reason, "Incorrect stop reason reported, expected YIELD");
			Assert.isSame(6, vm.memory[0], "Program did not execute as long as expected");

			reason = vm.execute();

			Assert.isSame(StopReason.YIELD, reason, "Incorrect stop reason reported, expected YIELD again");
			Assert.isSame(1, vm.memory[0], "Program did not execute as long as expected");

			reason = vm.execute();

			Assert.isSame(StopReason.END, reason, "Incorrect stop reason reported, expected END");

		},

		execute_helloworld: function (testData) {

			var vm = this._newVm(testData);
			vm.load("++++++++[>++++[>++>+++>+++>+<<<<-]>+>+>->>+[<]<-]>>.>---.+++++++..+++.>>.<-.<.+++.------.--------.>>+.>++.");

			var reason = vm.execute();

			Test.log(vm.io.stdout);
			Assert.isEqual("Hello World!\n", vm.io.stdout, "Incorrect output from program");
			Assert.isSame(StopReason.END, reason, "Incorrect stop reason reported");

		},

	};

})();