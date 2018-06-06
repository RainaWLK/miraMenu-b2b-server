let CommonTest = require('./common.js');
let env = require('./enviroment.js');
let schemaTest = require('./schema.js');
let utils = require('./utils');
let _ = require('lodash');
let request = require('supertest');
let fs = require('fs');
let aws4  = require('aws4');

let chai = env.chai;

let sampleData = {
  "data": {
    "type": "photos",
    "attributes": {
      "desc": "prime rib-eye",
      "mimetype": "image/jpeg",
      "size": {
        "width": 1664,
        "height": 2496
      },
      "title": "steak"
    }
  }
}

let uploadForm = {
  "data": {
    "type": "photos",
    "attributes": [
      {
        "mimetype": "image/jpeg",
        "seq": "1"
      },
      {
        "mimetype": "image/png",
        "seq": "2"
      },
      {
        "mimetype": "image/jpeg",
        "seq": "3"
      },
      {
        "mimetype": "image/jpeg",
        "seq": "4"
      },
      {
        "mimetype": "image/png",
        "seq": "5"
      }
    ]
  }
}

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

function photoTest(idArray, URI, URI_ID){
  let op;
  let photo_uploadReqArray = [];
  let photo_uploadReq = {
    "idArray": {},
    "photo_fullid": "",
    "presigned_url": "",
    "download_url": "",
    "seq": "",
    "mimetype": ""
  };

  describe(URI+' test', () => {
    describe('Photo upload test', () => {

      before('prepare data', () => {
        op = new CommonTest(URI);
      });

      it('get presigned url: POST '+URI, async () => {
        let res = await op.checkOperation('POST', utils.getURI(URI, idArray), uploadForm);
        console.log(res.body.data);
        for(let i in res.body.data){
          let element = res.body.data[i];
          let reqElement = _.cloneDeep(photo_uploadReq);
          reqElement.idArray = utils.parseID(element.id);
          reqElement.presigned_url = element.attributes.signedrequest;
          reqElement.download_url = element.attributes.url.original;
          reqElement.photo_fullid = utils.makeFullID(reqElement.idArray);
          
          for(let j = 0; j < uploadForm.data.attributes.length; j++){
            let formData = uploadForm.data.attributes[j];
            if(element.attributes.seq === formData.seq){
              reqElement.seq = formData.seq;
              reqElement.mimetype = formData.mimetype;
              break;
            }
          }
          photo_uploadReqArray.push(reqElement);

          element.attributes.seq.should.not.eql("");
        }
      });      

      it('Upload file', async () => {
        for(let i in photo_uploadReqArray){
          let res = await doUpload(photo_uploadReqArray[i].presigned_url, photo_uploadReqArray[i].mimetype);
          res.statusCode.should.eql(200);
        }
      });

      it('check file upload successed', async () => {
        for(let i in photo_uploadReqArray){
          let res = await doDownload(photo_uploadReqArray[i].download_url);
          res.statusCode.should.eql(200);
        }
      });

      it('check photo data in database: GET '+URI_ID, async () => {
        for(let i in photo_uploadReqArray){
          let myURI_ID = utils.getURI(URI_ID, photo_uploadReqArray[i].idArray);
          
          //check
          let res = await op.checkOperation('GET', myURI_ID, null, null);
          res.body.data.should.have.deep.property('id', photo_uploadReqArray[i].photo_fullid);
        }
      });


      it('update photo data: PATCH '+URI_ID, async () => {
        for(let i in photo_uploadReqArray){
          let myURI_ID = utils.getURI(URI_ID, photo_uploadReqArray[i].idArray);
          let output = _.cloneDeep(sampleData);
          output.data.attributes.url = {
            "original": photo_uploadReqArray[i].download_url
          };

          let res = await op.checkOperation('PATCH', myURI_ID, sampleData, output);
          res.body.data.should.have.deep.property('id', photo_uploadReqArray[i].photo_fullid);
    
          //check
          res = await op.checkOperation('GET', myURI_ID, null, output);
          res.body.data.should.have.deep.property('id', photo_uploadReqArray[i].photo_fullid);
        }
      });


      after(async () => {
        await cleanTest(URI_ID, photo_uploadReqArray);
        return;
      });

    });
  });


}

async function cleanTest(URI_ID, uploadReqArray){
  let op = new CommonTest();
  for(let i in uploadReqArray){
    let myURI_ID = utils.getURI(URI_ID, uploadReqArray[i].idArray);

    await op.checkOperation('DELETE', myURI_ID, null, "");

    //check
    let res = await op.pureOperation('GET', myURI_ID, null);
    res.statusCode.should.eql(404);
    
    if(uploadReqArray[i].download_url){
      let res2 = await doDownload(uploadReqArray[i].download_url);
      res2.statusCode.should.eql(404);
    }
  }

  return;
}

exports.doUpload = doUpload;
exports.doDownload = doDownload;
exports.photoTest = photoTest;