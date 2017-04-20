let db = require('./dynamodb.js');
let JSONAPI = require('./jsonapi.js');
import Control from './control.js';
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

class  Items {
    constructor(reqData){
        this.reqData = reqData;

        //parse request
        this.branchTable = RESTAURANT_TABLE_NAME;
        this.controlName = "restaurantControl";
        this.branchID = this.reqData.params.restaurant_id;
        if(typeof this.reqData.params.branch_id != 'undefined'){
            this.branchID += this.reqData.params.branch_id;
            this.branchTable = BRANCH_TABLE_NAME;
            this.controlName = "branchControl";
        }
    }

    getNewID(controlData) {  //format: i001
        console.log('==getNew item ID==');

        //migration
        if(typeof controlData.itemsMaxID == 'undefined'){
            controlData.itemsMaxID = "i001";
            //controlData.table_ids = [];
        }

        let itemNumID = controlData.itemsMaxID.slice(1);
        let maxID = sprintf("i%03d", parseInt(itemNumID, 10) + 1);
        console.log(maxID);
        return maxID;
    }



    async get() {
        try {
            let menusData = await db.queryById(TABLE_NAME, this.branchID);
            let dataArray = [];
            for(let item_id in menusData.items){
                let data = menusData.items[item_id];
                data.id = item_id;
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
            let menusData = await db.queryById(TABLE_NAME, this.branchID);

            let data = menusData.items[this.reqData.params.item_id];
            data.id = this.reqData.params.item_id;

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
            let createNew = false;
            try {
                menusData = await db.queryById(TABLE_NAME, this.branchID);
                createNew = true;
            }
            catch(err){
                console.log("createNew");
                //init
                menusData = {
                    "id": this.branchID,
                    "menus": {},
                    "items": {}
                } 
                console.log(menusData);
            }
            menusData.items[item_id] = inputData; 
            console.log(menusData);

            let msg;
            if(createNew){
                msg = await db.post(TABLE_NAME, menusData);
            }
            else{
                msg = await db.put(TABLE_NAME, menusData);
            }

            //update branch
            branchData[this.controlName].itemsMaxID = item_id;
            await db.put(this.branchTable, branchData);

            return msg;
        }
        catch(err) {
            console.log(err);
            throw err;
        }

    }

    async updateByID(payload) {
        try{
            let menusData = await db.queryById(TABLE_NAME, this.branchID);

            let data = JSONAPI.parseJSONAPI(payload);
            delete data.id;

            menusData.items[this.reqData.params.item_id] = data;

            let msg = await db.put(TABLE_NAME, menusData);
            return msg;
        }
        catch(err) {
            throw err;
        }
    }

    async deleteByID() {
        try{
            let menusData = await db.queryById(TABLE_NAME, this.branchID);

            delete menusData.items[this.reqData.params.item_id];

            let msg = await db.put(TABLE_NAME, menusData);
            return msg;
        }
        catch(err) {
            throw err;
        }
    }
}


export default Items;