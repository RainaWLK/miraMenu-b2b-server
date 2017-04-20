'use strict';
import 'babel-polyfill'
let ApiBuilder = require('claudia-api-builder');
import Restaurant from './restaurant.js';
import Branches from './branch.js';
import Tables from './table.js';
import Rest from './rest.js';


const DEBUG = 1;



//debug env
let app;
let db;
if(DEBUG) {
    let express = require('express');
    let bodyParser = require('body-parser');
    db = require('./dynamodb.js');
    
    app = express();
    app.use(bodyParser.json());

    let server = app.listen(8081, () => {
        let host = server.address().address;
        let port = server.address().port;
   
        console.log("Example app listening at http://%s:%s", host, port);
    });

    /*AWS.config.update({
      region: "us-east-1"
    });*/
}
else {
    app = new ApiBuilder();
}

let api = new Rest(app);

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

api.patch('/restaurants', async (req) => {
    let cmdObj = new Restaurant(req);

    try{
        return await cmdObj.update(req.body);
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
/*let branchStr = '/restaurants/{restaurant_id}/branches';
if (DEBUG) {
    branchStr = '/restaurants/:restaurant_id/branches';
}
app.get(branchStr, async (req, res) => {
    let reqData = makeReqData(req);
    let cmdObj = new Branches(reqData);
    console.log(reqData);

    try{
        let msg = await cmdObj.get();
        return responseOK(res, msg);
    }
    catch(err){
        return responseError(res, 404);
    } 

});*/
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
/*let oneBranchStr = '/restaurants/{restaurant_id}/branches/{branch_id}';
if (DEBUG) {
    oneBranchStr = '/restaurants/:restaurant_id/branches/:branch_id';
}
app.get(oneBranchStr, async (req, res) => {
    let reqData = makeReqData(req);
    let cmdObj = new Branches(reqData);

    try{
        let msg = await cmdObj.getByID();
        return responseOK(res, msg);
    }
    catch(err){
        return responseError(res, 404);
    }    
});*/
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
/*let tableStr = '/restaurants/{restaurant_id}/branches/{branch_id}/tables';
if (DEBUG) {
    tableStr = '/restaurants/:restaurant_id/branches/:branch_id/tables';
}
app.get(tableStr, async (req, res) => {
    let reqData = makeReqData(req);
    let cmdObj = new Tables(reqData);
    console.log(reqData);

    try{
        let msg = await cmdObj.get();
        return responseOK(res, msg);
    }
    catch(err){
        return responseError(res, 404);
    }

});*/
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
/*let oneTableStr = '/restaurants/{restaurant_id}/branches/{branch_id}/tables/{table_id}';
if (DEBUG) {
    oneTableStr = '/restaurants/:restaurant_id/branches/:branch_id/tables/:table_id';
}
app.get(oneTableStr, async (req, res) => {
    let reqData = makeReqData(req);
    let cmdObj = new Tables(reqData);

    try{
        let msg = await cmdObj.getByID();
        return responseOK(res, msg);
    }
    catch(err){
        return responseError(res, 404);
    }    
});*/

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

module.exports = app;
