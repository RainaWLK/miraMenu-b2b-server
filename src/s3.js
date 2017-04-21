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


exports.getS3Obj = getS3Obj;