let db = require('./dynamodb.js');
let JSONAPI = require('./jsonapi.js');
let Utils = require('./utils.js');
import { cloneDeep } from 'lodash';
import { sprintf } from 'sprintf-js';
let S3 = require('./s3');

const BRANCH_TABLE_NAME = "Branches";
const RESTAURANT_TABLE_NAME = "Restaurants";
const TABLE_NAME = "Menus";

const TYPE_NAME = "items";

const PHOTO_TMP_TABLE_NAME = "photo_tmp";

function ItemControl() {
  this.photoMaxID = "p000";
}

class Items {
  constructor(reqData){
      this.reqData = reqData;

      //store restaurant var
      this.restaurantTable = RESTAURANT_TABLE_NAME;

      this.branchQuery = false;
      if(typeof this.reqData.params.branch_id != 'undefined'){
        this.branchQuery = true;
      }

      //parse request
      this.controlName = "restaurantControl";
      this.branch_fullID = this.reqData.params.restaurant_id;
      this.branchTable = RESTAURANT_TABLE_NAME;

      if(this.branchQuery){
          this.branch_fullID = this.reqData.params.restaurant_id + this.reqData.params.branch_id;
          this.branchTable = BRANCH_TABLE_NAME;
          this.controlName = "branchControl";
      }

      //id array
      let id = this.branch_fullID;
      if(typeof this.reqData.params.item_id != 'undefined'){
        id += this.reqData.params.item_id;
      }
      this.idArray = Utils.parseID(id);
      console.log(this.idArray);
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

  getNewPhotoID(controlData){
    if(typeof controlData.photoMaxID == 'undefined'){
      controlData.photoMaxID = "p000";
    }
    
    let idList = Utils.parseID(controlData.photoMaxID);
    let maxID = parseInt(idList.p, 10)+1;

    return "p"+maxID.toString();
  }

  async getMenusData(){
    let restaurantMenusData = await db.queryById(TABLE_NAME, this.reqData.params.restaurant_id);
    let menusData = restaurantMenusData;

    if(this.branchQuery){
      let branchMenusData = await db.queryById(TABLE_NAME, this.branch_fullID);

      //merge
      for(let id in branchMenusData.menus){
        menusData.menus[id] = branchMenusData.menus[id];
      }
      for(let id in branchMenusData.items){
        menusData.items[id] = branchMenusData.items[id];
      }
    }
    console.log(menusData);

    return menusData;
  }

  output(data, fullID){
    data.id = fullID;
    data.photos = Utils.objToArray(data.photos);
    delete data.itemControl;

    return data;
  }

  async get() {
    let dbMenusData = await this.getMenusData();
    let itemData = dbMenusData.items;

    //output
    let dataArray = [];
    
    for(let item_id in itemData) {
        console.log(item_id);

        let output = this.output(itemData[item_id], item_id);

        dataArray.push(output);
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
        let dbMenusData = await this.getMenusData();
        let itemData = dbMenusData.items;
        let fullID = this.branch_fullID + this.reqData.params.item_id;

        let data = itemData[fullID];
        if(typeof data == 'undefined'){
            let err = new Error("not found");
            err.statusCode = 404;
            throw err;
        }

        let output = this.output(data, fullID);
        return JSONAPI.makeJSONAPI(TYPE_NAME, output);
      }catch(err) {
          throw err;
      }
  }

  async create(payload) {
      let inputData = JSONAPI.parseJSONAPI(payload);

      try{
          let branchData = await db.queryById(this.branchTable, this.branch_fullID);   //get branch data    
          let item_id = this.getNewID(branchData[this.controlName]);
          let fullID = this.branch_fullID + item_id;          

          let dbMenusData = await this.getMenusData();          

          let menusData;
          //let createNew = false;
          try {
              menusData = await db.queryById(TABLE_NAME, this.branch_fullID);
              //createNew = true;
          }
          catch(err){
              //console.log("createNew");
              //init
              menusData = {
                  "id": this.branch_fullID,
                  "menus": {},
                  "items": {}
              } 
              //console.log(menusData);
          }

          let control = new ItemControl();
          inputData.itemControl = JSON.parse(JSON.stringify(control));   //bug
          inputData.photos = {};
          menusData.items[fullID] = inputData; 
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
        let output = this.output(menusData.items[fullID], fullID);
        return JSONAPI.makeJSONAPI(TYPE_NAME, output);
      }
      catch(err) {
          console.log(err);
          throw err;
      }

  }

  async updateByID(payload) {
      try{
        let menusData = await db.queryById(TABLE_NAME, this.branch_fullID);
        let fullID = this.branch_fullID + this.reqData.params.item_id;

        //check item existed
        if(typeof menusData.items[fullID] == 'undefined'){
            let err = new Error("not found");
            err.statusCode = 404;
            throw err;
        }

        let data = JSONAPI.parseJSONAPI(payload);
        delete data.id;
        data.itemControl = cloneDeep(menusData.items[fullID].itemControl);

        //copy photo data
        data.photos = cloneDeep(menusData.items[fullID].photos);

        menusData.items[fullID] = data;

        let dbOutput = await db.put(TABLE_NAME, menusData);

        //output
        let output = this.output(dbOutput.items[fullID], fullID);
        return JSONAPI.makeJSONAPI(TYPE_NAME, output);
      }
      catch(err) {
          throw err;
      }
  }

  async deleteByID() {
      try{
          let menusData = await db.queryById(TABLE_NAME, this.branch_fullID);
          let fullID = this.branch_fullID + this.reqData.params.item_id;          

          if(typeof menusData.items[fullID] == 'undefined'){
              let err = new Error("not found");
              err.statusCode = 404;
              throw err;
          }
          delete menusData.items[fullID];
          //bug: must delete all photos in s3

          let msg = await db.put(TABLE_NAME, menusData);
          return msg;
      }
      catch(err) {
          throw err;
      }
  }

  async getPhotoInfo() {
    let dbMenusData = await this.getMenusData();
    let fullID = this.branch_fullID + this.reqData.params.item_id;
    let itemData = dbMenusData.items[fullID];

    if(typeof itemData == 'undefined'){
      let err = new Error("not found");
      err.statusCode = 404;
      throw err;
    }

    //output
    let dataArray = [];

    let makePhotoArray = function(source, dest, item_fullID){
        for(let photo_id in source.photos){
          let photoData = source.photos[photo_id];
          photoData.id = item_fullID+photo_id;
          dest.push(photoData);
        }
        return;
    }

    makePhotoArray(itemData, dataArray, fullID);

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
      let dbMenusData = await this.getMenusData();
      let fullID = this.branch_fullID + this.reqData.params.item_id;
      let itemData = dbMenusData.items[fullID];

      if(typeof itemData == 'undefined'){
          let err = new Error("not found");
          err.statusCode = 404;
          throw err;
      }

      let photo_id = this.reqData.params.photo_id;
      let photoData = itemData.photos[photo_id];

      if(typeof photoData == 'undefined'){
          let err = new Error("not found");
          err.statusCode = 404;
          throw err;
      }

      //output
      photoData.id = fullID+photo_id;
    　let output = JSONAPI.makeJSONAPI("photos", photoData);

      return output;
    }catch(err) {
      throw err;
    }
  }

  async addPhoto(payload) {
    try {
      let fullID = this.branch_fullID + this.reqData.params.item_id;      

      let menusData = await db.queryById(TABLE_NAME, this.branch_fullID);
      //let item_id = this.reqData.params.item_id;
      let itemData = menusData.items[fullID];

      //check item existed
      if(typeof itemData == 'undefined'){
          let err = new Error("not found");
          err.statusCode = 404;
          throw err;
      }


      let inputData = JSONAPI.parseJSONAPI(payload);
      delete inputData.id;
      console.log(inputData);
      
      //migration
      if(typeof itemData.itemControl == 'undefined'){
        let control = new ItemControl();
        itemData.itemControl = JSON.parse(JSON.stringify(control));   //bug
      }

      let photo_id = this.getNewPhotoID(itemData.itemControl);
      let path = Utils.makePath(this.idArray);

      let file_name = `${path}/${photo_id}.jpg`;
      console.log("file_name="+file_name);
      itemData.itemControl.photoMaxID = photo_id;
      console.log("itemData=");
      console.log(itemData);

      //sign
      let signedData = await S3.getPresignedURL(file_name, inputData.mimetype);
      console.log(signedData);

      //update db
      inputData.id = Utils.makeFullID(this.idArray) + photo_id;
      inputData.ttl = Math.floor(Date.now() / 1000) + 600;  //expire after 10min
      console.log(inputData);
      let dbOutput = await db.put(PHOTO_TMP_TABLE_NAME, inputData);
      console.log(dbOutput);

      menusData.items[fullID] = itemData;
      let dbOutput2 = await db.put(TABLE_NAME, menusData);

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
      //get photo data
      let menusData = await db.queryById(TABLE_NAME, this.branch_fullID);
      //let item_id = this.reqData.params.item_id;
      let fullID = this.branch_fullID + this.reqData.params.item_id;

      let itemData = menusData.items[fullID];
      if(typeof itemData == 'undefined'){
          let err = new Error("not found");
          err.statusCode = 404;
          throw err;
      }
      let photo_id = this.reqData.params.photo_id;
      let photoData = itemData.photos[photo_id];
      if(typeof photoData == 'undefined'){
          let err = new Error("not found");
          err.statusCode = 404;
          throw err;
      }

      //update
      let data = JSONAPI.parseJSONAPI(payload);
      delete data.id;

      data.url = photoData.url;
      itemData.photos[photo_id] = data;

      //write back
      menusData.items[fullID] = itemData;
      let dbOutput = await db.put(TABLE_NAME, menusData);

      //output
      let outputBuf = dbOutput.items[fullID].photos[photo_id];
      outputBuf.id = fullID+photo_id;
      let output = JSONAPI.makeJSONAPI(TYPE_NAME, outputBuf);
      return output;
    }catch(err) {
        throw err;
    }
  }

  async deletePhoto() {
    try {
      //get photo data
      let menusData = await db.queryById(TABLE_NAME, this.branch_fullID);
      let fullID = this.branch_fullID + this.reqData.params.item_id;

      let itemData = menusData.items[fullID];
      if(typeof itemData == 'undefined'){
          let err = new Error("not found");
          err.statusCode = 404;
          throw err;
      }
      let photo_id = this.reqData.params.photo_id;

      //delete
      let file_name = photo_id + ".jpg";
      if(typeof itemData.photos[photo_id] == 'undefined'){
          let err = new Error("not found");
          err.statusCode = 404;
          throw err;
      }
      let path = Utils.makePath(this.idArray);
      let msg = await S3.deleteS3Obj(path + "/" + file_name);

      delete itemData.photos[photo_id];

      //write back
      menusData.items[fullID] = itemData;
      let dbOutput = await db.put(TABLE_NAME, menusData);

      return dbOutput;
    }catch(err) {
        throw err;
    }
  }
}

exports.main = Items;
