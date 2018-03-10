/**
 * This script is called on every request.
 * It will return a static ressource, a list with all tests or the test specific response
 */
const fs					= require("fs");
const path 					= require("path");
const formidable			= require('formidable'); // for receiving JSON for the DB

const config				= require(__dirname + "/config.json");

const {requestHandler} 		= require(__dirname + "/requestHandler.js");
const {UserAgent}			= require(__dirname + "/UserAgent.js");
const {SaveToDB}			= require(__dirname + "/SaveToDB.js");
const {Results}				= require(__dirname + "/Results.js");
const {TestParser}			= require(__dirname + "/TestParser.js");

class Callback {
	
	constructor() {
	};

	start (req, res) {
		this.req = req;
		this.res = res;
		this.action();
	};

	action() {
		// return all tests
		if(this.req.url.indexOf("getTest.json") !== -1) {
			this.getTests();
		}

		// not implemented yet
		else if(this.req.url.indexOf("result.json") !== -1) {
			new Results(this.req);
		}

		// Callback for a test
		else if(this.req.url.indexOf("test=") !== -1) {
			requestHandler(this.req, this.res);

		}
		// Save results
		else if(this.req.url.indexOf("save.json") !== -1) {
			if(!this.db) {
				this.db = new SaveToDB();
			}
			var form = new formidable.IncomingForm();

			form.parse(this.req, function(err, fields, files) {
				try {
					var data = Object.assign(JSON.parse(fields['data']), UserAgent.parseUserAgent(this.req.headers['user-agent']));
					data.https = (this.req.headers.referer.substr(0, 8) == "https://") ? true : false;

					try {
						this.db.save(data);
						this.res.writeHead(200, {'content-type': 'text/plain'});
					} catch(e) {
						console.dir(e);
						this.res.writeHead(500, {'content-type': 'text/plain'});
					}
					this.res.end();

				} catch(e) {
					console.error(e);
				}
			}.bind(this));

		} else {
			this.showFile(this.req.url);
		}
	};

	// Response static files
	showFile(url) {
		if(url === "/") {
			url = "/index.html";
		}
		var file = __dirname + '/static' + url;

		try {
			fs.accessSync(file, fs.F_OK);
			this.res.writeHead(200, {'Content-Type' : config.mimeTypes[path.extname(file).split(".")[1]]});
			fs.createReadStream(file).pipe(this.res);
		} catch(e) {
			console.dir(e);
			console.log('File not exists: ' + file);
			this.res.writeHead(404, {'Content-Type' : 'text/plain'});
			this.res.write('404 Not Found\n');
			this.res.end();
			return;
		}
	};

	// Read all testcases
	getTests() {
		this.res.writeHead(200, {
			'Content-Type' : 'application/json',
			'Cache-Control' : 'no-store, no-cache, must-revalidate, post-check=0, pre-check=0',
			'Expires' : new Date(Date.now()).toUTCString()
		});
		let data = TestParser.getTests();
		data['user-agent'] = this.req.headers['user-agent'];
		data.UA = UserAgent.parseUserAgent(this.req.headers['user-agent']);
		this.res.end(JSON.stringify(data));
	};
};


exports.Callback = Callback;