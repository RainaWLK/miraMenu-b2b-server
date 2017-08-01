let db = require('./dynamodb.js');
let JSONAPI = require('./jsonapi.js');
import { cloneDeep } from 'lodash';
import { sprintf } from 'sprintf-js';

const BRANCH_TABLE_NAME = "Branches";
const RESTAURANT_TABLE_NAME = "Restaurants";
const TABLE_NAME = "Menus";

const TYPE_NAME = "items";

/*function TableControl() {
    //contructor() {
        //this.branchesMaxID = "0";
        //this.branch_ids = [];
        this.restaurant_id = "0";
        this.branch_id = "0";
        this.table_id = "0";
    //}
}*/

class Items {
    constructor(reqData){
        this.reqData = reqData;

        //store restaurant var
        this.restaurantTable = RESTAURANT_TABLE_NAME;
        this.restaurantID = this.reqData.params.restaurant_id;

        //parse request
        this.controlName = "restaurantControl";
        this.branchID = this.reqData.params.restaurant_id;
        this.branchTable = RESTAURANT_TABLE_NAME;
        this.branchQuery = false;
        if(typeof this.reqData.params.branch_id != 'undefined'){
            this.branchID = this.restaurantID + this.reqData.params.branch_id;
            this.branchTable = BRANCH_TABLE_NAME;
            this.controlName = "branchControl";

            this.branchQuery = true;
        }
    }

    getNewID(controlData) {  //format: i001
        //migration
        if(typeof controlData.itemsMaxID == 'undefined'){
            controlData.itemsMaxID = "i001";
            //controlData.table_ids = [];
        }

        let itemNumID = controlData.itemsMaxID.slice(1);
        let maxID = sprintf("i%03d", parseInt(itemNumID, 10) + 1);
        return maxID;
    }



    async get() {
        let restaurantMenuItemData = null;
        let restaurantItemData = null;
        let branchItemData = null;
        try {
            restaurantMenuItemData = await db.queryById(TABLE_NAME, this.restaurantID);
            restaurantItemData = restaurantMenuItemData.items;
        }
        catch(err) {
            //no restaurant menu
        }

        if(this.branchQuery){
            try {
                let branchMenuItemData = await db.queryById(TABLE_NAME, this.branchID);
                branchItemData = branchMenuItemData.items;
            }catch(err) {
                //no branch menu
            }           
        }

        //output
        let dataArray = [];
        
        for(let item_id in restaurantItemData) {
            let data = restaurantItemData[item_id];
            data.id = this.restaurantID+item_id;
            dataArray.push(data);
        }

        for(let item_id in branchItemData) {
            let data = branchItemData[item_id];
            data.id = this.branchID+item_id;
            dataArray.push(data);
        }

        //if empty
        if(dataArray.length == 0){
            let err = new Error("not found");
            err.statusCode = 404;
            throw err;
        }

        return JSONAPI.makeJSONAPI(TYPE_NAME, dataArray);
    }

    async getByID() {
        try {
            let menusData = await db.queryById(TABLE_NAME, this.branchID);

            let data = menusData.items[this.reqData.params.item_id];
            if(typeof data == 'undefined'){
                let err = new Error("not found");
                err.statusCode = 404;
                throw err;
            }
            data.id = this.branchID+this.reqData.params.item_id;

            return JSONAPI.makeJSONAPI(TYPE_NAME, data);
        }catch(err) {
            throw err;
        }
    }

    async create(payload) {
        let inputData = JSONAPI.parseJSONAPI(payload);

        try{
            let branchData = await db.queryById(this.branchTable, this.branchID);   //get branch data    
            let item_id = this.getNewID(branchData[this.controlName]);

            let menusData;
            //let createNew = false;
            try {
                menusData = await db.queryById(TABLE_NAME, this.branchID);
                //createNew = true;
            }
            catch(err){
                //console.log("createNew");
                //init
                menusData = {
                    "id": this.branchID,
                    "menus": {},
                    "items": {}
                } 
                //console.log(menusData);
            }
            menusData.items[item_id] = inputData; 
            //console.log(menusData);

            //let msg;
            //if(createNew){
            let msg = await db.post(TABLE_NAME, menusData);
            //}
            //else{
            //    msg = await db.put(TABLE_NAME, menusData);
            //}

            //update branch
            branchData[this.controlName].itemsMaxID = item_id;
            await db.put(this.branchTable, branchData);

            //output
            let outputBuf = menusData.items[item_id];
            outputBuf.id = this.branchID+item_id;
            let output = JSONAPI.makeJSONAPI(TYPE_NAME, outputBuf);
            return output;   
        }
        catch(err) {
            console.log(err);
            throw err;
        }

    }

    async updateByID(payload) {
        try{
            let menusData = await db.queryById(TABLE_NAME, this.branchID);
            let item_id = this.reqData.params.item_id;

            //check item existed
            if(typeof menusData.items[item_id] == 'undefined'){
                let err = new Error("not found");
                err.statusCode = 404;
                throw err;
            }

            let data = JSONAPI.parseJSONAPI(payload);
            delete data.id;

            menusData.items[this.reqData.params.item_id] = data;

            let dbOutput = await db.put(TABLE_NAME, menusData);

            //output
            let outputBuf = dbOutput.items[item_id];
            outputBuf.id = this.branchID+item_id;
            let output = JSONAPI.makeJSONAPI(TYPE_NAME, outputBuf);
            return output;
        }
        catch(err) {
            throw err;
        }
    }

    async deleteByID() {
        try{
            let menusData = await db.queryById(TABLE_NAME, this.branchID);

            if(typeof menusData.items[this.reqData.params.item_id] == 'undefined'){
                let err = new Error("not found");
                err.statusCode = 404;
                throw err;
            }
            delete menusData.items[this.reqData.params.item_id];

            let msg = await db.put(TABLE_NAME, menusData);
            return msg;
        }
        catch(err) {
            throw err;
        }
    }
}

exports.main = Items;
