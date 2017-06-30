'use strict';
import 'babel-polyfill'
let Restaurant = require('./restaurant.js');
let Branches = require('./branch.js');
let Tables = require('./table.js');
let Menus = require('./menu.js');
let Items = require('./item.js');
let Rest = require('./rest.js');

let api = new Rest.main();

api.get('/restaurants/{restaurant_id}', async (req) => {
    let cmdObj = new Restaurant.main(req);

    try{
        return await cmdObj.getByID();
    }
    catch(err){
        throw err;
    }
});

api.patch('/restaurants/{restaurant_id}', async (req) => {
    let cmdObj = new Restaurant.main(req);

    try{
        return await cmdObj.updateByID(req.body);
    }
    catch(err){
        throw err;
    }
});

api.delete('/restaurants/{restaurant_id}', async (req) => {
    let cmdObj = new Restaurant.main(req);

    try{
        return await cmdObj.deleteByID();
    }
    catch(err){
        throw err;
    }
});

api.get('/restaurants', async (req) => {
    let cmdObj = new Restaurant.main(req);

    try{
        return await cmdObj.get();
    }
    catch(err){
        throw err;
    }
});

api.post('/restaurants', async (req) => {
    let cmdObj = new Restaurant.main(req);

    try{
        return await cmdObj.create(req.body);
    }
    catch(err){
        throw err;
    }
});

//=========== branch =========
api.get('/restaurants/{restaurant_id}/branches', async (req) => {
    let cmdObj = new Branches.main(req);

    try{
        return await cmdObj.get();
    }
    catch(err){
        throw err;
    }
});

api.post('/restaurants/{restaurant_id}/branches', async (req) => {
    let cmdObj = new Branches.main(req);

    try{
        return await cmdObj.create(req.body);
    }
    catch(err){
        throw err;
    }
});

api.get('/restaurants/{restaurant_id}/branches/{branch_id}', async (req) => {
    let cmdObj = new Branches.main(req);

    try{
        return await cmdObj.getByID();
    }
    catch(err){
        throw err;
    }
});

api.patch('/restaurants/{restaurant_id}/branches/{branch_id}', async (req) => {
    let cmdObj = new Branches.main(req);

    try{
        return await cmdObj.updateByID(req.body);
    }
    catch(err){
        throw err;
    }
});

api.delete('/restaurants/{restaurant_id}/branches/{branch_id}', async (req) => {
    let cmdObj = new Branches.main(req);

    try{
        return await cmdObj.deleteByID();
    }
    catch(err){
        throw err;
    }
});

//=========== table =========
api.get('/restaurants/{restaurant_id}/branches/{branch_id}/tables', async (req) => {
    let cmdObj = new Tables.main(req);

    try{
        return await cmdObj.get();
    }
    catch(err){
        throw err;
    }
});

api.post('/restaurants/{restaurant_id}/branches/{branch_id}/tables', async (req) => {
    let cmdObj = new Tables.main(req);

    try{
        return await cmdObj.create(req.body);
    }
    catch(err){
        throw err;
    }
});


api.get('/restaurants/{restaurant_id}/branches/{branch_id}/tables/{table_id}', async (req) => {
    let cmdObj = new Tables.main(req);

    try{
        return await cmdObj.getByID();
    }
    catch(err){
        throw err;
    }
});

api.patch('/restaurants/{restaurant_id}/branches/{branch_id}/tables/{table_id}', async (req) => {
    let cmdObj = new Tables.main(req);

    try{
        return await cmdObj.updateByID(req.body);
    }
    catch(err){
        throw err;
    }
});

api.delete('/restaurants/{restaurant_id}/branches/{branch_id}/tables/{table_id}', async (req) => {
    let cmdObj = new Tables.main(req);

    try{
        return await cmdObj.deleteByID();
    }
    catch(err){
        throw err;
    }
});

//=========== Menu =========
api.get('/restaurants/{restaurant_id}/branches/{branch_id}/menus', async (req) => {
    let cmdObj = new Menus.main(req);

    try{
        return await cmdObj.get();
    }
    catch(err){
        throw err;
    }
});

api.post('/restaurants/{restaurant_id}/branches/{branch_id}/menus', async (req) => {
    let cmdObj = new Menus.main(req);

    try{
        return await cmdObj.create(req.body);
    }
    catch(err){
        throw err;
    }
});


api.get('/restaurants/{restaurant_id}/branches/{branch_id}/menus/{menu_id}', async (req) => {
    let cmdObj = new Menus.main(req);

    try{
        return await cmdObj.getByID();
    }
    catch(err){
        throw err;
    }
});

api.patch('/restaurants/{restaurant_id}/branches/{branch_id}/menus/{menu_id}', async (req) => {
    let cmdObj = new Menus.main(req);

    try{
        return await cmdObj.updateByID(req.body);
    }
    catch(err){
        throw err;
    }
});

api.delete('/restaurants/{restaurant_id}/branches/{branch_id}/menus/{menu_id}', async (req) => {
    let cmdObj = new Menus.main(req);

    try{
        return await cmdObj.deleteByID();
    }
    catch(err){
        throw err;
    }
});

api.get('/restaurants/{restaurant_id}/menus', async (req) => {
    let cmdObj = new Menus.main(req);

    try{
        return await cmdObj.get();
    }
    catch(err){
        throw err;
    }
});

api.post('/restaurants/{restaurant_id}/menus', async (req) => {
    let cmdObj = new Menus.main(req);

    try{
        return await cmdObj.create(req.body);
    }
    catch(err){
        throw err;
    }
});


api.get('/restaurants/{restaurant_id}/menus/{menu_id}', async (req) => {
    let cmdObj = new Menus.main(req);

    try{
        return await cmdObj.getByID();
    }
    catch(err){
        throw err;
    }
});

api.patch('/restaurants/{restaurant_id}/menus/{menu_id}', async (req) => {
    let cmdObj = new Menus.main(req);

    try{
        return await cmdObj.updateByID(req.body);
    }
    catch(err){
        throw err;
    }
});

api.delete('/restaurants/{restaurant_id}/menus/{menu_id}', async (req) => {
    let cmdObj = new Menus.main(req);

    try{
        return await cmdObj.deleteByID();
    }
    catch(err){
        throw err;
    }
});

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


/*api.bGet('/restaurants/{restaurant_id}/pictures/{picture_id}',  async(req) => {
    let cmdObj = new Restaurant.main(req);
    console.log("pictures/{picture_id}");
	console.log(req);
    try{
	    return await cmdObj.getPicture();
    }
    catch(err){
        throw 404;
    }
});*/

api.get('/restaurants/{restaurant_id}/pictures/{picture_id}/info', async (req) => {
    let cmdObj = new Restaurant.main(req);
    console.log("pictures/{picture_id}/info");
	console.log(req);
    try{
        return await cmdObj.getPictureInfo();
    }
    catch(err){
        throw err;
    }
});

/*api.bPost('/restaurants/{restaurant_id}/pictures',  async(req) => {
    let cmdObj = new Restaurant(req);

    try{
        return await cmdObj.addPicture(req.body, req.binaryBody);
    }
    catch(err){
        throw err;
    }
});*/

api.delete('/restaurants/{restaurant_id}/pictures', async (req) => {
    let cmdObj = new Restaurant.main(req);

    try{
        return await cmdObj.deletePicture();
    }
    catch(err){
        throw err;
    }
});

module.exports = api.app;
