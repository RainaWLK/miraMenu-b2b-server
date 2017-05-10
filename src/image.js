import sharp from 'sharp';

//import gm from 'gm';
//const im = gm.subClass({ imageMagick: true });

function makeInfo(userInfo, binaryData){
    let imageInfo = userInfo;

    const image = sharp(binaryData);
    
    return new Promise((resolve, reject) => {
        image.metadata().then(metadata => {
            console.log(metadata);
            imageInfo.mimeType = data.format;
            imageInfo.width = data.width;
            imageInfo.height = data.height;

            resolve();
        }).catch(err => {
            rehect(err);
        });
    });


    

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