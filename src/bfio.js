(Chicken.register("BfIO", [], function () {

	return Chicken.Class(function () {
		this.stdin = "";
		this.stdout = "";
	}, {

		getch: function () {
			if (this.stdin.length == 0) return -1;

			var r = this.stdin.charCodeAt(0);
			this.stdin = this.stdin.slice(1);

			return r;
		},

		putch: function (value) {
			this.stdout += String.fromCharCode(value);
		}
		
	});

}));