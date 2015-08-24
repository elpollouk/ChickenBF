(function () {
	"use strict";

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
			vm.load("><+[-]");

		},

		load_comments: function () {

			var vm = this._newVm();
			vm.load("abcdefg");

		},


		execute_moveright: function () {

			var vm = this._newVm();
			vm.load(">");

			vm.execute();

			Assert.isSame(1, vm.dp, "Data pointer wasn't updated correctly");

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

		},

		execute_sub: function () {

			var vm = this._newVm();
			vm.load("-");

			vm.execute();

			Assert.isSame(-1, vm.memory[0], "Cell wasn't decremented correctly");

		},

	};

})();