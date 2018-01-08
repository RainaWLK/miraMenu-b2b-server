let Items = require('../item.js');

function go(api){

//=========== Items =========
api.get('/restaurants/{restaurant_id}/branches/{branch_id}/items', async (req) => {
  let cmdObj = new Items.main(req);

  try{
      return await cmdObj.get();
  }
  catch(err){
      throw err;
  }
});

api.post('/restaurants/{restaurant_id}/branches/{branch_id}/items', async (req) => {
  let cmdObj = new Items.main(req);

  try{
      return await cmdObj.create(req.body);
  }
  catch(err){
      throw err;
  }
});


api.get('/restaurants/{restaurant_id}/branches/{branch_id}/items/{item_id}', async (req) => {
  let cmdObj = new Items.main(req);

  try{
      return await cmdObj.getByID();
  }
  catch(err){
      throw err;
  }
});

api.patch('/restaurants/{restaurant_id}/branches/{branch_id}/items/{item_id}', async (req) => {
  let cmdObj = new Items.main(req);

  try{
      return await cmdObj.updateByID(req.body);
  }
  catch(err){
      throw err;
  }
});

api.delete('/restaurants/{restaurant_id}/branches/{branch_id}/items/{item_id}', async (req) => {
  let cmdObj = new Items.main(req);

  try{
      return await cmdObj.deleteByID();
  }
  catch(err){
      throw err;
  }
});

api.get('/restaurants/{restaurant_id}/items', async (req) => {
  let cmdObj = new Items.main(req);

  try{
      return await cmdObj.get();
  }
  catch(err){
      throw err;
  }
});

api.post('/restaurants/{restaurant_id}/items', async (req) => {
  let cmdObj = new Items.main(req);

  try{
      return await cmdObj.create(req.body);
  }
  catch(err){
      throw err;
  }
});


api.get('/restaurants/{restaurant_id}/items/{item_id}', async (req) => {
  let cmdObj = new Items.main(req);

  try{
      return await cmdObj.getByID();
  }
  catch(err){
      throw err;
  }
});

api.patch('/restaurants/{restaurant_id}/items/{item_id}', async (req) => {
  let cmdObj = new Items.main(req);

  try{
      return await cmdObj.updateByID(req.body);
  }
  catch(err){
      throw err;
  }
});

api.delete('/restaurants/{restaurant_id}/items/{item_id}', async (req) => {
  let cmdObj = new Items.main(req);

  try{
      return await cmdObj.deleteByID();
  }
  catch(err){
      throw err;
  }
});

//=========== Photos =========
api.get('/restaurants/{restaurant_id}/items/{item_id}/photos/{photo_id}', async (req) => {
  let cmdObj = new Items.main(req);

  try{
      return await cmdObj.getPhotoInfoByID();
  }
  catch(err){
      throw err;
  }
});

api.patch('/restaurants/{restaurant_id}/items/{item_id}/photos/{photo_id}', async (req) => {
  let cmdObj = new Items.main(req);

  try{
      return await cmdObj.updatePhotoInfo(req.body);
  }
  catch(err){
      throw err;
  }
});

api.delete('/restaurants/{restaurant_id}/items/{item_id}/photos/{photo_id}', async (req) => {
  let cmdObj = new Items.main(req);

  try{
      return await cmdObj.deletePhoto();
  }
  catch(err){
      throw err;
  }
});


api.get('/restaurants/{restaurant_id}/items/{item_id}/photos', async (req) => {
  let cmdObj = new Items.main(req);

  try{
      return await cmdObj.getPhotoInfo(req.body);
  }
  catch(err){
      throw err;
  }
});

api.post('/restaurants/{restaurant_id}/items/{item_id}/photos', async (req) => {
  let cmdObj = new Items.main(req);

  try{
      return await cmdObj.addPhoto(req.body);
  }
  catch(err){
      throw err;
  }
});

//=============

api.get('/restaurants/{restaurant_id}/branches/{branch_id}/items/{item_id}/photos/{photo_id}', async (req) => {
  let cmdObj = new Items.main(req);

  try{
      return await cmdObj.getPhotoInfoByID();
  }
  catch(err){
      throw err;
  }
});

api.patch('/restaurants/{restaurant_id}/branches/{branch_id}/items/{item_id}/photos/{photo_id}', async (req) => {
  let cmdObj = new Items.main(req);

  try{
      return await cmdObj.updatePhotoInfo(req.body);
  }
  catch(err){
      throw err;
  }
});

api.delete('/restaurants/{restaurant_id}/branches/{branch_id}/items/{item_id}/photos/{photo_id}', async (req) => {
  let cmdObj = new Items.main(req);

  try{
      return await cmdObj.deletePhoto();
  }
  catch(err){
      throw err;
  }
});


api.get('/restaurants/{restaurant_id}/branches/{branch_id}/items/{item_id}/photos', async (req) => {
  let cmdObj = new Items.main(req);

  try{
      return await cmdObj.getPhotoInfo(req.body);
  }
  catch(err){
      throw err;
  }
});

api.post('/restaurants/{restaurant_id}/branches/{branch_id}/items/{item_id}/photos', async (req) => {
  let cmdObj = new Items.main(req);

  try{
      return await cmdObj.addPhoto(req.body);
  }
  catch(err){
      throw err;
  }
});


//============== i18n =========================
api.get('/restaurants/{restaurant_id}/branches/{branch_id}/items/{item_id}/i18n', async (req) => {
  let cmdObj = new Items.main(req);

  try{
      return await cmdObj.getI18n(req.body);
  }
  catch(err){
      throw err;
  }
});

api.post('/restaurants/{restaurant_id}/branches/{branch_id}/items/{item_id}/i18n', async (req) => {
  let cmdObj = new Items.main(req);

  try{
      return await cmdObj.addI18n(req.body);
  }
  catch(err){
      throw err;
  }
});

api.get('/restaurants/{restaurant_id}/branches/{branch_id}/items/{item_id}/i18n/{i18n_id}', async (req) => {
  let cmdObj = new Items.main(req);

  try{
      return await cmdObj.getI18nByID(req.body);
  }
  catch(err){
      throw err;
  }
});

api.patch('/restaurants/{restaurant_id}/branches/{branch_id}/items/{item_id}/i18n/{i18n_id}', async (req) => {
  let cmdObj = new Items.main(req);

  try{
      return await cmdObj.updateI18n(req.body);
  }
  catch(err){
      throw err;
  }
});

api.delete('/restaurants/{restaurant_id}/branches/{branch_id}/items/{item_id}/i18n/{i18n_id}', async (req) => {
  let cmdObj = new Items.main(req);

  try{
      return await cmdObj.deleteI18n(req.body);
  }
  catch(err){
      throw err;
  }
});

//=========================================
api.get('/restaurants/{restaurant_id}/items/{item_id}/i18n', async (req) => {
  let cmdObj = new Items.main(req);

  try{
      return await cmdObj.getI18n(req.body);
  }
  catch(err){
      throw err;
  }
});

api.post('/restaurants/{restaurant_id}/items/{item_id}/i18n', async (req) => {
  let cmdObj = new Items.main(req);

  try{
      return await cmdObj.addI18n(req.body);
  }
  catch(err){
      throw err;
  }
});

api.get('/restaurants/{restaurant_id}/items/{item_id}/i18n/{i18n_id}', async (req) => {
  let cmdObj = new Items.main(req);

  try{
      return await cmdObj.getI18nByID(req.body);
  }
  catch(err){
      throw err;
  }
});

api.patch('/restaurants/{restaurant_id}/items/{item_id}/i18n/{i18n_id}', async (req) => {
  let cmdObj = new Items.main(req);

  try{
      return await cmdObj.updateI18n(req.body);
  }
  catch(err){
      throw err;
  }
});

api.delete('/restaurants/{restaurant_id}/items/{item_id}/i18n/{i18n_id}', async (req) => {
  let cmdObj = new Items.main(req);

  try{
      return await cmdObj.deleteI18n(req.body);
  }
  catch(err){
      throw err;
  }
});


//============== Resources =========================
api.get('/restaurants/{restaurant_id}/branches/{branch_id}/items/{item_id}/resources', async (req) => {
  let cmdObj = new Items.main(req);

  try{
      return await cmdObj.getResources(req.body);
  }
  catch(err){
      throw err;
  }
});

api.post('/restaurants/{restaurant_id}/branches/{branch_id}/items/{item_id}/resources', async (req) => {
  let cmdObj = new Items.main(req);

  try{
      return await cmdObj.addResource(req.body);
  }
  catch(err){
      throw err;
  }
});

api.get('/restaurants/{restaurant_id}/branches/{branch_id}/items/{item_id}/resources/{resource_id}', async (req) => {
  let cmdObj = new Items.main(req);

  try{
      return await cmdObj.getResourceByID(req.body);
  }
  catch(err){
      throw err;
  }
});

api.delete('/restaurants/{restaurant_id}/branches/{branch_id}/items/{item_id}/resources/{resource_id}', async (req) => {
  let cmdObj = new Items.main(req);

  try{
      return await cmdObj.deleteResource(req.body);
  }
  catch(err){
      throw err;
  }
});

//=========================================
api.get('/restaurants/{restaurant_id}/items/{item_id}/resources', async (req) => {
  let cmdObj = new Items.main(req);

  try{
      return await cmdObj.getResources(req.body);
  }
  catch(err){
      throw err;
  }
});

api.post('/restaurants/{restaurant_id}/items/{item_id}/resources', async (req) => {
  let cmdObj = new Items.main(req);

  try{
      return await cmdObj.addResource(req.body);
  }
  catch(err){
      throw err;
  }
});

api.get('/restaurants/{restaurant_id}/items/{item_id}/resources/{resource_id}', async (req) => {
  let cmdObj = new Items.main(req);

  try{
      return await cmdObj.getResourceByID(req.body);
  }
  catch(err){
      throw err;
  }
});

api.delete('/restaurants/{restaurant_id}/items/{item_id}/resources/{resource_id}', async (req) => {
  let cmdObj = new Items.main(req);

  try{
      return await cmdObj.deleteResource(req.body);
  }
  catch(err){
      throw err;
  }
});

}

exports.go = go;