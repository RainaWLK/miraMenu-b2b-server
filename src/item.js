let db = require('./dynamodb.js');
let JSONAPI = require('./jsonapi.js');
let Utils = require('./utils.js');
let Image = require('./image.js');
let I18n = require('./i18n.js');
let _ = require('lodash');
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

let i18nSchema = {
    "name": "",
    "desc": "",
    "category": "",
    "ingredients": [""],
    "note": [""],
    "photos": [
      {
        "desc": "",
        "title": ""
      }
    ]
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
      this.item_fullID = this.branch_fullID;
      if(typeof this.reqData.params.item_id != 'undefined'){
        this.item_fullID += this.reqData.params.item_id;
      }
      this.idArray = Utils.parseID(this.item_fullID);

      //lang
      if(typeof reqData.queryString.lang == 'string'){
        this.lang = reqData.queryString.lang;
      }
  }

  getNewID() {  //format: i001
    const dateTime = Date.now();
    const timestamp = Math.floor(dateTime);

    return `i${timestamp}`;
  }

  getNewResourceID(type){
    const dateTime = Date.now();
    const timestamp = Math.floor(dateTime);

    return `res-${type}-${timestamp}`;
  }

  async getMenusData(mix){
    let menusData;
    if(mix){
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
    }
    else {
      try {
        menusData = await db.queryById(TABLE_NAME, this.branch_fullID);
      }
      catch(err){
        menusData = {
          "items": {},
          "menus": {}
        };
      }
    }

    return menusData;
  }

  async getItemData(mix){
    try{
      let dbMenusData = await this.getMenusData(mix);
      let itemData = dbMenusData.items[this.item_fullID];

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
    let dbMenusData = await this.getMenusData(true);
    let itemData = dbMenusData.items;

    //output
    let dataArray = [];
    
    for(let item_id in itemData) {
        let data = itemData[item_id];

        let output = this.output(data, item_id);

        dataArray.push(output);
    }
    //translate
    let i18n = new I18n.main(itemData, this.idArray);
    itemData = i18n.translate(this.lang);

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
        /*let dbMenusData = await this.getMenusData(true);
        let itemData = dbMenusData.items;
        let fullID = this.branch_fullID + this.reqData.params.item_id;

        let data = itemData[fullID];
        if(typeof data == 'undefined'){
            let err = new Error("not found");
            err.statusCode = 404;
            throw err;
        }*/
        let itemData = await this.getItemData(true);

        console.log(itemData);
        //translate
        let i18n = new I18n.main(itemData, this.idArray);
        itemData = i18n.translate(this.lang);

        let output = this.output(itemData, this.item_fullID);
        return JSONAPI.makeJSONAPI(TYPE_NAME, output);
      }catch(err) {
          throw err;
      }
  }

  async create(payload) {
      let inputData = JSONAPI.parseJSONAPI(payload);

      try{
        let branchData = await db.queryById(this.branchTable, this.branch_fullID);   //get branch data    
        let item_id = this.getNewID();
        let fullID = this.branch_fullID + item_id;          

        let dbMenusData = await this.getMenusData(true);          

        let menusData;
        try {
            menusData = await db.queryById(TABLE_NAME, this.branch_fullID);
        }
        catch(err){
            //init
            menusData = {
                "id": this.branch_fullID,
                "menus": {},
                "items": {}
            }
        }

        let control = new ItemControl();
        inputData.itemControl = JSON.parse(JSON.stringify(control));   //bug
        inputData.photos = {};
        inputData.resources = {};
        inputData.i18n = {};

        //i18n
        let lang = inputData.language;
        delete inputData.language;
        if(typeof lang == 'undefined'){
          lang = "en-us";
        }
        let i18nUtils = new I18n.main(inputData, this.idArray);
        let makei18n = (schemaData, element, defaultLang) => {
            console.log(schemaData);  
            console.log(element);
            if((typeof element === typeof schemaData)&&(_.isEmpty(element) === false)){
              console.log(element+" match");
              if(typeof element === 'string'){
                let i18nData = { 
                    "default": defaultLang,
                    "data": {}
                };
                i18nData.data[defaultLang] = element;

                let result = i18nUtils.addI18n(i18nData);
                console.log(result);

                let key = result.data.id;
                console.log(key);
                element = "i18n::"+key;
              }
              else if(Array.isArray(element)){
                console.log(element+" array");
                for(let i in element){
                  element[i] = makei18n(schemaData[0], element[i], defaultLang);
                }
              }
              else if(typeof element === 'object'){
                console.log(element+" object");
                for(let i in schemaData){
                  element[i] = makei18n(schemaData[i], element[i], defaultLang);
                }
              }
            }
            console.log(element);
          return element;
        };
        for(let i in i18nSchema){
          inputData[i] = makei18n(i18nSchema[i], inputData[i], lang);
        }

          console.log(inputData);

        menusData.items[fullID] = inputData; 
        let msg = await db.post(TABLE_NAME, menusData);

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
        let itemData = menusData.items[fullID];

        //check item existed
        if(typeof itemData == 'undefined'){
            let err = new Error("not found");
            err.statusCode = 404;
            throw err;
        }
        //let itemData = await this.getItemData(false);

        let inputData = JSONAPI.parseJSONAPI(payload);
        delete inputData.id;
        inputData.itemControl = _.cloneDeep(itemData.itemControl);

        //i18n
        let lang = inputData.language;
        delete inputData.language;
        if(typeof lang == 'undefined'){
          lang = "en-us";
        }
        let i18nUtils = new I18n.main(inputData, this.idArray);
        let makei18n = (schemaData, element, defaultLang) => {
            console.log(schemaData);  
            console.log(element);
            if((typeof element === typeof schemaData)&&(_.isEmpty(element) === false)){
              console.log(element+" match");
              if(typeof element === 'string'){
                let i18nData = { 
                    "default": defaultLang,
                    "data": {}
                };
                i18nData.data[defaultLang] = element;

                let result = i18nUtils.addI18n(i18nData);
                console.log(result);

                let key = result.data.id;
                console.log(key);
                element = "i18n::"+key;
              }
              else if(Array.isArray(element)){
                console.log(element+" array");
                for(let i in element){
                  element[i] = makei18n(schemaData[0], element[i], defaultLang);
                }
              }
              else if(typeof element === 'object'){
                console.log(element+" object");
                for(let i in schemaData){
                  element[i] = makei18n(schemaData[i], element[i], defaultLang);
                }
              }
            }
            console.log(element);
          return element;
        };
        for(let i in i18nSchema){
          inputData[i] = makei18n(i18nSchema[i], inputData[i], lang);
        }

        //copy photo data
        inputData.photos = _.cloneDeep(itemData.photos);
        //copy i18n data
        inputData.i18n = _.cloneDeep(itemData.i18n);
        //copy resources data
        inputData.resources = _.cloneDeep(itemData.resources);

        menusData.items[this.item_fullID] = inputData;

        let dbOutput = await db.put(TABLE_NAME, menusData);

        //output
        let output = this.output(dbOutput.items[this.item_fullID], this.item_fullID);
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
          //let itemData = await this.getItemData(false);
          delete menusData.items[this.item_fullID];
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
    /*let dbMenusData = await this.getMenusData(true);
    let fullID = this.branch_fullID + this.reqData.params.item_id;
    let itemData = dbMenusData.items[fullID];

    if(typeof itemData == 'undefined'){
      let err = new Error("not found");
      err.statusCode = 404;
      throw err;
    }*/
    let itemData = await this.getItemData(true);

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

    makePhotoArray(itemData, dataArray, this.item_fullID);

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
      /*let dbMenusData = await this.getMenusData(true);
      let fullID = this.branch_fullID + this.reqData.params.item_id;
      let itemData = dbMenusData.items[fullID];

      if(typeof itemData == 'undefined'){
          let err = new Error("not found");
          err.statusCode = 404;
          throw err;
      }*/
      let itemData = await this.getItemData(true);

      let photo_id = this.reqData.params.photo_id;
      let photoData = itemData.photos[photo_id];

      if(typeof photoData == 'undefined'){
          let err = new Error("not found");
          err.statusCode = 404;
          throw err;
      }

      //output
      photoData.id = this.item_fullID+photo_id;
    　let output = JSONAPI.makeJSONAPI("photos", photoData);

      return output;
    }catch(err) {
      throw err;
    }
  }

  async addPhoto(payload) {
    let output;

    try {
      /*let fullID = this.branch_fullID + this.reqData.params.item_id;      
      let menusData = await db.queryById(TABLE_NAME, this.branch_fullID);
      let itemData = menusData.items[fullID];

      //check item existed
      if(typeof itemData == 'undefined'){
          let err = new Error("not found");
          err.statusCode = 404;
          throw err;
      }*/
      let itemData = await this.getItemData(false);

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
      //let itemData = await this.getItemData(false);

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
      menusData.items[this.item_fullID] = itemData;
      let dbOutput = await db.put(TABLE_NAME, menusData);

      //output
      let outputBuf = dbOutput.items[this.item_fullID].photos[photo_id];
      outputBuf.id = this.item_fullID+photo_id;
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

      let itemData = menusData.items[fullID];
      if(typeof itemData == 'undefined'){
          let err = new Error("not found");
          err.statusCode = 404;
          throw err;
      }
      //let itemData = await this.getItemData(false);
      
      let photo_id = this.reqData.params.photo_id;
      if(typeof itemData.photos[photo_id] == 'undefined'){
          let err = new Error("not found");
          err.statusCode = 404;
          throw err;
      }

      //delete
      await Image.deletePhotos(itemData.photos[photo_id].url);
      delete itemData.photos[photo_id];

      //write back
      menusData.items[this.item_fullID] = itemData;
      let dbOutput = await db.put(TABLE_NAME, menusData);

      return dbOutput;
    }catch(err) {
        throw err;
    }
  }

  async getI18n() {
    try{
      /*let dbMenusData = await this.getMenusData(true);
      let fullID = this.branch_fullID + this.reqData.params.item_id;
      let itemData = dbMenusData.items[fullID];

      if(typeof itemData == 'undefined'){
        let err = new Error("not found");
        err.statusCode = 404;
        throw err;
      }*/
      let itemData = await this.getItemData(true);

      let i18nUtils = new I18n.main(itemData, this.idArray);
      let output = i18nUtils.getI18n(this.item_fullID);
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
      let itemData = await this.getItemData(true);

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
      //let itemData = await this.getItemData(false);
      let inputData = JSONAPI.parseJSONAPI(payload);

      let i18nUtils = new I18n.main(itemData, this.idArray);
      let output = i18nUtils.addI18n(inputData);

      //write into db
      menusData.items[this.item_fullID] = itemData;
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
      //let itemData = await this.getItemData(false);

      let i18nUtils = new I18n.main(itemData, this.idArray);
      let output = i18nUtils.updateI18n(this.reqData.params, inputData);

      //write back
      menusData.items[this.item_fullID] = itemData;
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
      //let itemData = await this.getItemData(false);

      let i18nUtils = new I18n.main(itemData, this.idArray);
      let resultData = i18nUtils.deleteI18n(this.reqData.params);


      //write back
      menusData.items[this.item_fullID] = resultData;
      let dbOutput = await db.put(TABLE_NAME, menusData);

      return dbOutput;
    }catch(err) {
        throw err;
    }
  }

  async getResources() {
    /*let dbMenusData = await this.getMenusData(true);
    let fullID = this.branch_fullID + this.reqData.params.item_id;
    let itemData = dbMenusData.items[fullID];

    if(typeof itemData == 'undefined'){
      let err = new Error("not found");
      err.statusCode = 404;
      throw err;
    }*/
    let itemData = await this.getItemData(true);

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

    makeResourceArray(itemData, dataArray, this.item_fullID);

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
      /*let dbMenusData = await this.getMenusData(true);
      let fullID = this.branch_fullID + this.reqData.params.item_id;
      let itemData = dbMenusData.items[fullID];

      if(typeof itemData == 'undefined'){
          let err = new Error("not found");
          err.statusCode = 404;
          throw err;
      }*/
      let itemData = await this.getItemData(true);

      let resource_id = this.reqData.params.resource_id;
      let resourceData = itemData.resources[resource_id];

      if(typeof resourceData == 'undefined'){
          let err = new Error("not found");
          err.statusCode = 404;
          throw err;
      }

      //output
      resourceData.id = this.item_fullID+resource_id;
    　let output = JSONAPI.makeJSONAPI("resources", resourceData);

      return output;
    }catch(err) {
      throw err;
    }
  }

  async addResource(payload) {
    let output;
    let mimetype = "application/octet-stream";
    
    try {
      /*let fullID = this.branch_fullID + this.reqData.params.item_id;
      let menusData = await db.queryById(TABLE_NAME, this.branch_fullID);
      let itemData = menusData.items[fullID];

      //check item existed
      if(typeof itemData == 'undefined'){
          let err = new Error("not found");
          err.statusCode = 404;
          throw err;
      }*/
      let itemData = await this.getItemData(false);

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

      let itemData = menusData.items[fullID];
      if(typeof itemData == 'undefined'){
          let err = new Error("not found");
          err.statusCode = 404;
          throw err;
      }
      //let itemData = await this.getItemData(false);

      let resource_id = this.reqData.params.resource_id;
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
      menusData.items[this.item_fullID] = itemData;
      let dbOutput = await db.put(TABLE_NAME, menusData);

      return dbOutput;
    }catch(err) {
        throw err;
    }
  }

}



exports.main = Items;
