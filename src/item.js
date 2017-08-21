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

      //id array
      let id = this.branchID;
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
          delete data.itemControl;
          data.photos = Utils.objToArray(data.photos);
          dataArray.push(data);
      }

      for(let item_id in branchItemData) {
          let data = branchItemData[item_id];
          data.id = this.branchID+item_id;
          delete data.itemControl;
          data.photos = Utils.objToArray(data.photos);
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
          delete data.itemControl;
          data.photos = Utils.objToArray(data.photos);

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

          let control = new ItemControl();
          inputData.itemControl = JSON.parse(JSON.stringify(control));   //bug
          inputData.photos = {};
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
          outputBuf.photos = Utils.objToArray(outputBuf.photos);
          delete outputBuf.itemControl;
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
          data.itemControl = cloneDeep(menusData.items[item_id].itemControl);

          //copy photo data
          data.photos = cloneDeep(menusData.items[item_id].photos);

          menusData.items[item_id] = data;

          let dbOutput = await db.put(TABLE_NAME, menusData);

          //output
          let outputBuf = dbOutput.items[item_id];
          outputBuf.id = this.branchID+item_id;
          outputBuf.photos = Utils.objToArray(outputBuf.photos);
          delete outputBuf.itemControl;
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
          //bug: must delete all photos in s3

          let msg = await db.put(TABLE_NAME, menusData);
          return msg;
      }
      catch(err) {
          throw err;
      }
  }

  async getPhotoInfo() {
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

    let makePhotoArray = function(source, dest, branchID, item_id){
        for(let photo_id in source.photos){
          let photoData = source.photos[photo_id];
          photoData.id = branchID+item_id+photo_id;
          dest.push(photoData);
        }
        return;
    }
    
    for(let item_id in restaurantItemData) {
      let data = restaurantItemData[item_id];
      makePhotoArray(data, dataArray, this.branchID, item_id);
    }

    for(let item_id in branchItemData) {
      let data = branchItemData[item_id];
      makePhotoArray(data, dataArray, this.branchID, item_id);
    }

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
      let menusData = await db.queryById(TABLE_NAME, this.branchID);

      let itemData = menusData.items[this.reqData.params.item_id];
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
      photoData.id = this.branchID+this.reqData.params.item_id+photo_id;
    　let output = JSONAPI.makeJSONAPI("photos", photoData);

      return output;
    }catch(err) {
      throw err;
    }
  }

  async addPhoto(payload) {
    try {
      let menusData = await db.queryById(TABLE_NAME, this.branchID);
      let item_id = this.reqData.params.item_id;
      let itemData = menusData.items[item_id];

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

      menusData.items[item_id] = itemData;
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
      let menusData = await db.queryById(TABLE_NAME, this.branchID);
      let item_id = this.reqData.params.item_id;

      let itemData = menusData.items[item_id];
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
      menusData.items[item_id] = itemData;
      let dbOutput = await db.put(TABLE_NAME, menusData);

      //output
      let outputBuf = dbOutput.items[item_id].photos[photo_id];
      outputBuf.id = this.branchID+item_id+photo_id;
      let output = JSONAPI.makeJSONAPI(TYPE_NAME, outputBuf);
      return output;
    }catch(err) {
        throw err;
    }
  }

  async deletePhoto() {
    try {
      //get photo data
      let menusData = await db.queryById(TABLE_NAME, this.branchID);
      let item_id = this.reqData.params.item_id;

      let itemData = menusData.items[item_id];
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
      menusData.items[item_id] = itemData;
      let dbOutput = await db.put(TABLE_NAME, menusData);

      return dbOutput;
    }catch(err) {
        throw err;
    }
  }
}

exports.main = Items;
