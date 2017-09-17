let S3 = require('./s3');
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

exports.getNewPhotoID = getNewPhotoID;
exports.deletePhotos = deletePhotos;