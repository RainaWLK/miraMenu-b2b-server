import sharp from 'sharp';
var mime = require('mime-types')

//import gm from 'gm';
//const im = gm.subClass({ imageMagick: true });






async function makeInfo(userInfo, binaryData){
    let imageInfo = userInfo;

    try {
        let metadata = await sharp(binaryData).metadata();
        console.log(metadata);    
        let mimetype = mime.contentType(metadata.format);
        imageInfo.mimeType = mimetype;
        
        imageInfo.width = metadata.width;
        imageInfo.height = metadata.height;
        return imageInfo;
    }
    catch(err){
        throw(err);
    }



    
    /*return new Promise((resolve, reject) => {
        im(binaryData).identify((err, data) => {
            if(err){
                reject(err);
                return;
            }

            imageInfo.mimeType = data['Mime type'];
            imageInfo.size = data.size; //width, height
            
            resolve(imageInfo);
        });
    });*/

}


exports.makeInfo = makeInfo;