let CommonTest = require('./common.js');
let _ = require('lodash');
let itemTest = require('./item');
let utils = require('./utils');
let photoTest = require('./phototest');

let URI = "/v1/restaurants/{restaurant_id}/branches/{branch_id}/items/{item_id}/resources";
let URI_ID = URI + '/{resource_id}';
let URI_prototype = URI;


let uploadForm = {
  "data": {
    "type": "resources",
    "attributes": [
      {
        "type": "file",
        "fileext": "scn",
        "seq": "0"
      }
    ]
  }
}

let languageForm = {
  "data": {
      "type": "i18n",
      "attributes": {
          "default": "en-us",
          "data": {
              "zh-hant": "蘋果",
              "jp": "りんご",
              "en-us": "apple",
              "kr": "애플"
          },
          
      }
  }
}



function resourceUploadTest() {
  let op;
  let parent_idArray;
  let resource_idArray;
  let fullid;
  let resource_fullid;
  let presigned_url;
  let download_url;

  before('prepare data', () => {
    op = new CommonTest(URI_prototype);
  });

  describe(URI+' test', () => {
    describe('Resource file upload test', () => {

      before(async () => {
        parent_idArray = await prepareTest();
        //console.log(idArray);
        fullid = utils.makeFullID(parent_idArray);
        return;
      });

      it('get presigned url: POST '+URI, async () => {
        let res = await op.checkOperation('POST', utils.getURI(URI, parent_idArray), uploadForm);
        resource_idArray = utils.parseID(res.body.data[0].id);
        presigned_url = res.body.data[0].attributes.signedrequest;
        download_url = res.body.data[0].attributes.url;
        resource_fullid = utils.makeFullID(resource_idArray);
      });      

      it('Upload file', async () => {
        let res = await photoTest.doUpload(presigned_url, uploadForm.data.attributes[0].mimetype);
        //console.log(res);
        res.statusCode.should.eql(200);
      });

      it('check file upload successed', async () => {
        let res = await photoTest.doDownload(download_url);
        //console.log(res);
        res.statusCode.should.eql(200);
      });

      it('check photo data in database: GET '+URI, async () => {
        let myURI_ID = utils.getURI(URI_ID, resource_idArray);
        
        //check
        let res = await op.checkOperation('GET', myURI_ID, null, null);
        res.body.data.should.have.deep.property('id', resource_fullid);
      });

      after(async () => {
        await cleanTest(resource_idArray, download_url);
        return;
      });

    });
  });
}

async function prepareTest(){
  //create parent
  let idArray = await itemTest.prepareTest();

  return idArray;
}

async function cleanTest(idArray, photo_url){
  let op = new CommonTest();
  let myURI_ID = utils.getURI(URI_ID, idArray);

  await op.checkOperation('DELETE', myURI_ID, null, "");

  //check
  let res = await op.pureOperation('GET', myURI_ID, null);
  res.statusCode.should.eql(404);
  
  if(photo_url){
    let res2 = await photoTest.doDownload(photo_url);
    res2.statusCode.should.eql(404);
  }

  //delete parent
  await itemTest.cleanTest(idArray);
  return;
}

function go() {
  resourceUploadTest();
};
exports.go = go;
exports.prepareTest = prepareTest;
exports.cleanTest = cleanTest;