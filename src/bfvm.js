(Chicken.register("BFVM", [], function () {

	return {
		EventId: {
			END: 0,
			YIELD: 1,
			NEEDS_INPUT: 2,
			STDOUT: 3,

			RUNTIME_ERROR: -1
		},

		EofBehaviour: {
			MINUS_ONE: -1,
			ZERO: 0,
			NO_CHANGE: 1
		}
	};

}));