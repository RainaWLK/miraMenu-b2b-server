let db = require('./dynamodb.js');
let JSONAPI = require('./jsonapi.js');
let Utils = require('./utils.js');
let Image = require('./image.js');
let I18n = require('./i18n.js');
import { cloneDeep } from 'lodash';
import { sprintf } from 'sprintf-js';
let S3 = require('./s3');

const BRANCH_TABLE_NAME = "Branches";
const RESTAURANT_TABLE_NAME = "Restaurants";
const TABLE_NAME = "Menus";

const TYPE_NAME = "items";

const RESOURCE_TYPE_NAME = "resources";

const PHOTO_TMP_TABLE_NAME = "photo_tmp";

function ItemControl() {
  //this.photoMaxID = "p000";
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

      //lang
      if(typeof reqData.queryString.lang == 'string'){
        this.lang = reqData.queryString.lang;
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

  getNewResourceID(type){
    const dateTime = Date.now();
    const timestamp = Math.floor(dateTime);

    return `res-${type}-${timestamp}`;
  }

  async getMenusData(){
    let menusData;
    try {
      let restaurantMenusData = await db.queryById(TABLE_NAME, this.reqData.params.restaurant_id);
      menusData = restaurantMenusData;
    }
    catch(err){
      menusData = {
        "items": {},
        "menus": {}
      };
    }

    if(this.branchQuery){
      try {
        let branchMenusData = await db.queryById(TABLE_NAME, this.branch_fullID);
        //merge
        for(let id in branchMenusData.menus){
          menusData.menus[id] = branchMenusData.menus[id];
        }
        for(let id in branchMenusData.items){
          menusData.items[id] = branchMenusData.items[id];
        }
      }
      catch(err) {

      }
    }

    return menusData;
  }

  async getItemData(){
    try{
      let dbMenusData = await this.getMenusData();
      let fullID = this.branch_fullID + this.reqData.params.item_id;
      let itemData = dbMenusData.items[fullID];

      if(typeof itemData == 'undefined'){
        let err = new Error("not found");
        err.statusCode = 404;
        throw err;
      }
      return itemData;
    }
    catch(err){
      throw err;
    }
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
        let data = itemData[item_id];

        //translate
        let rc = new I18n.main(data, this.idArray);
        let header = "i18n::";
        for(let i in data){
          if((typeof data[i] == 'string')&&(data[i].indexOf(header) == 0)){
            let key = data[i].substring(header.length);
            console.log(key);
            if(key.indexOf('res-i18n-') == 0){
              let value = rc.getLang(this.lang, key);
              console.log(value);
    
              data[i] = value;
            }
          }
        }

        let output = this.output(data, item_id);

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

        console.log(data);
        //translate
        let rc = new I18n.main(data, this.idArray);
        let header = "i18n::";
        for(let i in data){
          if((typeof data[i] == 'string')&&(data[i].indexOf(header) == 0)){
            let key = data[i].substring(header.length);
            console.log(key);
            if(key.indexOf('res-i18n-') == 0){
              let value = rc.getLang(this.lang, key);
              console.log(value);
    
              data[i] = value;
            }
          }
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
          inputData.resources = {};
          inputData.i18n = {};
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

        //copy resources data
        data.resources = cloneDeep(menusData.items[fullID].resources);

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
          //bug: must delete all resources in s3

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

    return JSONAPI.makeJSONAPI("photos", dataArray);
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
    let output;

    try {
      let fullID = this.branch_fullID + this.reqData.params.item_id;      
      let menusData = await db.queryById(TABLE_NAME, this.branch_fullID);
      let itemData = menusData.items[fullID];

      //check item existed
      if(typeof itemData == 'undefined'){
          let err = new Error("not found");
          err.statusCode = 404;
          throw err;
      }

      let inputData = JSONAPI.parseJSONAPI(payload);

      let oneDataProcess = async (oneData, arraySeq) => {
        let inputSeq = oneData.seq;
        delete oneData.id;
        let photo_id = Image.getNewPhotoID(arraySeq);
        let path = Utils.makePath(this.idArray);

        let fileext = '.jpg';
        if(oneData.mimetype == 'image/png'){
          fileext = '.png';
        }
 
        let file_name = `${path}/photos/${photo_id}${fileext}`;
        console.log("file_name="+file_name);
  
        //sign
        let signedData = await S3.getPresignedURL(file_name, oneData.mimetype);
        console.log(signedData);
  
        //update db
        oneData.id = Utils.makeFullID(this.idArray) + photo_id;
        oneData.ttl = Math.floor(Date.now() / 1000) + 600;  //expire after 10min
        delete oneData.seq;

        let dbOutput = await db.put(PHOTO_TMP_TABLE_NAME, oneData);
        console.log(dbOutput);

        //output
        let outputBuf = {
          "id": oneData.id,
          "mimetype": oneData.mimetype,
          "filename": file_name,
          "signedrequest": signedData.signedRequest,
          "url": {
            "original": signedData.url
          }
        };
        if(typeof inputSeq != 'undefined'){
          outputBuf.seq = inputSeq;
        }
        return outputBuf;
      }

      let outputBuf;
      if(Array.isArray(inputData)){
        let outputBufArray = [];
        for(let i in inputData){
          outputBuf = await oneDataProcess(inputData[i], i);
          outputBufArray.push(outputBuf);
        }
      　output = JSONAPI.makeJSONAPI("photos", outputBufArray);
      }
      else {
        outputBuf = await oneDataProcess(inputData);
        output = JSONAPI.makeJSONAPI("photos", outputBuf);
      }


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
      let output = JSONAPI.makeJSONAPI("photos", outputBuf);
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
      let photo_id = this.reqData.params.photo_id;

      let itemData = menusData.items[fullID];
      if(typeof itemData == 'undefined'){
          let err = new Error("not found");
          err.statusCode = 404;
          throw err;
      }
      
      if(typeof itemData.photos[photo_id] == 'undefined'){
          let err = new Error("not found");
          err.statusCode = 404;
          throw err;
      }

      //delete
      await Image.deletePhotos(itemData.photos[photo_id].url);
      delete itemData.photos[photo_id];

      //write back
      menusData.items[fullID] = itemData;
      let dbOutput = await db.put(TABLE_NAME, menusData);

      return dbOutput;
    }catch(err) {
        throw err;
    }
  }

  async getI18n() {
    try{
      let dbMenusData = await this.getMenusData();
      let fullID = this.branch_fullID + this.reqData.params.item_id;
      let itemData = dbMenusData.items[fullID];

      if(typeof itemData == 'undefined'){
        let err = new Error("not found");
        err.statusCode = 404;
        throw err;
      }
      //let itemData = await this.getItemData();

      let i18nUtils = new I18n.main(itemData, this.idArray);
      let output = i18nUtils.getI18n(fullID);
      return output;
    }catch(err) {
      throw err;
    }
  }

  async getI18nByID() {
    try {
      /*let dbMenusData = await this.getMenusData();
      let fullID = this.branch_fullID + this.reqData.params.item_id;
      let itemData = dbMenusData.items[fullID];
      if(typeof itemData == 'undefined'){
        let err = new Error("not found");
        err.statusCode = 404;
        throw err;
      }*/
      let itemData = await this.getItemData();

      let i18nUtils = new I18n.main(itemData, this.idArray);
      let output = i18nUtils.getI18nByID(this.reqData.params);
      return output;
    }catch(err) {
      throw err;
    }
  }

  async addI18n(payload) {
    let output;

    try {
      let fullID = this.branch_fullID + this.reqData.params.item_id;
      let menusData = await db.queryById(TABLE_NAME, this.branch_fullID);
      let itemData = menusData.items[fullID];

      //check item existed
      if(typeof itemData == 'undefined'){
          let err = new Error("not found");
          err.statusCode = 404;
          throw err;
      }

      let i18nUtils = new I18n.main(itemData, this.idArray);
      let output = i18nUtils.addI18n(payload);

      //write into db
      menusData.items[fullID] = itemData;
      let dbOutput = await db.put(TABLE_NAME, menusData);

      return output;
    }catch(err) {
      console.log(err);
      throw err;
    }
  }

  async updateI18n(payload) {
    let inputData = JSONAPI.parseJSONAPI(payload);
    delete inputData.id;

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

      let i18nUtils = new I18n.main(itemData, this.idArray);
      let output = i18nUtils.updateI18n(this.reqData.params, payload);

      //write back
      menusData.items[fullID] = itemData;
      let dbOutput = await db.put(TABLE_NAME, menusData);

      return output;
    }catch(err) {
        throw err;
    }
  }

  async deleteI18n() {
    try {
      //get resource data
      let menusData = await db.queryById(TABLE_NAME, this.branch_fullID);
      let fullID = this.branch_fullID + this.reqData.params.item_id;

      let itemData = menusData.items[fullID];
      if(typeof itemData == 'undefined'){
          let err = new Error("not found");
          err.statusCode = 404;
          throw err;
      }

      let i18nUtils = new I18n.main(itemData, this.idArray);
      let resultData = i18nUtils.deleteI18n(this.reqData.params);


      //write back
      menusData.items[fullID] = resultData;
      let dbOutput = await db.put(TABLE_NAME, menusData);

      return dbOutput;
    }catch(err) {
        throw err;
    }
  }

  async getResources() {
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

    let makeResourceArray = function(source, dest, item_fullID){
        for(let resource_id in source.resources){
          let resourceData = source.resources[resource_id];
          resourceData.id = item_fullID+resource_id;
          dest.push(resourceData);
        }
        return;
    }

    makeResourceArray(itemData, dataArray, fullID);

    //if empty
    if(dataArray.length == 0){
        let err = new Error("not found");
        err.statusCode = 404;
        throw err;
    }

    return JSONAPI.makeJSONAPI("resources", dataArray);
  }

  async getResourceByID() {
    try {
      let dbMenusData = await this.getMenusData();
      let fullID = this.branch_fullID + this.reqData.params.item_id;
      let itemData = dbMenusData.items[fullID];

      if(typeof itemData == 'undefined'){
          let err = new Error("not found");
          err.statusCode = 404;
          throw err;
      }

      let resource_id = this.reqData.params.resource_id;
      let resourceData = itemData.resources[resource_id];

      if(typeof resourceData == 'undefined'){
          let err = new Error("not found");
          err.statusCode = 404;
          throw err;
      }

      //output
      resourceData.id = fullID+resource_id;
    　let output = JSONAPI.makeJSONAPI("resources", resourceData);

      return output;
    }catch(err) {
      throw err;
    }
  }
  /*{
    "data": {
      "type": "resources",
      "attributes": [
        {
          "type": "language",
          "default": "zh-tw",
          "data": {
            "en-us": "apple",
            "zh-tw": "蘋果",
            "jp": "りんご"
          }
        }
      ]
    }
  }*/
  async addResource(payload) {
    let output;
    let mimetype = "application/octet-stream";
    
    try {
      let fullID = this.branch_fullID + this.reqData.params.item_id;
      let menusData = await db.queryById(TABLE_NAME, this.branch_fullID);
      let itemData = menusData.items[fullID];

      //check item existed
      if(typeof itemData == 'undefined'){
          let err = new Error("not found");
          err.statusCode = 404;
          throw err;
      }

      let inputData = JSONAPI.parseJSONAPI(payload);

      let oneDataProcess = async (oneData, arraySeq) => {
        let inputSeq = oneData.seq;
        delete oneData.id;
        let resource_id = this.getNewResourceID(oneData.type, arraySeq);
        let path = Utils.makePath(this.idArray);
        let outputBuf;
  
        if(oneData.type == 'file'){
          let fileext = "";
          if((typeof oneData.fileext == 'string') && (oneData.fileext !== "")){
            fileext = '.'+oneData.fileext;
          }
          delete oneData.fileext;
  
          let file_name = `${path}/resources/${resource_id}${fileext}`;
          console.log("file_name="+file_name);
  
          //sign
          let signedData = await S3.getPresignedURL(file_name, mimetype);
          console.log(signedData);
    
          //update db
          oneData.id = Utils.makeFullID(this.idArray) + resource_id;
          oneData.ttl = Math.floor(Date.now() / 1000) + 600;  //expire after 10min
          delete oneData.seq;
  
          let dbOutput = await db.put(PHOTO_TMP_TABLE_NAME, oneData);
          console.log(dbOutput);
  
          //output
          outputBuf = {
            "id": oneData.id,
            "mimetype": mimetype,
            "filename": file_name,
            "signedrequest": signedData.signedRequest,
            "url": signedData.url
          };
          if(typeof inputSeq != 'undefined'){
            outputBuf.seq = inputSeq;
          }
        }

        return outputBuf;
      }

      let outputBuf;
      if(Array.isArray(inputData)){
        let outputBufArray = [];
        for(let i in inputData){
          outputBuf = await oneDataProcess(inputData[i], i);
          outputBufArray.push(outputBuf);
        }
        output = JSONAPI.makeJSONAPI("resources", outputBufArray);
      }
      else {
        outputBuf = await oneDataProcess(inputData);
        output = JSONAPI.makeJSONAPI("resources", outputBuf);
      }

      return output;
    }catch(err) {
      console.log(err);
      throw err;
    }
  }

  async deleteResource() {
    try {
      //get resource data
      let menusData = await db.queryById(TABLE_NAME, this.branch_fullID);
      let fullID = this.branch_fullID + this.reqData.params.item_id;
      let resource_id = this.reqData.params.resource_id;

      let itemData = menusData.items[fullID];
      if(typeof itemData == 'undefined'){
          let err = new Error("not found");
          err.statusCode = 404;
          throw err;
      }
      if(typeof itemData.resources[resource_id] == 'undefined'){
        let err = new Error("not found");
        err.statusCode = 404;
        throw err;
      }

      //delete
      if(itemData.resources[resource_id].type == 'file'){
        let msg = await S3.deleteS3Obj(S3.urlToPath(itemData.resources[resource_id].url));
      }
      delete itemData.resources[resource_id];

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
