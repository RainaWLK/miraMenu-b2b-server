let ApiBuilder = require('claudia-api-builder');
//import { makeInfo } from './image.js';
let authorizer = require('./authorizer');

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
		this.binaryBody = null;
		this.type = "json";

		this.userinfo = {
			cognitoAuthenticationProvider: "",
			cognitoAuthenticationType: "",
			cognitoIdentityId: "",
			cognitoIdentityPoolId: ""
			//invokeid: "",
			//awsRequestId: "",
			//invokedFunctionArn: ""
		}
    }
}

function makeReqData(req) {
    let reqData = new ReqData();

    if(DEBUG) {
        reqData.paths = req.url.split('/');
        reqData.params = req.params;
		reqData.queryString = req.query;

		//fake user info
		reqData.userinfo.cognitoAuthenticationProvider = "jumi.co";
		reqData.userinfo.cognitoAuthenticationType = "authenticated";
		reqData.userinfo.cognitoIdentityId = 'us-west-2:97f12645-0fd0-4068-a8ac-a3d3d681ad73';
		reqData.userinfo.cognitoIdentityPoolId = 'us-west-2:402b42ff-45c7-494b-a043-70a457930f4a';		
    }
    else {
        reqData.paths = req.proxyRequest.path.split('/');
        reqData.params = req.pathParams;
		reqData.queryString = req.queryString;

		//userinfo
		reqData.userinfo.cognitoAuthenticationProvider = req.context.cognitoAuthenticationProvider;
		reqData.userinfo.cognitoAuthenticationType = req.context.cognitoAuthenticationType;
		reqData.userinfo.cognitoIdentityId = req.context.cognitoIdentityId;
		reqData.userinfo.cognitoIdentityPoolId = req.context.cognitoIdentityPoolId;
    }
    reqData.body = req.body;

    return reqData;
}

/*function makeBinaryReqData(req) {
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

	if(typeof req.body.image == 'string'){
		reqData.binaryBody = Buffer.from(req.body.image, 'base64');
		delete req.body.image;
		reqData.type = "image";
	}
	reqData.body = req.body;
	
    return reqData;
}*/

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
			let cors = require('cors');
		    let bodyParser = require('body-parser');
		    let db = require('./dynamodb.js');
			let path = require('path');
		    
		    this.app = express();
		    this.app.use(bodyParser.json({limit: '50mb'}));
			//this.app.use(bodyParser.raw({limit: '50mb'}));
			this.app.use(cors());
			this.app.options("*", cors());
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
			this.app.corsMaxAge(3600); // in seconds 
		}
	}
	
	responseOK(res, msg) {
		if(DEBUG) {
			if(msg == ""){
				res.status(204);
			}
			res.send(msg);
			res.end();
		}
		else {
			if(msg == ""){
				return new this.app.ApiResponse("", {'Content-Type': 'text/plain'}, '204');
			}
			return msg;
		}
		
	}
	
	responseError(res, err) {
		if(typeof err == 'undefined'){
			err = {};
		}
		if(typeof err.statusCode == 'undefined'){
			err.statusCode = 403;
		}
		if(typeof err.message == 'undefined'){
			err.message = "";
		}

		if(DEBUG) {
			res.status(err.statusCode);
			res.end(err.message);
		}
		else {
			return new this.app.ApiResponse(err.message, {'Content-Type': 'text/plain'}, err.statusCode);
		}
	}

	async get(orgURI, callback){
		let uri = translateURI(orgURI);
		let self = this;

		let action = async (req, res) => {
			let reqData = makeReqData(req);
			try {
				await authorizer.permissionCheck(reqData);
				let resultMsg = await callback(reqData);
				return self.responseOK(res, resultMsg);
			}
			catch(errcode) {
				return self.responseError(res, errcode);
			}
			
		};

		if(DEBUG) {
			await this.app.get(uri, action);
		}
		else {
			let options = {
				authorizationType: 'AWS_IAM',
				invokeWithCredentials: true,
				success: { code: 200 }
			};
			await this.app.get(uri, action, options);
		}
	}

	async post(orgURI, callback){
		let uri = translateURI(orgURI);
		let self = this;
		
		let action = async (req, res) => {
			let reqData = makeReqData(req);
			try {
				await authorizer.permissionCheck(reqData);
				let resultMsg = await callback(reqData);
				return self.responseOK(res, resultMsg);
			}
			catch(err) {
				return self.responseError(res, err);
			}
			
		};

		if(DEBUG) {
			await this.app.post(uri, action);
		}
		else {
			await this.app.post(uri, action, {
				authorizationType: 'AWS_IAM',
				invokeWithCredentials: true,
				success: { code: 201 }
			});
		}
	}

	async patch(orgURI, callback){
		let uri = translateURI(orgURI);
		let self = this;
		
		let action = async (req, res) => {
			let reqData = makeReqData(req);
			try {
				await authorizer.permissionCheck(reqData);
				let resultMsg = await callback(reqData);
				return self.responseOK(res, resultMsg);
			}
			catch(errcode) {
				return self.responseError(res, errcode);
			}
			
		};

		if(DEBUG) {
			await this.app.patch(uri, action);
		}
		else {
			let options = {
				authorizationType: 'AWS_IAM',
				invokeWithCredentials: true,
				success: { code: 200 }
			};
			await this.app.patch(uri, action, options);
		}
	}

	async delete(orgURI, callback){
		let uri = translateURI(orgURI);
		let self = this;
		
		let action = async (req, res) => {
			let reqData = makeReqData(req);
			try {
				await authorizer.permissionCheck(reqData);
				let resultMsg = await callback(reqData);
				return self.responseOK(res, resultMsg);
			}
			catch(errcode) {
				return self.responseError(res, errcode);
			}
			
		};

		if(DEBUG) {
			await this.app.delete(uri, action);
		}
		else {
			let options = {
				authorizationType: 'AWS_IAM',
				invokeWithCredentials: true,
				success: { code: 200 }
			};
			await this.app.delete(uri, action, options);
		}
	}

	/*async bGet(orgURI, callback){
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
		
	}*/

	/*async bPost(orgURI, callback){
		let uri = translateURI(orgURI);
		let self = this;

		let bFunc = async function(req, res){
			let reqData = makeBinaryReqData(req);
			try {
				//image
				if(reqData.type == 'image'){
					console.log("qq");
					let imageInfo = await makeInfo(reqData.body ,reqData.binaryBody);
					console.log("bPost return");
					reqData.body = imageInfo;
				}

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
		
	}*/

}

exports.main = Rest;
