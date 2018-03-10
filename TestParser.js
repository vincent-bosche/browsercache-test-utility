/**
 * Read test cases, parse and return them as JSON
 */
const fs		= require('fs');
const config	= require(__dirname + "/config.json");

class TestParser {

	constructor() {
	};

	static getTests() {
		this.data = {
			cycle : config.cycle,
		};
		
		this.readDir(__dirname + config.testFolder, this.data);
		
		return this.data;
	};

	static stringToName(string) {
		return string.replace(/[\d\.]+_(.*)/gm, "$1").replace(/_/g, " ");
	};

	static stringToID(string) {
		return string.replace(/([\d\.]+)_.*/gm, "$1");
	};

	static readDir(dirname, target) {
		fs.readdirSync(dirname).forEach(file => {
			if(fs.statSync(dirname + '/' + file).isDirectory()) {
				if(file.indexOf("shared") !== -1) {
					//return;
				}
				let folder = {
					id : this.stringToID(file),
					name : this.stringToName(file)
				};
				this.readDir(dirname + '/' + file, folder);
				if(!target.collection) {
					target.collection = [];
				}
				target.collection.push(folder);
			} else if(file == "testCases.ct") {
				target.tests = this.getData(dirname + '/' + file);
			}
		});
	};

	// Read one file
	static getData(file) {
		let content = fs.readFileSync(file, 'utf8');
		if(content) {
			let parseContent = this.parse(content);
			if(parseContent.length > 0) {
				return parseContent;
			}
		}
		return false;
	};

	/**
	 *
	 * @param {string} content
	 * @return {Object}
	 */
	static parse(content) {
		var tests = [];
		var tmp = [];
		var lines = content.split("\n");
		var regext_t = /[ ;]t:/;

		for(let i = 0; i < lines.length; i++) {
			let line = lines[i].replace(/\r/, "");
			if(line.trim() == "") {
				continue;
			}

			if(line.substr(0, 2) == "##") {
				if(Object.keys(tmp).length > 0) {
					tests.push(tmp);
				}

				tmp = {
					'name' : line,
					'id' : line.replace(/#[\#\s]*([\d\.]+).*/gm, "$1"),
					'steps' : [],
				};
				continue;
			}
			if(/s-max/.test(line) === true) {
				tmp.sharedCache = true;
			}
			if(line.substr(0, 1) != "#") {
				let step = this.parseStep(line);
				if(step.params && step.params.s && (regext_t.test(" " + step.params.s))) {
					tmp.hasTerminate = true;
				}
				tmp.steps.push(step);
			}
		}

		if(Object.keys(tmp).length > 0) {
			tests.push(tmp);
			tmp = [];
		}
		return tests;
	};


	static parseStep(step) {
		// extract params from url
		var [tmp, method, url, params_string] = step.match(/([A-Z]+)\s*([^ ]+)(.*)/);

		var params = {};
		// split by receiver
		var matches = params_string.split(/ (-\w{1,2})/);

		for(let i = 0; i < matches.length; i++) {
			let key = matches[i].trim();
			let name = key.substr(1);
			if((name.length == 1 || name.length == 2) && key.substr(0, 1) == "-" && (i + 1) < matches.length) {
				let value = matches[i + 1].trim();
				if (value != "") {
					if(name === "e" || name === "ep") {
						params[name] = (params[name]) ? params[name] : [];

						params[name].push(value.replace(/['"](.*)['"]/, "$1"));
					} else {
						if(!params[name]) {
							params[name] = "";
						} else {
							params[name] += ";";
						}
						params[name] += value.replace(/['"](.*)['"]/, "$1");
					}
				}
				i++;
			}
		}
		
		// expection for private caches
		if(params['ep']) {
			params['e'] = params['ep'];
		}
		return {
			url : url,
			method : method,
			params : params,
		};
	};
}

exports.TestParser = TestParser;