let AWS = require('aws-sdk');
AWS.config.update({
    region: "us-east-1"
});

const s3 = new AWS.S3();


function getS3Obj(file){
	var params = {
		Bucket: 'jumi-upload',
		Key: file
	};
	return new Promise((resolve, reject) => {
		s3.getObject(params).promise().then(data => {
            //res.setHeader("Content-Type", data.ContentType);
            resolve(data.Body);
        }).catch(err => {
            reject(err);
        });
	});
}


async function uploadToS3(filename, buf){
    var s3bucket = new AWS.S3({params: {Bucket: 'jumi-upload'}});

	var params = {
		ACL: "public-read",
		Key: filename,
		Body: buf
	};

	try {
		let data = await s3bucket.upload(params).promise();
		console.log("Upload successed: " + data.Location);
		return data;
	}
	catch(err){
		console.log('ERROR MSG: ', err);
		throw err;
	}

}

exports.getS3Obj = getS3Obj;
exports.uploadToS3 = uploadToS3;