const fs = require("fs");

const cert_dir = __dirname  + "/cert";

const options = {
    key:  fs.readFileSync(cert_dir + "/7211134-192.168.0.130.key"),
    cert: fs.readFileSync(cert_dir + "/7211134-192.168.0.130.cert")
}

exports.options = options;