let db = require('./dynamodb.js');
let JSONAPI = require('./jsonapi.js');
import { cloneDeep } from 'lodash';
import { sprintf } from 'sprintf-js';

const BRANCH_TABLE_NAME = "Branches";
const RESTAURANT_TABLE_NAME = "Restaurants";
const TABLE_NAME = "Menus";

const TYPE_NAME = "menus";

class Menus {
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

    getNewID(controlData) {  //format: m001

        //migration
        if(typeof controlData.menusMaxID == 'undefined'){
            controlData.menusMaxID = "m000";
            //controlData.table_ids = [];
        }

        let menuNumID = controlData.menusMaxID.slice(1);
        let maxID = sprintf("m%03d", parseInt(menuNumID, 10) + 1);
        return maxID;
    }



    async get() {
        let restaurantMenuItemData = null;
        let restaurantMenuData = null;
        let branchMenuData = null;
        try {
            restaurantMenuItemData = await db.queryById(TABLE_NAME, this.restaurantID);
            restaurantMenuData = restaurantMenuItemData.menus;
        }
        catch(err) {
            //no restaurant menu
        }

        if(this.branchQuery){
            try {
                let branchMenuItemData = await db.queryById(TABLE_NAME, this.branchID);
                branchMenuData = branchMenuItemData.menus;
            }catch(err) {
                //no branch menu
            }           
        }

        //output
        let dataArray = [];
        
        for(let menu_id in restaurantMenuData) {
            let data = restaurantMenuData[menu_id];
            data.id = this.restaurantID+menu_id;
            dataArray.push(data);
        }

        for(let menu_id in branchMenuData) {
            let data = branchMenuData[menu_id];
            data.id = this.branchID+menu_id;
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

            let data = menusData.menus[this.reqData.params.menu_id];
            if(typeof data == 'undefined'){
                let err = new Error("not found");
                err.statusCode = 404;
                throw err;
            }
            data.id = this.branchID+this.reqData.params.menu_id;

            return JSONAPI.makeJSONAPI(TYPE_NAME, data);
        }catch(err) {
            throw err;
        }
    }

    async create(payload) {
        let inputData = JSONAPI.parseJSONAPI(payload);

        try{
            let branchData = await db.queryById(this.branchTable, this.branchID);   //get branch data    
            let menu_id = this.getNewID(branchData[this.controlName]);

            let menusData;
            //let createNew = false;
            try {
                menusData = await db.queryById(TABLE_NAME, this.branchID);
                //createNew = true;

                //migration
                if(typeof menusData.items == 'undefined'){
                    menusData.items = {};
                }
            }
            catch(err){
                //init
                menusData = {
                    "id": this.branchID,
                    "menus": {},
                    "items": {}
                } 
            }

            //check item existed
            let validItems = inputData.items.reduce((result, item_id) => {
                //console.log(item_id);
                if(typeof menusData.items[item_id] != 'undefined'){
                    result.push(item_id);
                }
                return result;
            }, []);
            //console.log(validItems);
            inputData.items = validItems;

            menusData.menus[menu_id] = inputData; 
            //console.log(menusData);

            //bug? no fully table rewrite
            //let msg;
            //if(createNew){
            let msg = await db.post(TABLE_NAME, menusData);
            //}
            //else{
            //let dbOutput = await db.put(TABLE_NAME, menusData);
            //}

            //update branch
            branchData[this.controlName].menusMaxID = menu_id;
            await db.put(this.branchTable, branchData);

            //output
            let outputBuf = menusData.menus[menu_id];
            outputBuf.id = this.branchID+menu_id;
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
            let menu_id = this.reqData.params.menu_id;

            //check menu existed
            if(typeof menusData.menus[menu_id] == 'undefined'){
                let err = new Error("not found");
                err.statusCode = 404;
                throw err;
            }

            let data = JSONAPI.parseJSONAPI(payload);
            delete data.id;

            menusData.menus[menu_id] = data;

            let dbOutput = await db.put(TABLE_NAME, menusData);

            //output
            let outputBuf = dbOutput.menus[menu_id];
            outputBuf.id = this.branchID+menu_id;
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

            if(typeof menusData.menus[this.reqData.params.menu_id] == 'undefined'){
                let err = new Error("not found");
                err.statusCode = 404;
                throw err;
            }
            delete menusData.menus[this.reqData.params.menu_id];

            let msg = await db.put(TABLE_NAME, menusData);
            return msg;
        }
        catch(err) {
            throw err;
        }
    }
}

exports.main = Menus;
