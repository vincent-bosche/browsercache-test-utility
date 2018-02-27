/**
 * 
 * @returns {Request}
 */
function Request() {
	
	/**
	 * 
	 * @param {string} url
	 * @param {string} method
	 * @param {Object} requestHeader
	 * @param {Object} responseHeader
	 */
	this.create = function(url, method, requestHeader, responseHeader) {
		var r = new XMLHttpRequest();
		r.open(method.toUpperCase(), url);
		r.addEventListener('readystatechange', this.stateChanged.bind(this, r));
		//r.timeout = 2000; // time in milliseconds

		if(responseHeader !== null) {
			for(var name in responseHeader) {
				r.setRequestHeader("X-" + name, responseHeader[name]);
			}
		}
		if(requestHeader !== null) {
			for(var name in requestHeader) {
				if(typeof(headerFields[name]) === "undefined") {
					log("Header field not found: " + name, "danger");
				}
				r.setRequestHeader(headerFields[name], requestHeader[name]);
			}
		}
		return r;
	};
	
	/**
	 * 
	 * @param {string} url
	 * @param {Object} requestHeader
	 * @param {Object} responseHeader
	 */
	this.get = function(url, requestHeader, responseHeader) {
		this.r = this.create(url, 'GET', requestHeader, responseHeader);
		this.r.send(null);
	};
	
	this.post = function(url, data, requestHeader, responseHeader) {
		var r = this.create(url, 'POST', requestHeader, responseHeader);
		r.send(data);
	};
	
	this.put = function(url, data, requestHeader, responseHeader) {
		var r = this.create(url, 'PUT', requestHeader, responseHeader);
		r.send(data);
	};

	this.patch = function(url, data, requestHeader, responseHeader) {
		var r = this.create(url, 'PATCH', requestHeader, responseHeader);
		r.send(data);
	};
	
	this.delete = function(url, requestHeader, responseHeader) {
		var r = this.create(url, 'DELETE', requestHeader, responseHeader);
		r.send(null);
	};
	
	/**
	 * Handle state changes
	 * @param {XMLHttpRequest} xhr
	 * @param {Event} e
	 */
	this.stateChanged = function (xhr, e) {
		if(xhr.readyState === 4) {
			// 400er & 500er are in some testcases
			//if(xhr.status >= 200) {
				this.success(xhr);
			//} else {
				//this.error(xhr);
			//}
		}
	};

	/**
	 * to be overwritten
	 * @param {XMLHttpRequest} xhr
	 */
	this.error = function(xhr) {
		log(xhr.status + ': ' + xhr.statusText + '<br>' + xhr.responseURL, "danger");
	};

	// To be overwritten
	this.success = function(xhr) {

	};

	return this;
};