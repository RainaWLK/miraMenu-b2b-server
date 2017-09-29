let db = require('./dynamodb.js');
let S3 = require('./s3');
let JSONAPI = require('./jsonapi.js');
let Utils = require('./utils.js');
let I18n = require('./i18n.js');
let _ = require('lodash');

const PHOTO_TMP_TABLE_NAME = "photo_tmp";

/*var mime = require('mime-types')
import gm from 'gm';
const im = gm.subClass({ imageMagick: true });


function makeInfo(userInfo, binaryData){
    let imageInfo = userInfo;

  //  try {
  //      let metadata = await sharp(binaryData).metadata();
  //      console.log(metadata);    
  //      let mimetype = mime.contentType(metadata.format);
  //      imageInfo.mimeType = mimetype;
        
  //      imageInfo.width = metadata.width;
  //      imageInfo.height = metadata.height;
  //      return imageInfo;
  //  }
  //  catch(err){
  //      throw(err);
  //  }



    
    return new Promise((resolve, reject) => {
        im(binaryData).identify((err, data) => {
            if(err){
console.log(err);
                reject(err);
                return;
            }
console.log(data);
            let mimetype = mime.contentType(data.format);
            imageInfo.mimeType = mimetype;
            imageInfo.size = data.size; //width, height
            console.log(imageInfo);
            resolve(imageInfo);
        });
    });

}


exports.makeInfo = makeInfo;
*/

function getNewPhotoID(seq){
  const dateTime = Date.now();
  const timestamp = Math.floor(dateTime);
  let id = 'p'+timestamp;
  if((typeof seq == 'string')||(typeof seq == 'number')){
    id += '-'+seq;
  }

  return id;
}

async function deletePhotos(urlArray){
  try{
    for(let i in urlArray){
      let url = urlArray[i];
      let p = url.indexOf('/', 8)+1;  //https://xxxxxxxxx/
      //let server = url.substring(0, p);
      let uri = url.substring(p);
      //let path = Utils.makePath(this.idArray);
      console.log("DELETE "+uri);
      let msg = await S3.deleteS3Obj(uri);
      console.log(msg);
    }
    return;
  }
  catch(err){
    console.log(err);
    throw err;
  }
}

async function addPhoto(inputData, idArray) {
  let output;

  try {
    let oneDataProcess = async (oneData, arraySeq) => {
      let inputSeq = oneData.seq;
      delete oneData.id;
      let photo_id = getNewPhotoID(arraySeq);
      let path = Utils.makePath(idArray);

      let fileext = '.jpg';
      if(oneData.mimetype == 'image/png'){
        fileext = '.png';
      }

      let file_name = `${path}/photos/${photo_id}${fileext}`;
      console.log("file_name="+file_name);

      //sign
      let signedData = await S3.getPresignedURL(file_name, oneData.mimetype);
      console.log(signedData);

      //update db
      oneData.id = Utils.makeFullID(idArray) + photo_id;
      oneData.ttl = Math.floor(Date.now() / 1000) + 600;  //expire after 10min
      delete oneData.seq;

      let dbOutput = await db.put(PHOTO_TMP_TABLE_NAME, oneData);
      console.log(dbOutput);

      //output
      let outputBuf = {
        "id": oneData.id,
        "mimetype": oneData.mimetype,
        "filename": file_name,
        "signedrequest": signedData.signedRequest,
        "url": {
          "original": signedData.url
        }
      };
      if(typeof inputSeq != 'undefined'){
        outputBuf.seq = inputSeq;
      }
      return outputBuf;
    }

    let outputBuf;
    if(Array.isArray(inputData)){
      let outputBufArray = [];
      for(let i in inputData){
        outputBuf = await oneDataProcess(inputData[i], i);
        outputBufArray.push(outputBuf);
      }
    　output = JSONAPI.makeJSONAPI("photos", outputBufArray);
    }
    else {
      outputBuf = await oneDataProcess(inputData);
      output = JSONAPI.makeJSONAPI("photos", outputBuf);
    }


    return output;
  }catch(err) {
    console.log(err);
    throw err;
  }
}

exports.getNewPhotoID = getNewPhotoID;
exports.deletePhotos = deletePhotos;
exports.addPhoto = addPhoto;