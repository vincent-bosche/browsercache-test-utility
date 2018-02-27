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

/*
	save(data) {
		this.conn.query({
			sql: 'INSERT INTO results (test, test_name, cycle, ok, os, browser, mobile, incognito, https) VALUE(?, ?, ?, ?, ?, ?, ?, ?, ?) ',
			timeout: 40000, // 40s
			values: [
				data.id,
				data.name,
				data.cycle,
				data.ok,
				data.os,
				data.browser,
				data.mobile,
				data.incognito,
				data.https
			]
		}, function (error, results, fields) {
			if (error) {
				throw error;
			}
			var id = results.insertId;
			if(id > 0) {
				try {
					this.saveSteps(id, data.steps);

				} catch(e) {
					throw e;
				}
			}
		}.bind(this));

	};

	saveSteps(id, steps) {
		for (let i = 0; i < steps.length; i++) {
			let step = steps[i];

			var status = {
				expection : null,
				received : null
			};
			var cb = Object.assign({}, status);
			var ch = Object.assign({}, status);
			
			if(step.validated) {
				if(step.validated.ch) {
					ch = step.validated.ch;
				}
				if(step.validated.cb) {
					cb = step.validated.cb;
				}
				if(step.validated.st) {
					status = step.validated.st;
				}
			}

			this.conn.query({
				sql: 'INSERT INTO results_steps (id_rel, url, method, ch, ch_expected, cb, cb_expected, status, status_expected, request, responded, missing, header_id, body_id, complete_header) VALUE(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?) ',
				timeout: 40000, // 40s
				values: [
					id,
					step.url,
					step.method,
					ch.received,
					ch.expection,
					cb.received,
					cb.expection,
					status.received,
					status.expection,
					JSON.stringify(step.requestHeader),
					JSON.stringify(step.respondedHeader),
					JSON.stringify(step.missingHeaders),
					step.headerId,
					step.bodyId,
					step.allRespondedHeader
				]
			}, function (error, results, fields) {
				if (error) {
					throw error;
				}
			});
		}
	};
*/
};

exports.Results = Results;