(Chicken.register("BfIO", ["BFVM"], function (BFVM) {

	return Chicken.Class(function () {
		this.stdin = "";
		this.eofBehaviour = BFVM.EofBehaviour.ZERO;
	}, {

		getch: function (originalValue) {

			if (this.stdin === null) {
				switch (this.eofBehaviour) {
					case BFVM.EofBehaviour.MINUS_ONE:
						return -1;

					case BFVM.EofBehaviour.NO_CHANGE:
						return originalValue;

					default:
						return 0;
				}
			}

			if (this.stdin.length === 0) return null;

			var r = this.stdin.charCodeAt(0);
			this.stdin = this.stdin.slice(1);

			return r;
		},
		
		close: function () {
			this.stdin = null;
		}
	});

}));