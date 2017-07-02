let db = require('./dynamodb.js');
let JSONAPI = require('./jsonapi.js');
import { cloneDeep } from 'lodash';
import { sprintf } from 'sprintf-js';

const BRANCH_TABLE_NAME = "Branches";
const RESTAURANT_TABLE_NAME = "Restaurants";
const TABLE_NAME = "Menus";

const TYPE_NAME = "menus";

/*function TableControl() {
    //contructor() {
        //this.branchesMaxID = "0";
        //this.branch_ids = [];
        this.restaurant_id = "0";
        this.branch_id = "0";
        this.table_id = "0";
    //}
}*/

class Menus {
    constructor(reqData){
        this.reqData = reqData;

        //parse request
        this.branchTable = RESTAURANT_TABLE_NAME;
        this.controlName = "restaurantControl";
        this.restaurantID = this.reqData.params.restaurant_id;
        this.branchID = this.reqData.params.restaurant_id;
        if(typeof this.reqData.params.branch_id != 'undefined'){
            this.branchID += this.reqData.params.branch_id;
            this.branchTable = BRANCH_TABLE_NAME;
            this.controlName = "branchControl";
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
        try {
            let menusData = await db.queryById(TABLE_NAME, this.branchID);
            let dataArray = [];
            for(let menu_id in menusData.menus){
                let data = menusData.menus[menu_id];
                data.id = menu_id;
                dataArray.push(data);
            }

            /*dataArray.map(obj => {
                delete obj.branchControl;
            });*/
            return JSONAPI.makeJSONAPI(TYPE_NAME, dataArray);            
        }catch(err) {
            console.log("==menu get err!!==");
            console.log(err);
            throw err;
        }
    }

    async getByID() {
        try {
            let restaurantMenusData = await db.queryById(TABLE_NAME, this.restaurantID);
            let restaurantData = menusData.menus[this.reqData.params.menu_id];
            data.id = this.reqData.params.menu_id;
        }
        catch(err) {
            //no restaurant menu
        }




        try {
            let branchMenusData = await db.queryById(TABLE_NAME, this.branchID);

            let data = menusData.menus[this.reqData.params.menu_id];
            if(typeof data == 'undefined'){
                let err = new Error("not found");
                err.statusCode = 404;
                throw err;
            }
            data.id = this.reqData.params.menu_id;

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
            outputBuf.id = menu_id;
            let output = JSONAPI.makeJSONAPI(this.reqData.paths[5], outputBuf);
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
            outputBuf.id = menu_id;
            let output = JSONAPI.makeJSONAPI(this.reqData.paths[5], outputBuf);
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
