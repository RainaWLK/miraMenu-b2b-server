let db = require('./dynamodb.js');
let JSONAPI = require('./jsonapi.js');
let Utils = require('./utils.js');
import { cloneDeep } from 'lodash';

const TABLE_NAME = "Branches";
const RESTAURANT_TABLE_NAME = "Restaurants";

function BranchControl() {
    //contructor() {
        //this.branchesMaxID = "0";
        //this.branch_ids = [];
        this.restaurant_id = "0";
        this.branch_id = "s0";
        this.tablesMaxID = "t000";
        this.menusMaxID = "m000";
        this.itemsMaxID = "i000";
        //this.table_ids = [];
    //}
}

class Branches {
    constructor(reqData){
        this.reqData = reqData;
    }

    getNewID(restaurantData) {
        let idList = Utils.parseID(restaurantData.restaurantControl.branchesMaxID);

        let maxID = parseInt(idList.s, 16)+1;

        return "s"+maxID.toString();
    }

    /*getNewID(restaurantData) {
        console.log('==getNewID==');
        console.log(restaurantData);
        let maxID = parseInt(restaurantData.restaurantControl.branchesMaxID, 16) + 1;
        console.log(maxID);
        return maxID.toString();
    }*/

    async get() {
        try {
            //scan table Restaurant (bug: must merged into dynamodb.js)
            let restaurant_id = this.reqData.params.restaurant_id.toString();
            var params = {
                TableName: TABLE_NAME,
                //ProjectionExpression: "#yr, title, info.rating",
                FilterExpression: "#a1.#a2 = :b",
                ExpressionAttributeNames: {
                    "#a1": "branchControl",
                    "#a2": "restaurant_id"
                },
                ExpressionAttributeValues: {
                     ":b": restaurant_id 
                }
            };
            let dataArray = await db.scanDataByFilter(params);
            dataArray.map(obj => {
                delete obj.branchControl;

                //table
                let tableArray = [];
                for(let table_id in obj.tables){
                    tableArray.push(table_id);
                }
                obj.tables = tableArray;
            });

            return JSONAPI.makeJSONAPI(this.reqData.paths[3], dataArray);            
        }catch(err) {
            console.log("==branch get err!!==");
            console.log(err);
            throw err;
        }
    }

    async getByID() {
        try {
            let id = this.reqData.params.restaurant_id+this.reqData.params.branch_id;
            let data = await db.queryById(TABLE_NAME, id);
            delete data.branchControl;
            //table
            let tableArray = [];
            for(let table_id in data.tables){
                tableArray.push(table_id);
            }
            data.tables = tableArray;

            let output = JSONAPI.makeJSONAPI(this.reqData.paths[3], data);
            return output;
        }catch(err) {
            throw err;
        }
    }

    async create(payload) {
        try{
            let restaurantData = await db.queryById(RESTAURANT_TABLE_NAME, this.reqData.params.restaurant_id);
            let data = JSONAPI.parseJSONAPI(payload);
            let branch_id = this.getNewID(restaurantData);

            let control = new BranchControl();
            control.restaurant_id = this.reqData.params.restaurant_id.toString();
            control.branch_id = branch_id;
            data.branchControl = JSON.parse(JSON.stringify(control));   //bug

            data.id = control.restaurant_id+control.branch_id;

            await db.post(TABLE_NAME, data);

            //update restaurant
            restaurantData.restaurantControl.branchesMaxID = branch_id;
            restaurantData.restaurantControl.branch_ids.push(branch_id);
            await db.put(RESTAURANT_TABLE_NAME, restaurantData);

            //output
            delete data.branchControl;
            let output = JSONAPI.makeJSONAPI(this.reqData.paths[3], data);
            return output;   
        }
        catch(err) {
            throw err;
        }

    }

    async updateByID(payload) {
        let data = JSONAPI.parseJSONAPI(payload);

        try {
            //get and check restaurant existed
            let restaurantData = await db.queryById(RESTAURANT_TABLE_NAME, this.reqData.params.restaurant_id);
            //console.log("--restaurantData--");
            //console.log(restaurantData);
            data.id = this.reqData.params.restaurant_id+this.reqData.params.branch_id;
            let branchData = await db.queryById(TABLE_NAME, data.id);
            //console.log("--branchData--");
            //console.log(branchData);

            //copy control data
            data.branchControl = cloneDeep(branchData.branchControl);

            //update
            let dbOutput = await db.put(TABLE_NAME, data);

            //output
            delete dbOutput.branchControl;
            let output = JSONAPI.makeJSONAPI(this.reqData.paths[3], dbOutput);
            return output;   
        }catch(err) {
            console.log(err);
            throw err;
        }
    }

    async deleteByID() {
        let data = {
            id: this.reqData.params.restaurant_id+this.reqData.params.branch_id
        };

        try {
            let msg = await db.delete(TABLE_NAME, data);
            return msg;
        }catch(err) {
            console.log(err);
            throw err;
        }

    }
}


exports.main = Branches;