import gm from 'gm';
const im = gm.subClass({ imageMagick: true });

function makeInfo(userInfo, binaryData){
    let imageInfo = userInfo;

    return new Promise((resolve, reject) => {
        im(binaryData).identify((err, data) => {
            if(err){
                reject(err);
                return;
            }

            imageInfo.mimeType = data['Mime type'];
            imageInfo.size = data.size; //width, height
            
            resolve(imageInfo);
        });
    });

}


exports.makeInfo = makeInfo;