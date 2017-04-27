let ApiBuilder = require('claudia-api-builder');

let DEBUG = 0;
if(process.env.NODE_ENV == 'development'){
	DEBUG = 1;
}

//private functions
class ReqData{
    constructor() {
        this.paths = [];
        this.params = {};
		this.queryString = {};
        this.body = {};
    }
}

function makeReqData(req) {
    let reqData = new ReqData();

    if(DEBUG) {
        reqData.paths = req.url.split('/');
        reqData.params = req.params;
		reqData.queryString = req.query;
    }
    else {
        reqData.paths = req.proxyRequest.path.split('/');
        reqData.params = req.pathParams;
		reqData.queryString = req.queryString;
    }
    reqData.body = req.body;

    return reqData;
}

function makeBinaryReqData(req) {
    let reqData = new ReqData();

    if(DEBUG) {
        reqData.paths = req.url.split('/');
        reqData.params = req.params;
		reqData.queryString = req.query;
    }
    else {
        reqData.paths = req.proxyRequest.path.split('/');
        reqData.params = req.pathParams;
		reqData.queryString = req.queryString;
    }
    reqData.body = req.body;

    return reqData;
}

//for compatible between express and AWS
function translateURI(orgURI){
	let uri = orgURI;
	if(DEBUG) {
		uri = uri.replace(/{/g, ":");
		uri = uri.replace(/}/g, "");
	}

	return uri;
}

//public
class Rest {
	constructor(){
		this.app = null

		if(DEBUG) {
		    let express = require('express');
		    let bodyParser = require('body-parser');
		    let db = require('./dynamodb.js');
			let path = require('path');
		    
		    this.app = express();
		    this.app.use(bodyParser.json());
			this.app.use(bodyParser.raw({limit: '50mb'}));
			this.app.use("/", express.static(path.join(__dirname, '../www')));

		    let server = this.app.listen(8081, () => {
		        let host = server.address().address;
		        let port = server.address().port;
		   
		        console.log("Example app listening at http://%s:%s", host, port);
		    });

		    //debug API
		    this.app.get("/db/:db_name", (req, res) => {
		        let tableName = req.params.db_name;
		        db.scan(tableName).then(msg => {
		            res.send(msg);
		        }).catch(err => {
		            res.status(404);
		            res.end();
		        });
		    });  
		}
		else {
		    this.app = new ApiBuilder();
		}
	}
	
	responseOK(res, msg) {
		if(DEBUG) {
			res.send(msg);
			res.end();
		}
		return msg;
	}
	
	responseError(res, code) {
		if(DEBUG) {
			res.status(code);
			res.end();
		}
		else {
			return new this.app.ApiResponse('Error', {'Content-Type': 'text/plain'}, code);
			//return code;
		}
	}

	async get(orgURI, callback){
		let uri = translateURI(orgURI);
		let self = this;
		
		await this.app.get(uri, async (req, res) => {
			let reqData = makeReqData(req);
			try {
				let resultMsg = await callback(reqData);
				return self.responseOK(res, resultMsg);
			}
			catch(errcode) {
				return self.responseError(res, errcode);
			}
			
		});
	}

	async post(orgURI, callback){
		let uri = translateURI(orgURI);
		let self = this;
		
		await this.app.post(uri, async (req, res) => {
			let reqData = makeReqData(req);
			try {
				let resultMsg = await callback(reqData);
				return self.responseOK(res, resultMsg);
			}
			catch(errcode) {
				return self.responseError(res, errcode);
			}
			
		});
	}

	async patch(orgURI, callback){
		let uri = translateURI(orgURI);
		let self = this;
		
		await this.app.patch(uri, async (req, res) => {
			let reqData = makeReqData(req);
			try {
				let resultMsg = await callback(reqData);
				return self.responseOK(res, resultMsg);
			}
			catch(errcode) {
				return self.responseError(res, errcode);
			}
			
		});
	}

	async delete(orgURI, callback){
		let uri = translateURI(orgURI);
		let self = this;
		
		await this.app.delete(uri, async (req, res) => {
			let reqData = makeReqData(req);
			try {
				let resultMsg = await callback(reqData);
				return self.responseOK(res, resultMsg);
			}
			catch(errcode) {
				return self.responseError(res, errcode);
			}
			
		});
	}

	async bGet(orgURI, callback){
		let uri = translateURI(orgURI);
		let self = this;

		let bFunc = async function(req, res){
			let reqData = makeBinaryReqData(req);
			try {
				let resultMsg = await callback(reqData);
				console.log("responseOK");
				return self.responseOK(res, resultMsg);
			}
			catch(errcode) {
				return self.responseError(res, errcode);
			}
		};

		if(DEBUG) {
			await this.app.get(uri, bFunc);
		}
		else {
			await this.app.get(uri, bFunc, { success: { contentType: 'image/jpg', contentHandling: 'CONVERT_TO_BINARY'}});
		}
		
	}

	async bPost(orgURI, callback){
		let uri = translateURI(orgURI);
		let self = this;

		let bFunc = async function(req, res){
			let reqData = makeBinaryReqData(req);
			try {
				let resultMsg = await callback(reqData);
				console.log("responseOK");
				return self.responseOK(res, resultMsg);
			}
			catch(errcode) {
				return self.responseError(res, errcode);
			}
		};

		if(DEBUG) {
			await this.app.post(uri, bFunc);
		}
		else {
			await this.app.post(uri, bFunc, { success: { contentType: 'text/plain' } });
		}
		
	}

}

export default Rest;
