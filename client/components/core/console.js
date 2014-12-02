// TODO make this a application.properties parameter
var enableConsole = true;

// @see https://getfirebug.com/logging
if ((enableConsole == false) || typeof console === "undefined" || typeof (console.log) !== "function") {
	// console not available or disabled
	console = {
	    log : function() {
	    },
	    debug : function(msg) {
	    },
	    info : function() {
	    },
	    warn : function() {
	    },
	    error : function() {
	    },
	    dir : function() {
	    },
	    dirxml : function() {
	    },
	    assert : function() {
	    },
	    group : function() {
	    },
	    groupCollapsed : function() {
	    },
	    groupEnd : function() {
	    },
	    trace : function() {
	    },
	    time : function() {
	    },
	    timeEnd : function() {
	    }
	};

}
if ((enableConsole == true) && typeof (console.log) === "function") {
	// if only console.log exists, redirect other methods to console.log
	if (typeof (console.debug) !== "function") {
		console.debug = function(msg) {
			console.log(msg);
		};
	}
	if (typeof (console.info) !== "function") {
		console.info = function(msg) {
			console.log(msg);
		};
	}
	if (typeof (console.debug) !== "function") {
		console.debug = function(msg) {
			console.log(msg);
		};
	}
	if (typeof (console.warn) !== "function") {
		console.warn = function(msg) {
			console.log(msg);
		};
	}
	if (typeof (console.error) !== "function") {
		console.error = function(msg) {
			console.log(msg);
		};
	}
	if (typeof (console.debug) !== "function") {
		console.debug = function(msg) {
			console.log(msg);
		};
	}
	if (typeof (console.dir) !== "function") {
		console.dir = function() {
		};
	}
	if (typeof (console.dirxml) !== "function") {
		console.dirxml = function() {
		};
	}
	if (typeof (console.assert) !== "function") {
		console.assert = function() {
		};
	}
	if (typeof (console.group) !== "function") {
		console.group = function() {
		};
	}
	if (typeof (console.groupCollapsed) !== "function") {
		console.groupCollapsed = function() {
		};
	}
	if (typeof (console.groupEnd) !== "function") {
		console.groupEnd = function() {
		};
	}
	if (typeof (console.trace) !== "function") {
		console.trace = function() {
		};
	}
	if (typeof (console.time) !== "function") {
		console.time = function() {
		};
	}
	if (typeof (console.timeEnd) !== "function") {
		console.timeEnd = function() {
		};
	}
}
