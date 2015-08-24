(function () {
	"use strict";

	var MockIO = function () {
		this.data = -1;
	};

	MockIO.prototype.getch = function () {
		return this.data;
	};

	MockIO.prototype.putch = function (value) {
		this.data = value;
	};

	window.Tests.RefVmTests = {

		_newVm: function () {
			return new RefVM();
		},

		construct: function () {

			var vm = this._newVm();

			Assert.isSame(30000, vm.memory.length, "Memory size wasn't correct");
			for (var i = 0; i < vm.memory.length; i++) {
				Assert.isSame(0, vm.memory[i], "Memory wasn't initialised to zero");
			}
			Assert.isSame(0, vm.dp, "Data pointer wasn't initialised correctly");
			Assert.isNotNull(vm.io, "IO handler wasn't initialised");
			Assert.isTrue(vm.io.getch instanceof Function, "IO getch wasn't initialised");
			Assert.isTrue(vm.io.putch instanceof Function, "IO putch wasn't initialised");
		},

		load_emptyprog: function () {

			var vm = this._newVm();
			vm.load("");

		},

		load_nullprog: function () {

			var vm = this._newVm();

			try {
				vm.load(null);
				Assert.fail("No exception thrown");
			}
			catch (ex)
			{
				Assert.isEqual("Illegal Argument", ex.message, "Wrong exception thrown");
			}

		},

		load_validprog: function () {

			var vm = this._newVm();
			vm.load("><+[-].,");

		},

		load_comments: function () {

			var vm = this._newVm();
			vm.load("abcdefg");

		},

		load_invalidopenloop: function () {

			var vm = this._newVM();

			try {
				vm.load("[[][][]");
				Assert.fail("No exception thrown");
			}
			catch (ex) {
				Assert.isEqual("Loop opened but not closed", ex.message, "Wrong exception thrown");
			}

		},

		load_invalidcloseloop: function () {

			var vm = this._newVM();

			try {
				vm.load("[][][]][]");
				Assert.fail("No exception thrown");
			}
			catch (ex) {
				Assert.isEqual("Loop closed but not opened", ex.message, "Wrong exception thrown");
			}

		},

		execute_moveright: function () {

			var vm = this._newVm();
			vm.load(">");

			vm.execute();

			Assert.isSame(1, vm.dp, "Data pointer wasn't updated correctly");

		},

		execute_moveright_multiple: function () {

			var vm = this._newVm();
			vm.load(">>>>>");

			vm.execute();

			Assert.isSame(5, vm.dp, "Data pointer wasn't updated correctly");

		},

		execute_moveright_beyondmemory: function () {

			var vm = this._newVm();
			vm.load(">");
			vm.dp = vm.memory.length - 1;

			try {
				vm.execute();
				Assert.fail("No exception thrown");
			}
			catch (ex) {
				Assert.isTrue(ex instanceof RangeError, "Wrong exception thrown");
			}

		},

		execute_moveleft: function () {

			var vm = this._newVm();
			vm.load("<");
			vm.dp = 1;

			vm.execute();

			Asert.isSame(0, vm.dp, "Data pointer wasn't updated correctly");

		},

		execute_moveleft_multiple: function () {

			var vm = this._newVm();
			vm.load("<<<<<");
			vm.dp = 6;

			vm.execute();

			Assert.isSame(1, vm.dp, "Data pointer wasn't updated correctly");

		},

		execute_moveleft_beyondmemory: function () {

			var vm = this._newVm();
			vm.load("<");

			try {
				vm.execute();
				Assert.fail("No exception thrown");
			}
			catch (ex) {
				Assert.isTrue(ex instanceof RangeError, "Wrong exception thrown");
			}
		},

		execute_add: function () {

			var vm = this._newVm();
			vm.load("+");

			vm.execute();

			Assert.isSame(1, vm.memory[0], "Cell wasn't incremented correctly");
			Assert.isSame(0, vm.dp, "Data pointer was changed");

		},

		execute_add_multiple: function () {

			var vm = this._newVm();
			vm.load("++++");

			vm.execute();

			Assert.isSame(4, vm.memory[0], "Cell wasn't incremented correctly");
			Assert.isSame(0, vm.dp, "Data pointer was changed");

		},

		execute_add_notfirstcell: function () {

			var vm = this._newVm();
			vm.load("+++++");
			vm.dp = 7;

			vm.execute();

			Assert.isSame(5, vm.memory[7], "Call wasn't incremented correctly");
			Assert.isSame(0, vm.memory[0], "First cell was changed");
			Assert.isSame(7, vm.dp, "Data pointer was changed");

		},

		execute_sub: function () {

			var vm = this._newVm();
			vm.load("-");

			vm.execute();

			Assert.isSame(-1, vm.memory[0], "Cell wasn't decremented correctly");
			Assert.isSame(0, vm.dp, "Data pointer was changed");

		},

		execute_sub_multiple: function () {

			var vm = this._newVm();
			vm.load("------");

			vm.execute();

			Assert.isSame(-6, vm.memory[0], "Cell wasn't decremented correctly");
			Assert.isSame(0, vm.dp, "Data pointer was changed");

		},

		execute_sub_notfirstcell: function () {

			var vm = this._newVm();
			vm.load("---");
			vm.dp = 5;

			vm.execute();

			Assert.isSame(-3, vm.memory[5], "Call wasn't decremented correctly");
			Assiet.isSame(0, vm.memory[0], "First cell was changed");
			Assert.isSame(5, vm.dp, "Data pointer was changed");

		},

		excute_loop_empty: function () {

			var vm = this._newVm();
			vm.load("[]");

			vm.execute();

			Assert.isSame(0, vm.dp, "Data pointer was changed");
		},

		execute_loop_zerocell: function () {

			var vm = this._newVm();
			vm.load("[-]");
			vm.memory[0] = 10;

			vm.execute();

			Assert.isSame(0, vm.memory[0], "Cell wasn't zeroed");
			Assert.isSame(0, vm.dp, "Data pointer was changed");

		},

		execute_loop_nested: function () {

			var vm = this._newVm();
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

		execute_out_defaultio: function () {

			var vm = this._newVm();
			vm.load(".");

			vm.execute();

			Assert.isSame(0, vm.dp, "Data pointer was changed");

		},


		execute_out_mockio: function () {

			var vm = this._newVm();
			vm.io = new MockIO();
			vm.load(".");
			vm.memory[5] = 12;
			vm.dp = 5;

			vm.execute();

			Assert.isSame(12, vm.io.data, "Wrong value output");
			Assert.isSame(5, vm.dp, "Data pointer was changed");

		},

		execute_in_defaultio: function () {

			var vm = this._newVm();
			vm.load(",");

			vm.execute();

			Assert.isSame(-1, vm.memory[0], "Wrong value input");
			Assert.isSame(0, vm.dp, "Data pointer was changed");

		},

		execute_in_mockio: function () {

			var vm = this._newVm();
			vm.io = new MockIO();
			vm.load(",");
			vm.dp = 7;
			vm.io.data = 32;

			vm.execute();

			Assert.isSame(32, vm.memory[7], "Wrong value input");
			Assert.isSame(7, vm.dp, "Data pointer was changed");

		},

	};

})();