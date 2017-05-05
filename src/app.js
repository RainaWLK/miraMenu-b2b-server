'use strict';
import 'babel-polyfill'
import Restaurant from './restaurant.js';
import Branches from './branch.js';
import Tables from './table.js';
import Menus from './menu.js';
import Items from './item.js';
import Rest from './rest.js';
import * as S3 from './s3.js';

let api = new Rest();

api.get('/restaurants/{restaurant_id}', async (req) => {
    let cmdObj = new Restaurant(req);

    try{
        return await cmdObj.getByID();
    }
    catch(err){
        throw 404;
    }
});

api.patch('/restaurants/{restaurant_id}', async (req) => {
    let cmdObj = new Restaurant(req);

    try{
        return await cmdObj.updateByID(req.body);
    }
    catch(err){
        throw 403;
    }
});

api.delete('/restaurants/{restaurant_id}', async (req) => {
    let cmdObj = new Restaurant(req);

    try{
        return await cmdObj.deleteByID();
    }
    catch(err){
        throw 403;
    }
});

api.get('/restaurants', async (req) => {
    let cmdObj = new Restaurant(req);

    try{
        return await cmdObj.get();
    }
    catch(err){
        throw 404;
    }
});

api.post('/restaurants', async (req) => {
    let cmdObj = new Restaurant(req);

    try{
        return await cmdObj.create(req.body);
    }
    catch(err){
        throw 403;
    }
});

//=========== branch =========
api.get('/restaurants/{restaurant_id}/branches', async (req) => {
    let cmdObj = new Branches(req);

    try{
        return await cmdObj.get();
    }
    catch(err){
        throw 404;
    }
});

api.post('/restaurants/{restaurant_id}/branches', async (req) => {
    let cmdObj = new Branches(req);

    try{
        return await cmdObj.create(req.body);
    }
    catch(err){
        throw 403;
    }
});

api.get('/restaurants/{restaurant_id}/branches/{branch_id}', async (req) => {
    let cmdObj = new Branches(req);

    try{
        return await cmdObj.getByID();
    }
    catch(err){
        throw 404;
    }
});

api.patch('/restaurants/{restaurant_id}/branches/{branch_id}', async (req) => {
    let cmdObj = new Branches(req);

    try{
        return await cmdObj.updateByID(req.body);
    }
    catch(err){
        throw 403;
    }
});

api.delete('/restaurants/{restaurant_id}/branches/{branch_id}', async (req) => {
    let cmdObj = new Branches(req);

    try{
        return await cmdObj.deleteByID();
    }
    catch(err){
        throw 403;
    }
});

//=========== table =========
api.get('/restaurants/{restaurant_id}/branches/{branch_id}/tables', async (req) => {
    let cmdObj = new Tables(req);

    try{
        return await cmdObj.get();
    }
    catch(err){
        throw 404;
    }
});

api.post('/restaurants/{restaurant_id}/branches/{branch_id}/tables', async (req) => {
    let cmdObj = new Tables(req);

    try{
        return await cmdObj.create(req.body);
    }
    catch(err){
        throw 403;
    }
});


api.get('/restaurants/{restaurant_id}/branches/{branch_id}/tables/{table_id}', async (req) => {
    let cmdObj = new Tables(req);

    try{
        return await cmdObj.getByID();
    }
    catch(err){
        throw 404;
    }
});

api.patch('/restaurants/{restaurant_id}/branches/{branch_id}/tables/{table_id}', async (req) => {
    let cmdObj = new Tables(req);

    try{
        return await cmdObj.updateByID(req.body);
    }
    catch(err){
        throw 403;
    }
});

api.delete('/restaurants/{restaurant_id}/branches/{branch_id}/tables/{table_id}', async (req) => {
    let cmdObj = new Tables(req);

    try{
        return await cmdObj.deleteByID();
    }
    catch(err){
        throw 403;
    }
});

//=========== Menu =========
api.get('/restaurants/{restaurant_id}/branches/{branch_id}/menus', async (req) => {
    let cmdObj = new Menus(req);

    try{
        return await cmdObj.get();
    }
    catch(err){
        throw 404;
    }
});

api.post('/restaurants/{restaurant_id}/branches/{branch_id}/menus', async (req) => {
    let cmdObj = new Menus(req);

    try{
        return await cmdObj.create(req.body);
    }
    catch(err){
        throw 403;
    }
});


api.get('/restaurants/{restaurant_id}/branches/{branch_id}/menus/{menu_id}', async (req) => {
    let cmdObj = new Menus(req);

    try{
        return await cmdObj.getByID();
    }
    catch(err){
        throw 404;
    }
});

api.patch('/restaurants/{restaurant_id}/branches/{branch_id}/menus/{menu_id}', async (req) => {
    let cmdObj = new Menus(req);

    try{
        return await cmdObj.updateByID(req.body);
    }
    catch(err){
        throw 403;
    }
});

api.delete('/restaurants/{restaurant_id}/branches/{branch_id}/menus/{menu_id}', async (req) => {
    let cmdObj = new Menus(req);

    try{
        return await cmdObj.deleteByID();
    }
    catch(err){
        throw 403;
    }
});

api.get('/restaurants/{restaurant_id}/menus', async (req) => {
    let cmdObj = new Menus(req);

    try{
        return await cmdObj.get();
    }
    catch(err){
        throw 404;
    }
});

api.post('/restaurants/{restaurant_id}/menus', async (req) => {
    let cmdObj = new Menus(req);

    try{
        return await cmdObj.create(req.body);
    }
    catch(err){
        throw 403;
    }
});


api.get('/restaurants/{restaurant_id}/menus/{menu_id}', async (req) => {
    let cmdObj = new Menus(req);

    try{
        return await cmdObj.getByID();
    }
    catch(err){
        throw 404;
    }
});

api.patch('/restaurants/{restaurant_id}/menus/{menu_id}', async (req) => {
    let cmdObj = new Menus(req);

    try{
        return await cmdObj.updateByID(req.body);
    }
    catch(err){
        throw 403;
    }
});

api.delete('/restaurants/{restaurant_id}/menus/{menu_id}', async (req) => {
    let cmdObj = new Menus(req);

    try{
        return await cmdObj.deleteByID();
    }
    catch(err){
        throw 403;
    }
});

//=========== Items =========
api.get('/restaurants/{restaurant_id}/branches/{branch_id}/items', async (req) => {
    let cmdObj = new Items(req);

    try{
        return await cmdObj.get();
    }
    catch(err){
        throw 404;
    }
});

api.post('/restaurants/{restaurant_id}/branches/{branch_id}/items', async (req) => {
    let cmdObj = new Items(req);

    try{
        return await cmdObj.create(req.body);
    }
    catch(err){
        throw 403;
    }
});


api.get('/restaurants/{restaurant_id}/branches/{branch_id}/items/{item_id}', async (req) => {
    let cmdObj = new Items(req);

    try{
        return await cmdObj.getByID();
    }
    catch(err){
        throw 404;
    }
});

api.patch('/restaurants/{restaurant_id}/branches/{branch_id}/items/{item_id}', async (req) => {
    let cmdObj = new Items(req);

    try{
        return await cmdObj.updateByID(req.body);
    }
    catch(err){
        throw 403;
    }
});

api.delete('/restaurants/{restaurant_id}/branches/{branch_id}/items/{item_id}', async (req) => {
    let cmdObj = new Items(req);

    try{
        return await cmdObj.deleteByID();
    }
    catch(err){
        throw 403;
    }
});

api.get('/restaurants/{restaurant_id}/items', async (req) => {
    let cmdObj = new Items(req);

    try{
        return await cmdObj.get();
    }
    catch(err){
        throw 404;
    }
});

api.post('/restaurants/{restaurant_id}/items', async (req) => {
    let cmdObj = new Items(req);

    try{
        return await cmdObj.create(req.body);
    }
    catch(err){
        throw 403;
    }
});


api.get('/restaurants/{restaurant_id}/items/{item_id}', async (req) => {
    let cmdObj = new Items(req);

    try{
        return await cmdObj.getByID();
    }
    catch(err){
        throw 404;
    }
});

api.patch('/restaurants/{restaurant_id}/items/{item_id}', async (req) => {
    let cmdObj = new Items(req);

    try{
        return await cmdObj.updateByID(req.body);
    }
    catch(err){
        throw 403;
    }
});

api.delete('/restaurants/{restaurant_id}/items/{item_id}', async (req) => {
    let cmdObj = new Items(req);

    try{
        return await cmdObj.deleteByID();
    }
    catch(err){
        throw 403;
    }
});


api.bGet('/restaurants/{restaurant_id}/pictures/{picture_id}',  async(req) => {
    let cmdObj = new Restaurant(req);
    console.log("pictures/{picture_id}");
	console.log(req);
    try{
	    return await cmdObj.getPicture();
    }
    catch(err){
        throw 404;
    }
});

api.get('/restaurants/{restaurant_id}/pictures/{picture_id}/info', async (req) => {
    let cmdObj = new Restaurant(req);
    console.log("pictures/{picture_id}/info");
	console.log(req);
    try{
        return await cmdObj.getPictureInfo();
    }
    catch(err){
        throw 404;
    }
});

api.bPost('/restaurants/{restaurant_id}/pictures',  async(req) => {
    let cmdObj = new Restaurant(req);

    try{
        return await cmdObj.addPicture(req.body, req.binaryBody);
    }
    catch(err){
        throw err;
    }
});

api.delete('/restaurants/{restaurant_id}/pictures', async (req) => {
    let cmdObj = new Restaurant(req);

    try{
        return await cmdObj.deletePicture();
    }
    catch(err){
        throw 403;
    }
});

module.exports = api.app;
