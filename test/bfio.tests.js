(function () {
	"use strict";

	var BFVM = Chicken.fetch("BFVM");

	window.Tests.BfIOTests = {

		_newIO: function (eofBehaviour) {
			var bfio = Chicken.fetch("BfIO");
			var io = new bfio();
			io.eofBehaviour = eofBehaviour;
			return io;
		},

		getch: function () {

			var io = this._newIO();
			io.stdin = "DEF";

			Assert.isSame(68, io.getch(), "Didn't read D");
			Assert.isSame(69, io.getch(), "Didn't read E");
			Assert.isSame(70, io.getch(), "Didn't read F");
			Assert.isSame(null, io.getch(), "Didn't get null input");
			Assert.isSame(null, io.getch(), "Didn't get null input");

		},

		close_getch_minusOne: function () {

			var io = this._newIO(BFVM.EofBehaviour.MINUS_ONE);

			io.close();

			Assert.isSame(-1, io.getch(123), "Wrong close value returned");

		},

		close_getch_zero: function () {

			var io = this._newIO(BFVM.EofBehaviour.ZERO);

			io.close();

			Assert.isSame(0, io.getch(123), "Wrong close value returned");

		},

		close_getch_samevalue: function () {

			var io = this._newIO(BFVM.EofBehaviour.NO_CHANGE);

			io.close();

			Assert.isSame(123, io.getch(123), "Wrong close value returned");

		},

	};
})();