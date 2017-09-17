import CommonTest from './common.js';
let _ = require('lodash');
let parentTest = require('./menu');
let utils = require('./utils');
let photoTest = require('./phototest');

let URI = "/restaurants/{restaurant_id}/branches/{branch_id}/menus/{menu_id}/photos";
let URI_ID = URI + '/{photo_id}';
let URI_prototype = URI;

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
      }
    ]
  }
}



function photoUploadTest() {
  let op;
  let idArray;
  let photo_idArray;
  let fullid;
  let photo_fullid;
  let presigned_url;
  let download_url;

  before('prepare data', () => {
    op = new CommonTest(URI_prototype);
  });

  describe(URI+' test', () => {
    describe('Photo upload test', () => {

      before(async () => {
        idArray = await prepareTest();
        //console.log(idArray);
        fullid = utils.makeFullID(idArray);
        return;
      });

      it('get presigned url: POST '+URI, async () => {
        let res = await op.checkOperation('POST', utils.getURI(URI, idArray), uploadForm);
        photo_idArray = utils.parseID(res.body.data[0].id);
        presigned_url = res.body.data[0].attributes.signedrequest;
        download_url = res.body.data[0].attributes.url.original;
        photo_fullid = utils.makeFullID(photo_idArray);
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
        let myURI_ID = utils.getURI(URI_ID, photo_idArray);
        
        //check
        let res = await op.checkOperation('GET', myURI_ID, null, null);
        res.body.data.should.have.deep.property('id', photo_fullid);
      });


      it('update photo data: PATCH '+URI, async () => {
        let myURI_ID = utils.getURI(URI_ID, photo_idArray);
        let output = _.cloneDeep(sampleData);
        output.data.attributes.url = {
          "original": download_url
        };

        let res = await op.checkOperation('PATCH', myURI_ID, sampleData, output);
        res.body.data.should.have.deep.property('id', photo_fullid);
  
        //check
        res = await op.checkOperation('GET', myURI_ID, null, output);
        res.body.data.should.have.deep.property('id', photo_fullid);
      });




      after(async () => {
        await cleanTest(photo_idArray, download_url);
        return;
      });

    });
  });
}


async function prepareTest(){
  //create parent
  let idArray = await parentTest.prepareTest();

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
  await parentTest.cleanTest(idArray);
  return;
}

function go() {
  photoUploadTest();
};
exports.go = go;
exports.prepareTest = prepareTest;
exports.cleanTest = cleanTest;