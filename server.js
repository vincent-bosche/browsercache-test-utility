const http			= require("http");
const https			= require("https");
const fs			= require("fs");

const {Callback}	= require(__dirname + "/Callback.js");

const config		= require(__dirname + "/config.json");

const https_options = {
    key:  fs.readFileSync(__dirname  + "/" + config.cert.key),
    cert: fs.readFileSync(__dirname  + "/" + config.cert.cert)
};

// Set process name
process.title = "Web Cache Controller";

const callback = new Callback();

// Start https Server
const webServerHttps = https.createServer(https_options, app).listen(config.httpsPort, function() {
	console.log("HTTPS server on Port " + config.httpsPort);
});

// Start http Server
const webServer = http.createServer(app).listen(config.httpPort, function() {
	console.log("HTTP server on Port " + config.httpPort);
});

function app(req, res) {
	callback.start(req, res);
};
