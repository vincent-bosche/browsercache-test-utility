# Web Cache Test Utility

This untility is designed to test every browser against RFC 7234 caching compliance. It uses a little Node.js server to send responses for the tests and a browser application for controlling the tests.
All collected results ca be evaluated in the tested browser or saved into a MySQL Databse (Other DB controller could be used as well). 

The callback methods are based on [cacheTestNodeServer](https://github.com/hvnguyen86/cacheTestNodeServer)

## Requirements
node & npm

## Installation
* Run ```npm install```
* Create a SSL certificate
* Copy config_sample.json to config.json. Enter your DB credentials (only if you wish to save results) and the location of certificate-files
* Run ```node server.js```
* Navigate to http://127.0.0.1:8080 or what port you've entered in your config-file.

If you dont want to test secured connections, you can comment out the https server in server.js