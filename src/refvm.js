(function() {

	var RefVM = function () {

	};

	RefVM.prototype.load = function RefVM_load(prog) {
		throw new Error("Not implemented");
	};

	RefVM.prototype.execute = function RefVM_execute() {
		throw new Error("Not implemented");
	};


	window.RefVM = RefVM;

})();