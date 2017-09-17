let env = require('./enviroment.js');
let schemaTest = require('./schema.js');
let _ = require('lodash');
let request = require('supertest');

let chai = env.chai;

let fs = require('fs');

//aws
let aws4  = require('aws4');

function readTestFile(){
  return new Promise((resolve, reject) => {
    fs.readFile('./test/sampleimg.jpg', (err, data) => {
      if (err){
        console.log(err);
        reject();
      }
      resolve(data);
    });
  });
}

function setAWSCredentials(req, op, server, uri, body, mimetype){
  let opts = {
    method: op,
    hostname: server,
    path: uri,
    service: 's3',
    region: env.aws.region
  };
  if((typeof body !== 'undefined')&&(body !== null)){
    opts.headers = {
      'Content-Type': mimetype
    };
    opts.body = body;
  }

  aws4.sign(opts, env.aws.credentials);
  //console.log("======sign======");
  //console.log(opts);
  req = req.set('Host', opts.headers['Host']);
  req = req.set('X-Amz-Date', opts.headers['X-Amz-Date']);
  req = req.set('Authorization', opts.headers.Authorization);
  //req = req.set('X-amz-security-token', opts.headers['X-Amz-Security-Token']);

  if((typeof body !== 'undefined')&&(body !== null)){
    req = req.set('Content-type', opts.headers['Content-Type']);
  }

  return req;
}

async function doUpload(url, mimetype) {
  let p = url.indexOf('/', 8);
  let server = url.substring(0, p);
  let uri = url.substring(p);
  console.log("server="+server);
  console.log("uri="+uri);


  let body = await readTestFile();
  let req = request(server).put(uri);
  //req = req.set('Content-type', mimetype);
  
  //aws
  //req = setAWSCredentials(req, "PUT", server, uri, body, mimetype);
  let res;
  if((typeof body !== 'undefined')&&(body !== null)){
    res = req.send(body);
  }
  //console.log(res);

  return res;
}

function doDownload(url) {
  let p = url.indexOf('/', 8);
  let server = url.substring(0, p);
  let uri = url.substring(p);
  console.log("server="+server);
  console.log("uri="+uri);


  //let body = await readTestFile();
  let req = request(server).get(uri);
  //req = req.set('Content-type', mimetype);
  
  //aws
  //req = setAWSCredentials(req, "PUT", server, uri, body, mimetype);
  //let res = await req.send(body);

  return req;
}

exports.doUpload = doUpload;
exports.doDownload = doDownload;