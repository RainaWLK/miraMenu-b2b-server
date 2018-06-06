let Menus = require('../menu.js');
const API_VERSION = '/v1';

function go(api){

//=========== Menu =========
api.get(API_VERSION+'/restaurants/{restaurant_id}/branches/{branch_id}/menus', async (req) => {
  let cmdObj = new Menus.main(req);

  try{
      return await cmdObj.get();
  }
  catch(err){
      throw err;
  }
});

api.post(API_VERSION+'/restaurants/{restaurant_id}/branches/{branch_id}/menus', async (req) => {
  let cmdObj = new Menus.main(req);

  try{
      return await cmdObj.create(req.body);
  }
  catch(err){
      throw err;
  }
});


api.get(API_VERSION+'/restaurants/{restaurant_id}/branches/{branch_id}/menus/{menu_id}', async (req) => {
  let cmdObj = new Menus.main(req);

  try{
      return await cmdObj.getByID();
  }
  catch(err){
      throw err;
  }
});

api.patch(API_VERSION+'/restaurants/{restaurant_id}/branches/{branch_id}/menus/{menu_id}', async (req) => {
  let cmdObj = new Menus.main(req);

  try{
      return await cmdObj.updateByID(req.body);
  }
  catch(err){
      throw err;
  }
});

api.delete(API_VERSION+'/restaurants/{restaurant_id}/branches/{branch_id}/menus/{menu_id}', async (req) => {
  let cmdObj = new Menus.main(req);

  try{
      return await cmdObj.deleteByID();
  }
  catch(err){
      throw err;
  }
});

api.get(API_VERSION+'/restaurants/{restaurant_id}/menus', async (req) => {
  let cmdObj = new Menus.main(req);

  try{
      return await cmdObj.get();
  }
  catch(err){
      throw err;
  }
});

api.post(API_VERSION+'/restaurants/{restaurant_id}/menus', async (req) => {
  let cmdObj = new Menus.main(req);

  try{
      return await cmdObj.create(req.body);
  }
  catch(err){
      throw err;
  }
});


api.get(API_VERSION+'/restaurants/{restaurant_id}/menus/{menu_id}', async (req) => {
  let cmdObj = new Menus.main(req);

  try{
      return await cmdObj.getByID();
  }
  catch(err){
      throw err;
  }
});

api.patch(API_VERSION+'/restaurants/{restaurant_id}/menus/{menu_id}', async (req) => {
  let cmdObj = new Menus.main(req);

  try{
      return await cmdObj.updateByID(req.body);
  }
  catch(err){
      throw err;
  }
});

api.delete(API_VERSION+'/restaurants/{restaurant_id}/menus/{menu_id}', async (req) => {
  let cmdObj = new Menus.main(req);

  try{
      return await cmdObj.deleteByID();
  }
  catch(err){
      throw err;
  }
});

//=============

api.get(API_VERSION+'/restaurants/{restaurant_id}/menus/{menu_id}/photos/{photo_id}', async (req) => {
  let cmdObj = new Menus.main(req);

  try{
      return await cmdObj.getPhotoInfoByID();
  }
  catch(err){
      throw err;
  }
});

api.patch(API_VERSION+'/restaurants/{restaurant_id}/menus/{menu_id}/photos/{photo_id}', async (req) => {
  let cmdObj = new Menus.main(req);

  try{
      return await cmdObj.updatePhotoInfo(req.body);
  }
  catch(err){
      throw err;
  }
});

api.delete(API_VERSION+'/restaurants/{restaurant_id}/menus/{menu_id}/photos/{photo_id}', async (req) => {
  let cmdObj = new Menus.main(req);

  try{
      return await cmdObj.deletePhoto();
  }
  catch(err){
      throw err;
  }
});


api.get(API_VERSION+'/restaurants/{restaurant_id}/menus/{menu_id}/photos', async (req) => {
  let cmdObj = new Menus.main(req);

  try{
      return await cmdObj.getPhotoInfo(req.body);
  }
  catch(err){
      throw err;
  }
});

api.post(API_VERSION+'/restaurants/{restaurant_id}/menus/{menu_id}/photos', async (req) => {
  let cmdObj = new Menus.main(req);

  try{
      return await cmdObj.addPhoto(req.body);
  }
  catch(err){
      throw err;
  }
});

//=============

api.get(API_VERSION+'/restaurants/{restaurant_id}/branches/{branch_id}/menus/{menu_id}/photos/{photo_id}', async (req) => {
  let cmdObj = new Menus.main(req);

  try{
      return await cmdObj.getPhotoInfoByID();
  }
  catch(err){
      throw err;
  }
});

api.patch(API_VERSION+'/restaurants/{restaurant_id}/branches/{branch_id}/menus/{menu_id}/photos/{photo_id}', async (req) => {
  let cmdObj = new Menus.main(req);

  try{
      return await cmdObj.updatePhotoInfo(req.body);
  }
  catch(err){
      throw err;
  }
});

api.delete(API_VERSION+'/restaurants/{restaurant_id}/branches/{branch_id}/menus/{menu_id}/photos/{photo_id}', async (req) => {
  let cmdObj = new Menus.main(req);

  try{
      return await cmdObj.deletePhoto();
  }
  catch(err){
      throw err;
  }
});


api.get(API_VERSION+'/restaurants/{restaurant_id}/branches/{branch_id}/menus/{menu_id}/photos', async (req) => {
  let cmdObj = new Menus.main(req);

  try{
      return await cmdObj.getPhotoInfo(req.body);
  }
  catch(err){
      throw err;
  }
});

api.post(API_VERSION+'/restaurants/{restaurant_id}/branches/{branch_id}/menus/{menu_id}/photos', async (req) => {
  let cmdObj = new Menus.main(req);

  try{
      return await cmdObj.addPhoto(req.body);
  }
  catch(err){
      throw err;
  }
});

//============== I18n =========================
api.delete(API_VERSION+'/restaurants/{restaurant_id}/branches/{branch_id}/menus/{menu_id}/i18n/{lang_code}', async (req) => {
  let cmdObj = new Menus.main(req);

  try{
      return await cmdObj.deleteI18n(req.body);
  }
  catch(err){
      throw err;
  }
});

//============== I18n =========================
api.delete(API_VERSION+'/restaurants/{restaurant_id}/menus/{menu_id}/i18n/{lang_code}', async (req) => {
  let cmdObj = new Menus.main(req);

  try{
      return await cmdObj.deleteI18n(req.body);
  }
  catch(err){
      throw err;
  }
});
/*
//============== Resources =========================
api.get(API_VERSION+'/restaurants/{restaurant_id}/branches/{branch_id}/menus/{menu_id}/resources', async (req) => {
  let cmdObj = new Menus.main(req);

  try{
      return await cmdObj.getResources(req.body);
  }
  catch(err){
      throw err;
  }
});

api.post(API_VERSION+'/restaurants/{restaurant_id}/branches/{branch_id}/menus/{menu_id}/resources', async (req) => {
  let cmdObj = new Menus.main(req);

  try{
      return await cmdObj.addResource(req.body);
  }
  catch(err){
      throw err;
  }
});

api.get(API_VERSION+'/restaurants/{restaurant_id}/branches/{branch_id}/menus/{menu_id}/resources/{resource_id}', async (req) => {
  let cmdObj = new Menus.main(req);

  try{
      return await cmdObj.getResourceByID(req.body);
  }
  catch(err){
      throw err;
  }
});

api.delete(API_VERSION+'/restaurants/{restaurant_id}/branches/{branch_id}/menus/{menu_id}/resources/{resource_id}', async (req) => {
  let cmdObj = new Menus.main(req);

  try{
      return await cmdObj.deleteResource(req.body);
  }
  catch(err){
      throw err;
  }
});

//=========================================
api.get(API_VERSION+'/restaurants/{restaurant_id}/menus/{menu_id}/resources', async (req) => {
  let cmdObj = new Menus.main(req);

  try{
      return await cmdObj.getResources(req.body);
  }
  catch(err){
      throw err;
  }
});

api.post(API_VERSION+'/restaurants/{restaurant_id}/menus/{menu_id}/resources', async (req) => {
  let cmdObj = new Menus.main(req);

  try{
      return await cmdObj.addResource(req.body);
  }
  catch(err){
      throw err;
  }
});

api.get(API_VERSION+'/restaurants/{restaurant_id}/menus/{menu_id}/resources/{resource_id}', async (req) => {
  let cmdObj = new Menus.main(req);

  try{
      return await cmdObj.getResourceByID(req.body);
  }
  catch(err){
      throw err;
  }
});

api.delete(API_VERSION+'/restaurants/{restaurant_id}/menus/{menu_id}/resources/{resource_id}', async (req) => {
  let cmdObj = new Menus.main(req);

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