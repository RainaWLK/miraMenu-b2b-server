let db = require('./dynamodb.js');
let JSONAPI = require('./jsonapi.js');
let Utils = require('./utils.js');
let Tables = require('./table.js');
let Image = require('./image.js');
let I18n = require('./i18n.js');
let _ = require('lodash');
//import { cloneDeep } from 'lodash';
let S3 = require('./s3');

const TABLE_NAME = "Branches";
const RESTAURANT_TABLE_NAME = "Restaurants";

const TYPE_NAME = "branches";

const PHOTO_TMP_TABLE_NAME = "photo_tmp";


function BranchControl() {
    //contructor() {
        //this.branchesMaxID = "0";
        //this.branch_ids = [];
        this.restaurant_id = "0";
        this.branch_id = "s0";
        this.tablesMaxID = "t000";
        this.menusMaxID = "m000";
        this.itemsMaxID = "i000";
        this.photoMaxID = "p000";
        //this.table_ids = [];
    //}
}

let i18nSchema = {
    "name": "",
    "desc": "",
    "category": "",
    "details": "",
    "special_event": [""]
}

class Branches {
    constructor(reqData){
        this.reqData = reqData;

        //id array
        this.branch_fullID = this.reqData.params.restaurant_id;
        if(typeof this.reqData.params.branch_id === 'string'){
            this.branch_fullID += this.reqData.params.branch_id;
        }
        this.idArray = Utils.parseID(this.branch_fullID);

        //lang
        if(typeof reqData.queryString.lang == 'string'){
            this.lang = reqData.queryString.lang;
        }
    }

    getNewID(restaurantData) {
        let idList = Utils.parseID(restaurantData.restaurantControl.branchesMaxID);

        let maxID = parseInt(idList.s, 16)+1;

        return "s"+maxID.toString();
    }

    getNewPhotoID(controlData){
        if(typeof controlData.photoMaxID == 'undefined'){
            controlData.photoMaxID = "p000";
        }
        
        let idList = Utils.parseID(controlData.photoMaxID);
        let maxID = parseInt(idList.p, 10)+1;

        return "p"+maxID.toString();
    }

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
                },
                ReturnConsumedCapacity: "TOTAL"
            };
            let dataArray = await db.scanDataByFilter(params);
            dataArray.map(obj => {
                obj.photos = Utils.objToArray(obj.photos);
                delete obj.branchControl;

                //table
                let tableArray = [];
                for(let table_id in obj.tables){
                    tableArray.push(table_id);
                }
                obj.tables = tableArray;
            });

            //if empty
            if(dataArray.length == 0){
                let err = new Error("not found");
                err.statusCode = 404;
                throw err;
            }

            return JSONAPI.makeJSONAPI(TYPE_NAME, dataArray);            
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

            data.photos = Utils.objToArray(data.photos);
            delete data.branchControl;
            //table
            let tableArray = [];
            for(let table_id in data.tables){
                tableArray.push(table_id);
            }
            data.tables = tableArray;

            let output = JSONAPI.makeJSONAPI(TYPE_NAME, data);
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
            data.photos = {};
            data.resources = {};
            data.i18n = {};

            data.id = control.restaurant_id+control.branch_id;

            //table
            let tableFunc = new Tables.main(this.reqData);
            let tableObj = {};
            let tableArray = [];
            for(let i in data.tables){
                let tableData = data.tables[i];

                let table_id = tableFunc.getNewID(data);
                if(typeof tableData.id != 'undefined'){
                    delete tableData.id;
                }
                tableObj[table_id] = tableData;

                tableArray.push(id);
                data.branchControl.tablesMaxID = table_id;
            }
            data.tables = tableObj;

            await db.post(TABLE_NAME, data);

            //update restaurant
            restaurantData.restaurantControl.branchesMaxID = branch_id;
            restaurantData.restaurantControl.branch_ids.push(branch_id);
            await db.put(RESTAURANT_TABLE_NAME, restaurantData);

            //output
            data.tables = tableArray;
            data.photos = Utils.objToArray(data.photos);
            delete data.branchControl;
            let output = JSONAPI.makeJSONAPI(TYPE_NAME, data);
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
            data.branchControl = _.cloneDeep(branchData.branchControl);

            //copy photo data
            data.photos = _.cloneDeep(branchData.photos);
        
            //copy resources data
            data.resources = _.cloneDeep(branchData.resources);

            //copy table data
            data.tables = _.cloneDeep(branchData.tables);

            //update
            let dbOutput = await db.put(TABLE_NAME, data);

            //output
            let tableArray = [];
            for(let table_id in dbOutput.tables){
                tableArray.push(table_id);
            }
            dbOutput.tables = tableArray;
            dbOutput.photos = Utils.objToArray(dbOutput.photos);
            delete dbOutput.branchControl;
            let output = JSONAPI.makeJSONAPI(TYPE_NAME, dbOutput);
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


  async getPhotoInfo() {
    let branch_id = this.reqData.params.restaurant_id+this.reqData.params.branch_id;
    let branchData = await db.queryById(TABLE_NAME, branch_id);

    //output
    let dataArray = [];

    let makePhotoArray = function(source, dest, branch_id){
        for(let photo_id in source.photos){
          let photoData = source.photos[photo_id];
          photoData.id = branch_id+photo_id;
          dest.push(photoData);
        }
        return;
    }

    makePhotoArray(branchData, dataArray, branch_id);

    //if empty
    if(dataArray.length == 0){
        let err = new Error("not found");
        err.statusCode = 404;
        throw err;
    }

    return JSONAPI.makeJSONAPI(TYPE_NAME, dataArray);
  }

  async getPhotoInfoByID() {
    try {
      let branch_id = this.reqData.params.restaurant_id+this.reqData.params.branch_id;
      let branchData = await db.queryById(TABLE_NAME, branch_id);

      let photo_id = this.reqData.params.photo_id;
      let photoData = branchData.photos[photo_id];

      if(typeof photoData == 'undefined'){
          let err = new Error("not found");
          err.statusCode = 404;
          throw err;
      }

      //output
      photoData.id = branch_id+photo_id;
    　let output = JSONAPI.makeJSONAPI("photos", photoData);

      return output;
    }catch(err) {
      throw err;
    }
  }

  async addPhoto(payload) {
    try {
      let branch_id = this.reqData.params.restaurant_id+this.reqData.params.branch_id;
      let branchData = await db.queryById(TABLE_NAME, branch_id);

      let inputData = JSONAPI.parseJSONAPI(payload);
      delete inputData.id;
      console.log(inputData);


      let photo_id = this.getNewPhotoID(branchData.branchControl);
      console.log(photo_id);
      let path = Utils.makePath(this.idArray);
      console.log(path);

      let file_name = `${path}/photos/${photo_id}.jpg`;
      console.log("file_name="+file_name);
      branchData.branchControl.photoMaxID = photo_id;
      console.log("branchData=");
      console.log(branchData);

      //sign
      let signedData = await S3.getPresignedURL(file_name, inputData.mimetype);
      console.log(signedData);

      //update db
      inputData.id = Utils.makeFullID(this.idArray) + photo_id;
      inputData.ttl = Math.floor(Date.now() / 1000) + 600;  //expire after 10min
      console.log(inputData);
      let dbOutput = await db.put(PHOTO_TMP_TABLE_NAME, inputData);
      console.log(dbOutput);

      let dbOutput2 = await db.put(TABLE_NAME, branchData);

      //output
      let outputBuf = {
        "id": inputData.id,
        "mimetype": inputData.mimetype,
        "filename": file_name,
        "signedrequest": signedData.signedRequest,
        "url": {
          "original": signedData.url
        }
      };

    　let output = JSONAPI.makeJSONAPI("photos", outputBuf);

      return output;
    }catch(err) {
      console.log(err);
      throw err;
    }
  }

  async updatePhotoInfo(payload) {
    try {
      let branch_id = this.reqData.params.restaurant_id+this.reqData.params.branch_id;
      let branchData = await db.queryById(TABLE_NAME, branch_id);
      let photo_id = this.reqData.params.photo_id;
      let photoData = branchData.photos[photo_id];
      if(typeof photoData == 'undefined'){
          let err = new Error("not found");
          err.statusCode = 404;
          throw err;
      }

      //update
      let data = JSONAPI.parseJSONAPI(payload);
      delete data.id;

      data.url = photoData.url;
      branchData.photos[photo_id] = data;

      //write back
      let dbOutput = await db.put(TABLE_NAME, branchData);

      //output
      let outputBuf = dbOutput.photos[photo_id];
      outputBuf.id = branch_id+photo_id;
      let output = JSONAPI.makeJSONAPI(TYPE_NAME, outputBuf);
      return output;
    }catch(err) {
        throw err;
    }
  }

  async deletePhoto() {
    try {
      let branch_id = this.reqData.params.restaurant_id+this.reqData.params.branch_id;
      let branchData = await db.queryById(TABLE_NAME, branch_id);
      let photo_id = this.reqData.params.photo_id;

      if(typeof branchData.photos[photo_id] == 'undefined'){
          let err = new Error("not found");
          err.statusCode = 404;
          throw err;
      }

      //delete
      await Image.deletePhotos(branchData.photos[photo_id].url);
      delete branchData.photos[photo_id];
      //let file_name = photo_id + ".jpg";
      //let path = Utils.makePath(this.idArray);
      //let msg = await S3.deleteS3Obj(path + "/" + file_name);

      //delete branchData.photos[photo_id];

      //write back
      let dbOutput = await db.put(TABLE_NAME, branchData);

      return dbOutput;
    }catch(err) {
        throw err;
    }
  }

}


exports.main = Branches;