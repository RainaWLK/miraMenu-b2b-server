let db = require('./dynamodb.js');
let JSONAPI = require('./jsonapi.js');
let Utils = require('./utils.js');
let Image = require('./image.js');
let I18n = require('./i18n.js');
let _ = require('lodash');
//import { sprintf } from 'sprintf-js';
let S3 = require('./s3');

const BRANCH_TABLE_NAME = "Branches";
const RESTAURANT_TABLE_NAME = "Restaurants";
const TABLE_NAME = "Menus";

const TYPE_NAME = "menus";

const RESOURCE_TYPE_NAME = "resources";

const PHOTO_TMP_TABLE_NAME = "photo_tmp";

function MenuControl() {
//  this.photoMaxID = "p000";
}

let i18nSchema = {
  "name": "",
  "menu_desc": "",
  "menu_cat": "",
}


class Menus {
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
    this.menu_fullID = this.branch_fullID;
    if(typeof this.reqData.params.menu_id != 'undefined'){
      this.menu_fullID += this.reqData.params.menu_id;
    }
    this.idArray = Utils.parseID(this.menu_fullID);

    //lang
    if(typeof reqData.queryString.lang == 'string'){
      this.lang = reqData.queryString.lang;
    }
  }

  getNewID() {  //format: m001
    const dateTime = Date.now();
    const timestamp = Math.floor(dateTime);

    return `m${timestamp}`;
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

  async getMenuData(mix){
    try{
      let dbMenusData = await this.getMenusData(mix);
      let menuData = dbMenusData.menus[this.menu_fullID];

      if(typeof menuData == 'undefined'){
        let err = new Error("not found");
        err.statusCode = 404;
        throw err;
      }
      return menuData;
    }
    catch(err){
      throw err;
    }
  }

  output(data, fullID){
    data.id = fullID;
    data.photos = Utils.objToArray(data.photos);
    delete data.menuControl;

    return data;
  }

  checkItemExisted(inputItems, dbMenusData_items){
    console.log(inputItems);
    console.log(dbMenusData_items);
    let validItems = [];

    if(Array.isArray(inputItems)) {
      validItems = inputItems.reduce((result, item_fullID) => {
        console.log(result);
        console.log(item_fullID);
        if(typeof dbMenusData_items[item_fullID] != 'undefined'){
          //branch item
          if((this.branchQuery) && 
             (item_fullID.indexOf(this.branch_fullID) == 0)) {
              result.push(item_fullID);
              //console.log("valid!");
          }
          else if(item_fullID.indexOf(this.reqData.params.restaurant_id) == 0) {
            //restaurant item
            result.push(item_fullID);
            //console.log("valid!");
          }
        }
        return result;
      }, []);
    }
    //console.log(validItems);
    return validItems;
  }

  async get() {
    let dbMenusData = await this.getMenusData(true);
    let menusData = dbMenusData.menus;

    //output
    let dataArray = [];
    
    for(let menu_id in menusData) {
      let menuData = menusData[menu_id];

      //translate
      let i18n = new I18n.main(menuData, this.idArray);
      menuData = i18n.translate(this.lang);

      let output = this.output(menuData, menu_id);

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
        /*let dbMenusData = await this.getMenusData();
        let menuData = dbMenusData.menus;
        let fullID = this.branch_fullID + this.reqData.params.menu_id;

        let data = menuData[fullID];
        if(typeof data == 'undefined'){
            let err = new Error("not found");
            err.statusCode = 404;
            throw err;
        }*/
        let menuData = await this.getMenuData(true);          

        console.log(menuData);
        //translate
        let i18n = new I18n.main(menuData, this.idArray);
        menuData = i18n.translate(this.lang);  

        let output = this.output(menuData, this.menu_fullID);
        return JSONAPI.makeJSONAPI(TYPE_NAME, output);
      }catch(err) {
          throw err;
      }
  }

    async create(payload) {
        let inputData = JSONAPI.parseJSONAPI(payload);

        try{
            let branchData = await db.queryById(this.branchTable, this.branch_fullID);   //get branch data    
            let menu_id = this.getNewID();
            let fullID = this.branch_fullID + menu_id;

            let dbMenusData = await this.getMenusData(true);

            let menusData;
            try {
                menusData = await db.queryById(TABLE_NAME, this.branch_fullID);
                //migration
                if(typeof menusData.menus == 'undefined'){
                    menusData.menus = {};
                }
            }
            catch(err){
                //init
                menusData = {
                    "id": this.branch_fullID,
                    "menus": {},
                    "items": {}
                } 
            }
            //check item existed
            inputData.items = this.checkItemExisted(inputData.items, dbMenusData.items);

            let control = new MenuControl();
            inputData.menuControl = JSON.parse(JSON.stringify(control));   //bug
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
            inputData = i18nUtils.makei18n(i18nSchema, inputData, lang);

            menusData.menus[fullID] = inputData; 
            let msg = await db.post(TABLE_NAME, menusData);

            
            //translate
            inputData = i18nUtils.translate(lang);
            //output
            let output = this.output(inputData, fullID);
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
        let menuData = menusData.menus[this.menu_fullID];

        //check menu existed
        if(typeof menuData == 'undefined'){
            let err = new Error("not found");
            err.statusCode = 404;
            throw err;
        }

        let inputData = JSONAPI.parseJSONAPI(payload);
        let dbMenusData = await this.getMenusData(true);
        //check item existed
        inputData.items = this.checkItemExisted(inputData.items, dbMenusData.items);
        
        delete inputData.id;
        inputData.menuControl = _.cloneDeep(menuData.menuControl);

        //i18n
        let lang = inputData.language;
        delete inputData.language;
        if(typeof lang === 'string'){
          let i18nUtils = new I18n.main(menuData, this.idArray);
          inputData = i18nUtils.makei18n(i18nSchema, inputData, lang);
        }
        console.log(inputData);

        //copy photo data
        inputData.photos = _.cloneDeep(menuData.photos);
        //copy i18n data
        inputData.i18n = _.cloneDeep(menuData.i18n);
        //copy resources data
        inputData.resources = _.cloneDeep(menuData.resources);

        menusData.menus[this.menu_fullID] = inputData;

        let dbOutput = await db.put(TABLE_NAME, menusData);

        //translate
        let dbOutputData = dbOutput.menus[this.menu_fullID];
        let i18nOutputUtils = new I18n.main(dbOutputData, this.idArray);
        dbOutputData = i18nOutputUtils.translate(lang);
        //output
        let output = this.output(dbOutputData, this.menu_fullID);
        return JSONAPI.makeJSONAPI(TYPE_NAME, output);
      }
      catch(err) {
        throw err;
      }
    }

    async deleteByID() {
      try{
        let menusData = await db.queryById(TABLE_NAME, this.branch_fullID);

        if(typeof menusData.menus[this.menu_fullID] == 'undefined'){
            let err = new Error("not found");
            err.statusCode = 404;
            throw err;
        }
        delete menusData.menus[this.menu_fullID];
        //bug: must delete all photos in s3

        let msg = await db.put(TABLE_NAME, menusData);
        return msg;
      }
      catch(err) {
        throw err;
      }
    }

  async getPhotoInfo() {
    /*let dbMenusData = await this.getMenusData();
    let fullID = this.branch_fullID + this.reqData.params.menu_id;
    let menuData = dbMenusData.menus[fullID];

    if(typeof menuData == 'undefined'){
      let err = new Error("not found");
      err.statusCode = 404;
      throw err;
    }*/
    let menuData = await this.getMenuData(true);

    //output
    let dataArray = [];

    let makePhotoArray = function(source, dest, menu_fullID){
        for(let photo_id in source.photos){
          let photoData = source.photos[photo_id];
          photoData.id = menu_fullID+photo_id;
          dest.push(photoData);
        }
        return;
    }

    makePhotoArray(menuData, dataArray, this.menu_fullID);

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
      /*let dbMenusData = await this.getMenusData();
      let fullID = this.branch_fullID + this.reqData.params.menu_id;
      let menuData = dbMenusData.menus[fullID];

      if(typeof menuData == 'undefined'){
          let err = new Error("not found");
          err.statusCode = 404;
          throw err;
      }*/
      let menuData = await this.getMenuData(true);

      let photo_id = this.reqData.params.photo_id;
      let photoData = menuData.photos[photo_id];

      if(typeof photoData == 'undefined'){
          let err = new Error("not found");
          err.statusCode = 404;
          throw err;
      }

      //output
      photoData.id = this.menu_fullID+photo_id;
    　let output = JSONAPI.makeJSONAPI("photos", photoData);

      return output;
    }catch(err) {
      throw err;
    }
  }

  async addPhoto(payload) {
    let output;
    
    try {
      let fullID = this.branch_fullID + this.reqData.params.menu_id;   
      let menusData = await db.queryById(TABLE_NAME, this.branch_fullID);
      let menuData = menusData.menus[fullID];

      //check item existed
      if(typeof menuData == 'undefined'){
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
      //let menu_id = this.reqData.params.menu_id;
      let fullID = this.branch_fullID + this.reqData.params.menu_id;

      let menuData = menusData.menus[fullID];
      if(typeof menuData == 'undefined'){
          let err = new Error("not found");
          err.statusCode = 404;
          throw err;
      }
      let photo_id = this.reqData.params.photo_id;
      let photoData = menuData.photos[photo_id];
      if(typeof photoData == 'undefined'){
          let err = new Error("not found");
          err.statusCode = 404;
          throw err;
      }

      //update
      let data = JSONAPI.parseJSONAPI(payload);
      delete data.id;

      data.url = photoData.url;
      menuData.photos[photo_id] = data;

      //write back
      menusData.menus[fullID] = menuData;
      let dbOutput = await db.put(TABLE_NAME, menusData);

      //output
      let outputBuf = dbOutput.menus[fullID].photos[photo_id];
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
      let fullID = this.branch_fullID + this.reqData.params.menu_id;
      let photo_id = this.reqData.params.photo_id;

      let menuData = menusData.menus[fullID];
      if(typeof menuData == 'undefined'){
          let err = new Error("not found");
          err.statusCode = 404;
          throw err;
      }

      if(typeof menuData.photos[photo_id] == 'undefined'){
          let err = new Error("not found");
          err.statusCode = 404;
          throw err;
      }

      //delete
      await Image.deletePhotos(menuData.photos[photo_id].url);
      delete menuData.photos[photo_id];

      //write back
      menusData.menus[fullID] = menuData;
      let dbOutput = await db.put(TABLE_NAME, menusData);

      return dbOutput;
    }catch(err) {
        throw err;
    }
  }

  async getI18n() {
    try{
      /*let dbMenusData = await this.getMenusData();
      let fullID = this.branch_fullID + this.reqData.params.menu_id;
      let menuData = dbMenusData.menus[fullID];

      if(typeof menuData == 'undefined'){
        let err = new Error("not found");
        err.statusCode = 404;
        throw err;
      }*/
      let menuData = await this.getMenuData(true);

      let i18nUtils = new I18n.main(menuData, this.idArray);
      let output = i18nUtils.getI18n(this.menu_fullID);
      return output;
    }catch(err) {
      throw err;
    }
  }

  async getI18nByID() {
    try {
      /*let dbMenusData = await this.getMenusData();
      let fullID = this.branch_fullID + this.reqData.params.menu_id;
      let menuData = dbMenusData.menus[fullID];

      if(typeof menuData == 'undefined'){
          let err = new Error("not found");
          err.statusCode = 404;
          throw err;
      }*/
      let menuData = await this.getMenuData(true);

      let i18nUtils = new I18n.main(menuData, this.idArray);
      let output = i18nUtils.getI18nByID(this.reqData.params.i18n_id);
      return output;
    }catch(err) {
      throw err;
    }
  }

  async addI18n(payload) {
    let output;

    try {
      let menusData = await db.queryById(TABLE_NAME, this.branch_fullID);
      let menuData = menusData.menus[this.menu_fullID];

      //check item existed
      if(typeof menuData == 'undefined'){
          let err = new Error("not found");
          err.statusCode = 404;
          throw err;
      }

      let inputData = JSONAPI.parseJSONAPI(payload);

      let i18nUtils = new I18n.main(menuData, this.idArray);
      let output = i18nUtils.addI18n(inputData);
      
      //write into db
      menusData.menus[this.menu_fullID] = menuData;
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
      //get i18n data
      let menusData = await db.queryById(TABLE_NAME, this.branch_fullID);
      let menuData = menusData.menus[this.menu_fullID];
      if(typeof menuData == 'undefined'){
          let err = new Error("not found");
          err.statusCode = 404;
          throw err;
      }

      let i18nUtils = new I18n.main(menuData, this.idArray);
      let output = i18nUtils.updateI18n(this.reqData.params.i18n_id, payload);

      //write back
      menusData.menus[this.menu_fullID] = menuData;
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
      let menuData = menusData.menus[this.menu_fullID];
      if(typeof menuData == 'undefined'){
          let err = new Error("not found");
          err.statusCode = 404;
          throw err;
      }

      let i18nUtils = new I18n.main(menuData, this.idArray);
      let resultData = await i18nUtils.deleteI18n(this.reqData.params.i18n_id);


      //write back
      menusData.menus[this.menu_fullID] = resultData;
      let dbOutput = await db.put(TABLE_NAME, menusData);

      return dbOutput;
    }catch(err) {
        throw err;
    }
  }

}

exports.main = Menus;
