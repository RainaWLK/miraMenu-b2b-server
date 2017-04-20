let db = require('./dynamodb.js');
let JSONAPI = require('./jsonapi.js');
import Control from './control.js';
import { cloneDeep } from 'lodash';
import { sprintf } from 'sprintf-js';

const TABLE_NAME = "Branches";
const RESTAURANT_TABLE_NAME = "Restaurants";

/*function TableControl() {
    //contructor() {
        //this.branchesMaxID = "0";
        //this.branch_ids = [];
        this.restaurant_id = "0";
        this.branch_id = "0";
        this.table_id = "0";
    //}
}*/

class Tables {
    constructor(reqData){
        this.reqData = reqData;
    }

    getNewID(branchData) {  //format: t001
        console.log('==getNew table ID==');

        //migration
        if(typeof branchData.branchControl.tablesMaxID == 'undefined'){
            branchData.branchControl.tablesMaxID = "t001";
            //branchData.branchControl.table_ids = [];
        }

        let tableNumID = branchData.branchControl.tablesMaxID.slice(1);
        let maxID = sprintf("t%03d", parseInt(tableNumID, 16) + 1);
        console.log(maxID);
        return maxID;
    }

    async get() {
        try {
            //scan table Restaurant (bug: must merged into dynamodb.js)
            let branchFullID = this.reqData.params.restaurant_id + this.reqData.params.branch_id;
            let branchData = await db.queryById(TABLE_NAME, branchFullID);

            let dataArray = [];
            for(let table_id in branchData.tables){
                let data = branchData.tables[table_id];
                data.id = table_id;
                dataArray.push(data);
            }

            /*dataArray.map(obj => {
                delete obj.branchControl;
            });*/
            return JSONAPI.makeJSONAPI(this.reqData.paths[5], dataArray);            
        }catch(err) {
            console.log("==branch get err!!==");
            console.log(err);
            throw err;
        }
    }

    async getByID() {
        try {
            let branchFullID = this.reqData.params.restaurant_id + this.reqData.params.branch_id;
            let branchData = await db.queryById(TABLE_NAME, branchFullID);

            let data = branchData.tables[this.reqData.params.table_id];
            data.id = this.reqData.params.table_id;

            let output = JSONAPI.makeJSONAPI(this.reqData.paths[5], data);
            return output;
        }catch(err) {
            throw err;
        }
    }

    async create(payload) {
        try{
            let branchFullID = this.reqData.params.restaurant_id + this.reqData.params.branch_id;
            let branchData = await db.queryById(TABLE_NAME, branchFullID);

            let data = JSONAPI.parseJSONAPI(payload);
            let table_id = this.getNewID(branchData);
            console.log(table_id);
            //data.id = table_id;
            //migration
            if(typeof branchData.tables == 'undefined'){
                branchData.tables = {};
            }

            branchData.tables[table_id] = data;

            //branchData.branchControl.table_ids.push(table_id);
            branchData.branchControl.tablesMaxID = table_id;

            let msg = await db.put(TABLE_NAME, branchData);
            return msg;
        }
        catch(err) {
            throw err;
        }

    }

    async updateByID(payload) {
        try{
            let branchFullID = this.reqData.params.restaurant_id + this.reqData.params.branch_id;
            let branchData = await db.queryById(TABLE_NAME, branchFullID);

            let data = JSONAPI.parseJSONAPI(payload);
            delete data.id;

            branchData.tables[this.reqData.params.table_id] = data;

            let msg = await db.put(TABLE_NAME, branchData);
            return msg;
        }
        catch(err) {
            throw err;
        }
    }

    async deleteByID() {
        try{
            let branchFullID = this.reqData.params.restaurant_id + this.reqData.params.branch_id;
            let branchData = await db.queryById(TABLE_NAME, branchFullID);

            delete branchData.tables[this.reqData.params.table_id];

            let msg = await db.put(TABLE_NAME, branchData);
            return msg;
        }
        catch(err) {
            throw err;
        }
    }
}


export default Tables;