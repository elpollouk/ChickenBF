(Chicken.register("BFVM", [], function () {

	return {
		StopReason: {
			END: 0,
			NEEDS_INPUT: 1,
			YIELD: 2,

			FAULT_DP_LOW: -1,
			FAULT_DP_HIGH: -2,
		},

		EofBehaviour: {
			MINUS_ONE: -1,
			ZERO: 0,
			NO_CHANGE: 1
		}
	};

}));