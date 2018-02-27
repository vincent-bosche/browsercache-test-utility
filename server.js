const http		= require("http");
const https		= require("https");

const config	= require(__dirname + "/config.json");
// SSL Cert
const cert		= require(__dirname + "/cert.js");

const {Callback} 	= require(__dirname + "/Callback.js");

// Set process name
process.title = "Web Cache Controller";

const callback = new Callback();
const webServerHttps = https.createServer(cert.options, app).listen(config.httpsPort, function() {
	console.log("HTTPS server on Port " + config.httpsPort);
});
const webServer = http.createServer(app).listen(config.httpPort, function() {
	console.log("HTTP server on Port " + config.httpPort);
});

function app(req, res) {
	callback.start(req, res);
};
