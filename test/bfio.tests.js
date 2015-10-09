(function () {
	"use strict";

	window.Tests.BfIOTests = {

		_newIO: function () {
			var bfio = Chicken.fetch("BfIO");
			return new bfio();
		},

		getch: function () {

			var io = this._newIO();
			io.stdin = "DEF";

			Assert.isSame(68, io.getch(), "Didn't read D");
			Assert.isSame(69, io.getch(), "Didn't read E");
			Assert.isSame(70, io.getch(), "Didn't read F");
			Assert.isSame(-1, io.getch(), "Didn't read EOF");
			Assert.isSame(-1, io.getch(), "Didn't read EOF`");

		},

		putch: function () {

			var io = this._newIO();

			io.putch(65);
			io.putch(66);
			io.putch(67);

			Assert.isSame("ABC", io.stdout, "Didn't output ABC");

		},
		
	};
})();