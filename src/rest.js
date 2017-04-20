let ApiBuilder = require('claudia-api-builder');

const DEBUG = 0;

//private functions
class ReqData{
    constructor() {
        this.paths = [];
        this.params = {};
        this.body = {};
    }
}

function makeReqData(req) {
    let reqData = new ReqData();

    if(DEBUG) {
        reqData.paths = req.url.split('/');
        reqData.params = req.params;
    }
    else {
        reqData.paths = req.proxyRequest.path.split('/');
        reqData.params = req.pathParams;
    }
    reqData.body = req.body;

    return reqData;
}

function responseOK(res, msg) {
    if(DEBUG) {
        res.send(msg);
        res.end();
    }
    return msg;
}

function responseError(res, code) {
    if(DEBUG) {
        res.status(code);
        res.end();
    }
    else {
        return new app.ApiResponse('Error', {'Content-Type': 'text/plain'}, code);
    }
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
		    
		    this.app = express();
		    this.app.use(bodyParser.json());

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

	async get(orgURI, callback){
		let uri = translateURI(orgURI);
		await this.app.get(uri, async (req, res) => {
			let reqData = makeReqData(req);
			try {
				let resultMsg = await callback(reqData);
				return responseOK(res, resultMsg);
			}
			catch(errcode) {
				return responseError(res, errcode);
			}
			
		});
	}

	async post(orgURI, callback){
		let uri = translateURI(orgURI);
		await this.app.post(uri, async (req, res) => {
			let reqData = makeReqData(req);
			try {
				let resultMsg = await callback(reqData);
				return responseOK(res, resultMsg);
			}
			catch(errcode) {
				return responseError(res, errcode);
			}
			
		});
	}

	async patch(orgURI, callback){
		let uri = translateURI(orgURI);
		await this.app.patch(uri, async (req, res) => {
			let reqData = makeReqData(req);
			try {
				let resultMsg = await callback(reqData);
				return responseOK(res, resultMsg);
			}
			catch(errcode) {
				return responseError(res, errcode);
			}
			
		});
	}

	async delete(orgURI, callback){
		let uri = translateURI(orgURI);
		await this.app.delete(uri, async (req, res) => {
			let reqData = makeReqData(req);
			try {
				let resultMsg = await callback(reqData);
				return responseOK(res, resultMsg);
			}
			catch(errcode) {
				return responseError(res, errcode);
			}
			
		});
	}



}

export default Rest;
