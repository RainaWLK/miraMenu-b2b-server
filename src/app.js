'use strict';
import 'babel-polyfill'
import Restaurant from './restaurant.js';
import Branches from './branch.js';
import Tables from './table.js';
import Menus from './menu.js';
import Items from './item.js';
import Rest from './rest.js';

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


var AWS = require('aws-sdk');
var s3 = new AWS.S3();

api.app.get('/restaurants/{restaurant_id}/picture',  (req, res) => {
	'use strict';

	var params = {
		Bucket: 'jumi-upload',
		Key: 'download.jpg'
	};

	//var file = require('fs').createWriteStream('/download.jpg');
	//s3.getObject(params).createReadStream().pipe(file);

	
	/*s3.getObject(params, function(err, data) {
		// Handle any error and exit
		if (err)
			return err;

		// No error happened
		// Convert Body from a Buffer to a String
		res.setHeader("Content-Type", data.ContentType);
		res.send(data.Body);
		//let objectData = data.Body.toString('utf-8'); // Use the encoding necessary
	});*/

	return new Promise((resolve, reject) => {
		s3.getObject(params, function(err, data) {
			// Handle any error and exit
			if (err)
				return err;

			// No error happened
			// Convert Body from a Buffer to a String
			//res.setHeader("Content-Type", data.ContentType);
			//res.send(data.Body);
			resolve(data.Body);
		});
		/*s3.getObject(params).createReadStream()
		.on('end', () => { return resolve(file); })
		.on('error', (error) => { return reject(error); })
		.pipe(file)*/
	});

	//return fs.readFilePromise(path.join(__dirname, 'img.png'));
}, { success: { contentType: 'image/jpg', contentHandling: 'CONVERT_TO_BINARY'}});


module.exports = api.app;
