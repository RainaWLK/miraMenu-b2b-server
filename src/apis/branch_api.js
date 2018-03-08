let Branches = require('../branch.js');
const API_VERSION = '/v1';

function go(api){

//=========== branch =========
api.get(API_VERSION+'/restaurants/{restaurant_id}/branches', async (req) => {
  let cmdObj = new Branches.main(req);

  try{
      return await cmdObj.get();
  }
  catch(err){
      throw err;
  }
});

api.post(API_VERSION+'/restaurants/{restaurant_id}/branches', async (req) => {
  let cmdObj = new Branches.main(req);

  try{
      return await cmdObj.create(req.body);
  }
  catch(err){
      throw err;
  }
});

api.get(API_VERSION+'/restaurants/{restaurant_id}/branches/{branch_id}', async (req) => {
  let cmdObj = new Branches.main(req);

  try{
      return await cmdObj.getByID();
  }
  catch(err){
      throw err;
  }
});

api.patch(API_VERSION+'/restaurants/{restaurant_id}/branches/{branch_id}', async (req) => {
  let cmdObj = new Branches.main(req);

  try{
      return await cmdObj.updateByID(req.body);
  }
  catch(err){
      throw err;
  }
});

api.delete(API_VERSION+'/restaurants/{restaurant_id}/branches/{branch_id}', async (req) => {
  let cmdObj = new Branches.main(req);

  try{
      return await cmdObj.deleteByID();
  }
  catch(err){
      throw err;
  }
});

//========
api.get(API_VERSION+'/restaurants/{restaurant_id}/branches/{branch_id}/photos/{photo_id}', async (req) => {
  let cmdObj = new Branches.main(req);

  try{
      return await cmdObj.getPhotoInfoByID();
  }
  catch(err){
      throw err;
  }
});

api.patch(API_VERSION+'/restaurants/{restaurant_id}/branches/{branch_id}/photos/{photo_id}', async (req) => {
  let cmdObj = new Branches.main(req);

  try{
      return await cmdObj.updatePhotoInfo(req.body);
  }
  catch(err){
      throw err;
  }
});

api.delete(API_VERSION+'/restaurants/{restaurant_id}/branches/{branch_id}/photos/{photo_id}', async (req) => {
  let cmdObj = new Branches.main(req);

  try{
      return await cmdObj.deletePhoto();
  }
  catch(err){
      throw err;
  }
});


api.get(API_VERSION+'/restaurants/{restaurant_id}/branches/{branch_id}/photos', async (req) => {
  let cmdObj = new Branches.main(req);

  try{
      return await cmdObj.getPhotoInfo(req.body);
  }
  catch(err){
      throw err;
  }
});

api.post(API_VERSION+'/restaurants/{restaurant_id}/branches/{branch_id}/photos', async (req) => {
  let cmdObj = new Branches.main(req);

  try{
      return await cmdObj.addPhoto(req.body);
  }
  catch(err){
      throw err;
  }
});

/*
//============== Resources =========================
api.get(API_VERSION+'/restaurants/{restaurant_id}/branches/{branch_id}/resources', async (req) => {
  let cmdObj = new Branches.main(req);

  try{
      return await cmdObj.getResources(req.body);
  }
  catch(err){
      throw err;
  }
});

api.post(API_VERSION+'/restaurants/{restaurant_id}/branches/{branch_id}/resources', async (req) => {
  let cmdObj = new Branches.main(req);

  try{
      return await cmdObj.addResource(req.body);
  }
  catch(err){
      throw err;
  }
});

api.get(API_VERSION+'/restaurants/{restaurant_id}/branches/{branch_id}/resources/{resource_id}', async (req) => {
  let cmdObj = new Branches.main(req);

  try{
      return await cmdObj.getResourceByID(req.body);
  }
  catch(err){
      throw err;
  }
});

api.delete(API_VERSION+'/restaurants/{restaurant_id}/branches/{branch_id}/resources/{resource_id}', async (req) => {
  let cmdObj = new Branches.main(req);

  try{
      return await cmdObj.deleteResource(req.body);
  }
  catch(err){
      throw err;
  }
});
*/
  
}
  
exports.go = go;