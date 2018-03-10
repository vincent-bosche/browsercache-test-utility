/**
 * Read tests from db and send them back to the application
 * this script is not ready!
 */
const mysql		= require('mysql');
const url		= require('url');
const config	= require(__dirname + "/config.json");

class Results {

	constructor(req) {
		this.conn = mysql.createConnection(config.dbCredentials);
		this.conn.connect(function(err) {
			if (err) {
				console.log("Database must be online");
				throw err;
			}
			console.log("MySQL Connected!");
		});
		this.filter = {};

		var urlObject = url.parse(req.url,true);
        var params = urlObject.query;

		this.setFilter('cycle', '1');
		this.setFilter('ok', 0);
		console.dir(params);

		console.dir(this.getFilter());
		let ret = {
			browsers : this.getBrowsers(),
		}
		console.dir(ret);
		return ret;
	};


	setFilter(key, value) {
		this.filter[key] = value;
	}

	setFilters(obj) {
		for(var key in  obj) {
			if(obj[key] == "") {
				continue;
			}
			this.filter[key] = obj[key];
		}
	};

	getFilter() {
		let ret = [];
		for(var key in this.filter) {
			//ret.push("`" + key + "` = '${this.filter[key]}'")
		}
		return ret.join(' AND ');
	};

	getFailedTests(filter) {

		let sql = "SELECT * FROM ";

	};

	getBrowsers() {
		let sql = 'SELECT browser FROM results ';
		let filter = this.getFilter();
		if(filter != "") {
			sql += "WHERE " + filter;
		}
		sql += ' GROUP BY browser ';
		
		this.conn.query({
			sql: sql,
		}, (error, res, fields) => {
			if (error) {
				throw error;
			}
			return res.map((item, index) => { return item.browser; });
		});
		return false;
	};
};

exports.Results = Results;