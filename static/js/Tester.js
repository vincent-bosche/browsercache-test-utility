/* global result */

function Tester() {
	this.request = new Request();

	this.step = 0;
	this.urlPath = "";
	this.urlParams = "";
	this.stop = false;

	this.case = null;
	this.incognito = 0;
	this.shared = 0;

	this.btnStart = document.getElementById('btnStart');
	this.btnStop = document.getElementById('btnStop');

	this.init = function() {
		this.btnStart.addEventListener('click', this.startButton.bind(this));
		this.btnStop.addEventListener('click', this.stopButton.bind(this));
	};

	this.execute = function() {

		if(this.case.steps.length <= this.step) {
			this.finished();
			return;
		}
		
		log("Test " + this.case.id + ", Step: " + this.step, "info t-" + this.case.id.replace(/\./g, "-"));

		var step = this.case.steps[this.step];
		var params = step.params ? step.params : {};

		/**
		 * @param {xhr} XMLHttpRequest
		 */
		this.request.success = function(xhr) {
			try {
				result.add(this.case, this.step, xhr);

				this.step++;
				if(this.stop) {
					return;
				}
				var delay = 1;
				// If delay, wait the time
				if(typeof(params.p) !== "undefined" && params.p > 0) {
					log("Waiting for: " + params.p + ' seconds', "gray");
					delay = params.p > 0 ? params.p : 0;
				}
				setTimeout(this.execute.bind(this), delay * 1000);

			} catch(e) {
				console.error(e);
			}
		}.bind(this);

		var responseHeader = (typeof(params.s) !== "undefined") ? {'response-string' : params.s} : {};
		var requestHeader = (typeof(params.c) !== "undefined") ? parseHeader(params.c) : {};
		requestHeader['id'] = +new Date();
		log("Sending request with requestHeader: " + JSON.stringify(requestHeader) + " setting responseHeader: " + JSON.stringify(responseHeader));
		
		var url = this.urlPath + step.url + this.urlParams;
		var data = new FormData();
		switch(step.method) {
			case 'PUT':
				this.request.put(url, data, requestHeader, responseHeader);
				break;
			case 'DELETE':
				this.request.delete(url, requestHeader, responseHeader);
				break;
			case 'POST':
				this.request.post(url, data, requestHeader, responseHeader);
				break;
			case 'PATCH':
				this.request.patch(url, data, requestHeader, responseHeader);
				break;
			default:
				this.request.get(url, requestHeader, responseHeader);
				break;
		}
	};

	this.convertHeader = function(headers) {
		if(object.keys(headers).length === 0) {
			return {};
		}
		for(var name in headers) {
			var header = header[key];
		}
	};


	/**
	 * Test finish - start next test
	 */
	this.finished = function() {
		log("Finished Test " + this.case.id, "gray");
		log("###", "gray");

		result.reset();

		this.case.incognito = this.incognito;
		this.case.cycle = testCase.data.cycle;
		
		// Send testresponse to Servercallback
		result.sendData(this.case, function() {

			// load next test
			setTimeout(this.start.bind(this), 100);
		}.bind(this));
	};

	/**
	 * Start current test
	 */
	this.start = function() {
		if(this.stop) {
			return;
		}
		this.changeTest();

		if(this.case === null) {
			log("There is no (next) test case", "red");
			this.btnStop.style.display = 'none';
			return;
		}
		this.execute();
	};

	this.startButton = function() {

		this.getFilteredTests();

		this.stop = false;
		this.incognito = document.getElementById('incognito').checked ? true : false;
		this.shared = document.getElementById('shared').checked ? true : false;

		this.btnStop.style.display = 'inline-block';
		this.btnStart.style.display = 'none';

		this.start();
	};

	this.stopTest = function() {
		this.stop = true;
		this.btnStop.style.display = 'none';
		this.btnStart.style.display = 'inline-block';
	};

	this.stopButton = function() {
		log("Stopping current test..", "danger");
		this.stopTest();
	};

	/**
	 * 
	 */
	this.changeTest = function() {
		this.step = 0;
		this.urlPath = "";
		this.urlParams = "";
		this.case = null;

		var next = testCase.nextTest();
		if(next === false) {
			return;
		}
		this.case = next;
	
		// Generate for each test a unique URL
		this.urlParams = "?test=" + this.case.id + '&ts=' + +new Date();
		// Check "Set-Cookie" and set a custom path. The Cookie is only valid for the specific path
		for(var i = 0; i < this.case.steps.length; i++) {
			if(this.case.steps[i].params.s && this.case.steps[i].params.s.indexOf("sc:") !== -1) {
				this.urlPath = this.case.id.replace(/\./g, "-");
				break;
			}
		}

		// Skip test for shared Caches
		if(this.case !== null) {
			if(this.case.sharedCache && !this.shared) {
				log("Skipping test " + this.case.id + " because it's only for shared caches", "info");
				this.changeTest();
				return;
			}
			if(this.case.hasTerminate) {
				log("Skipping test " + this.case.id + " because it's require to shut down the server", "info");
				this.changeTest();
				return;
			}
		}
	};

	this.getFilteredTests = function() {
		var selectedCase = document.getElementById('testSelect').value;
		if(selectedCase == "") {
			testCase.reset();
		} else {
			testCase.filter([selectedCase]);
		}
	};

	this.init();

	return this;
};

var tester = new Tester();

