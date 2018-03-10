/* global tester, output */

function Result() {
	
	this.stack = [];
	this.lastBodyId = [];
	this.lastHeaderId = [];

	this.init = function() {
		//document.getElementById('btnResult').addEventListener('click', this.loadResult.bind(this));
	};

	this.loadResult = function() {
		var r = new Request();
		
		/**
		 * @param {XMLHttpRequest} xhr
		 */
		r.success = function(xhr) {
			var data = null;
			try {
				data = JSON.parse(xhr.responseText);
			} catch(e) { console.error(e); }

			
		};
		// Force fresh request
		r.get('result.json?cache=' + +new Date());
	};

	this.reset = function() {
		this.lastBodyId = [];
		this.lastHeaderId = [];
	};

	/**
	 * Search ID in given Pool
	 */
	this.findId = function(id, pool) {
		if(id === "" || pool.length <= 0) {
			return false;
		}
		for(var i = 0; i < pool.length; i++) {
			if(pool[i] === id) {
				return true;
			}
		}
		return false;
	}

	this.add = function(test, step_count, xhr) {

		var step = test.steps[step_count];

		step.allRespondedHeader = xhr.getAllResponseHeaders();
		step.headerId = xhr.getResponseHeader('X-Id');
		step.status = xhr.status;
		step.bodyResponse = xhr.responseText;
		step.bodyId = "";

		this.bodyResponse(step);

		step.responseHeader = {};
		step.requestHeader = {};
		step.respondedHeader = {};
		step.missingHeaders = {};

		if(step.params.s !== undefined) {
			var server = parseHeader(step.params.s);
			for(var name in server) {
				if(name === "st") {
					continue;
				}
				var realname = headerFields[name];
				step.responseHeader[realname] = server[name];
				step.respondedHeader[realname] = xhr.getResponseHeader(realname);

				// Expires header has Date String. Approximate expires is correct
				if(realname == "Expires" || realname == "Last-Modified") {
					if(!step.respondedHeader[realname] || step.respondedHeader[realname] == "") {
						step.missingHeaders[realname] = server[name];
					}
				}
				// Set-Cookie: can't access Cookie String
				else if(realname == "Set-Cookie") {

				} else if(step.responseHeader[realname] != step.respondedHeader[realname]) {
					step.missingHeaders[realname] = server[name];
                }
			}
		}

		if(step.params.c !== undefined) {
			var client = parseHeader(step.params.c);
			for(var name in client) {
				step.requestHeader[headerFields[name]] = client[name];
			}
		}
		
		if(!document.getElementById('small_output').checked) {
			log("Response Header: " + JSON.stringify(step.respondedHeader));
			if(step.bodyId != "" && step.bodyResponse.length < 75) {
				log("Body: " + step.bodyResponse);
			} else {
				log("Body: Ressource: " + xhr.getResponseHeader('content-type'));
			}
		}

		this.validateResponse(step);

		this.lastBodyId.push(step.bodyId);
		this.lastHeaderId.push(step.headerId);

        output.renderTest(test);

		this.addToStack(test, step);
	};

	this.bodyResponse = function(step) {
		step.bodyId = step.bodyResponse;
		// Plain-Text
		if(step.bodyResponse.substr(0, 3) === "Id:") {
			step.bodyId = step.bodyResponse.substr(3);
			return;
		}
		// css
		if(step.bodyResponse.indexOf("font-family") !== -1) {
			step.bodyId = step.bodyResponse.replace(/.*: ([0-9]+).*/, "$1");
			return;
		}
		// xml
		if(step.bodyResponse.indexOf("xml") !== -1) {
			step.bodyId = step.bodyResponse.replace(/.*<id>([0-9]+).*/, "$1");
			return;
		}
		// JSON - do not parse, it could be a range or custom content-length
		if(step.bodyResponse.indexOf("\"Id\":") !== -1) {
			step.bodyId = step.bodyResponse.replace(/.*"Id":"([0-9]+).*/, "$1");
			return;
		}
	};

	this.checkDate = function(dateString, expectedDiff) {
		var date = new Date(dateString);
		if(date) {
			var diff = (date.getTime() - new Date().getTime()) / 1000;
			// Request should not took longer than 1 second - It's local!
			var expectedDiff = parseInt(expectedDiff);
			var x = (diff >= expectedDiff + 1 || diff >= expectedDiff - 1) ? true : false;
			return (diff >= expectedDiff + 1 || diff >= expectedDiff - 1) ? true : false;

		}
		return false;
	};

	this.addToStack = function(test, entry) {
		var data = this.getTest(test);
		if(data === false) {
			this.stack.push({id : test.id, name: test.name, steps : [entry]});
		} else {
			data.steps.push(entry);
		}
	};

	this.getTest = function(test) {
		for(var i = 0; i < this.stack.length; i++) {
			if(this.stack[i].id == test.id) {
				return this.stack[i];
			}
		}
		return false;
	};

	/**
	 * Daten an den Server übermitteln
	 * @param function callback
	 */
	this.sendData = function(test, callback) {
		if(document.getElementById('saveTest').checked) {
			
			var r = new Request();
			r.success = function(xhr) {
				callback();
			};
			
			var formData = new FormData();
			formData.append("data", JSON.stringify(this.prepareData(test)));
			r.post('save.json', formData);

		} else {
			callback();
		}
		
	};

	this.prepareData = function(test) {
		test.ok = true;
		for(var i = 0; i < test.steps.length; i++) {
			if(test.steps[i].validated) {
				if(test.steps[i].validated.ok === null) {
					test.ok = null;
					break;
				}
				if(test.steps[i].validated.ok === false) {
					test.ok = false;
					break;
				}
			}
		}
		for(var i = 0; i < test.steps.length; i++) {
			// truncate long strings
			if(test.steps[i].bodyId.length > 100) {
				test.steps[i].bodyId = test.steps[i].bodyId.substr(0, 100);
			}
			test.steps[i].bodyResponse = null;
		}
		return test;
	};

	this.validateResponse = function(step) {
		// When no expection is given, every result must be correct
		step.validated = {
			ok : null
		};

		// Ergebnis verarbeiten
		step.validated['st'] = {'expection' : null, 'received' : step.status, 'ok' : null, 'message' : null};
		step.validated['ch'] = {'expection' : null, 'received' : this.findId(step.headerId, this.lastHeaderId), 'ok' : null, 'message' : step.headerId};
		step.validated['cb'] = {'expection' : null, 'received' : this.findId(step.bodyId, this.lastBodyId), 'ok' : null, 'message' : step.bodyId};

		if(!step.params.e) {
			return true;
		}

		var ok = true;
		for(var i = 0; i < step.params.e.length; i++) {
			ok = true;
			var expection = parseHeader(step.params.e[i]);

			// Do not rate when cb & ch not present
			if(typeof(expection.ch) === "undefined" && typeof(expection.cb) === "undefined") {

			} else if(typeof(expection.cb) === "undefined") {
				expection.cb = (expection.ch) ? expection.ch : null;
			} else if(typeof(expection.ch) === "undefined") {
				expection.ch = false;
			}

			// parse expection
			for(var key in expection) {
				var val = expection[key];
				if(step.validated[key] && step.validated[key].ok == true) {
					continue;
				}

				switch (key){
					case 'st':
						step.validated[key].expection = parseInt(val);
						break;
					case 'ch':
					case 'cb':
						step.validated[key].expection = (val == "true") ? true : false;
						break;
				}
			}
			// status: 304: Body-response must be empty
			if(step.validated['st'].expection === 304) {
				step.validated['cb'].expection = null
				// bodyId = message
				if(step.validated['cb'].message == "") {
					step.validated['cb'].ok = true;
					step.validated['cb'].received = null;
				} else {
					step.validated['cb'].ok = false;
					ok = false;
				}

			}


			for(var key in expection) {
				var current = step.validated[key];
				if(current.expection == current.received) {
					current.ok = true;
				} else {
					ok = current.ok = false;
				}
			}

			if(ok) {
				break;
			}
		}
		step.validated.ok = ok;
	
		return ok;
	};

	this.init();
};

var result = new Result();