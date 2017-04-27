let AWS = require('aws-sdk');
let s3options = {
	useDualstack: true,
	region: "us-east-1"
}
const BUCKET = "jumi-upload";

const s3 = new AWS.S3(s3options);


async function getS3Obj(file){
	var params = {
		Bucket: BUCKET,
		Key: file
	};

	try {
		let data = await s3.getObject(params).promise();
		//res.setHeader("Content-Type", data.ContentType);
		return data.Body;
	}catch(err){
		throw err;
	}
}


async function uploadToS3(filename, buf){
	var params = {
		Bucket: BUCKET,
		ACL: "public-read",
		Key: filename,
		Body: buf
	};

	try {
		let data = await s3.upload(params).promise();
		console.log("Upload successed: " + data.Location);
		return data;
	}
	catch(err){
		console.log('ERROR MSG: ', err);
		throw err;
	}

}

async function deleteS3Obj(file){
	var params = {
		Bucket: BUCKET,
		Key: file
	};

	try {
		let msg = await s3.deleteObject(params).promise();
		//res.setHeader("Content-Type", data.ContentType);
		return msg;
	}catch(err){
		throw err;
	}

}

exports.getS3Obj = getS3Obj;
exports.uploadToS3 = uploadToS3;
exports.deleteS3Obj = deleteS3Obj;