let _ = require('lodash');
let itemTest = require('./item');
let utils = require('./utils');
let photoTest = require('./phototest');

let URI = "/restaurants/{restaurant_id}/branches/{branch_id}/items/{item_id}/photos";
let URI_ID = URI + '/{photo_id}';

function itemPhotoUploadTest(){
  let idArray;
  before(async () => {
    idArray = await prepareTest();
    //let fullid = utils.makeFullID(idArray);
    return;
  });
  it('generic photo upload test', async () => {
    photoTest.photoTest(idArray, URI, URI_ID);
  });

  after(async () => {
    await cleanTest(idArray);
    return;
  });
}


async function prepareTest(){
  //create parent
  let idArray = await itemTest.prepareTest();

  return idArray;
}

async function cleanTest(parent_idArray){
  //delete parent
  await itemTest.cleanTest(parent_idArray);
  return;
}

function go() {
  itemPhotoUploadTest();
};
exports.go = go;
exports.prepareTest = prepareTest;
exports.cleanTest = cleanTest;