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

const TYPE_NAME = "menus";
const I18N_TYPE_NAME = "i18n";
const RESOURCE_TYPE_NAME = "resources";

const PHOTO_TMP_TABLE_NAME = "photo_tmp";

function MenuControl() {
  this.photoMaxID = "p000";
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
      let id = this.branch_fullID;
      if(typeof this.reqData.params.menu_id != 'undefined'){
        id += this.reqData.params.menu_id;
      }
      this.idArray = Utils.parseID(id);
      console.log(this.idArray);
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

  output(data, fullID){
    data.id = fullID;
    data.photos = Utils.objToArray(data.photos);
    delete data.menuControl;

    return data;
  }

  checkItemExisted(inputItems, dbMenusData_items){
    let validItems = [];

    if(Array.isArray(inputItems)) {
      validItems = inputItems.reduce((result, item_fullID) => {
        //console.log(item_fullID);
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
        let dbMenusData = await this.getMenusData();
        let menuData = dbMenusData.menus;

        //output
        let dataArray = [];
        
        for(let menu_id in menuData) {
          console.log(menu_id);
          let data = menuData[menu_id];

          //translate
          let rc = new I18n.main(data.i18n);
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

          let output = this.output(data, menu_id);

          dataArray.push(output);
        }
        console.log("====dataArray====");
        console.log(dataArray);

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
          let menuData = dbMenusData.menus;
          let fullID = this.branch_fullID + this.reqData.params.menu_id;

          let data = menuData[fullID];
          if(typeof data == 'undefined'){
              let err = new Error("not found");
              err.statusCode = 404;
              throw err;
          }

          //translate
          let rc = new I18n.main(data.i18n);
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
            let menu_id = this.getNewID(branchData[this.controlName]);
            let fullID = this.branch_fullID + menu_id;
            let dbMenusData = await this.getMenusData();

            let menusData;
            //let createNew = false;
            try {
                menusData = await db.queryById(TABLE_NAME, this.branch_fullID);
                //createNew = true;
                //migration
                if(typeof menusData.items == 'undefined'){
                    menusData.items = {};
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
            menusData.menus[fullID] = inputData; 
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
            let output = this.output(menusData.menus[fullID], fullID);
            return JSONAPI.makeJSONAPI(TYPE_NAME, output);
        }
        catch(err) {
            console.log(err);
            throw err;
        }

    }

    async updateByID(payload) {
      let inputData = JSONAPI.parseJSONAPI(payload);
      try{
        let menusData = await db.queryById(TABLE_NAME, this.branch_fullID);
        let fullID = this.branch_fullID + this.reqData.params.menu_id;

        //check menu existed
        if(typeof menusData.menus[fullID] == 'undefined'){
            let err = new Error("not found");
            err.statusCode = 404;
            throw err;
        }

        let dbMenusData = await this.getMenusData();
        //check item existed
        inputData.items = this.checkItemExisted(inputData.items, dbMenusData.items);


        delete inputData.id;
        inputData.menuControl = cloneDeep(menusData.menus[fullID].menuControl);

        //copy photo data
        inputData.photos = cloneDeep(menusData.menus[fullID].photos);

        //copy resources data
        inputData.resources = cloneDeep(menusData.menus[fullID].resources);

        menusData.menus[fullID] = inputData;

        let dbOutput = await db.put(TABLE_NAME, menusData);

        //output
        let output = this.output(dbOutput.menus[fullID], fullID);
        return JSONAPI.makeJSONAPI(TYPE_NAME, output);
      }
      catch(err) {
        throw err;
      }
    }

    async deleteByID() {
      try{
        let menusData = await db.queryById(TABLE_NAME, this.branch_fullID);
        let fullID = this.branch_fullID + this.reqData.params.menu_id;

        if(typeof menusData.menus[fullID] == 'undefined'){
            let err = new Error("not found");
            err.statusCode = 404;
            throw err;
        }
        delete menusData.menus[fullID];
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
    let fullID = this.branch_fullID + this.reqData.params.menu_id;
    let menuData = dbMenusData.menus[fullID];

    if(typeof menuData == 'undefined'){
      let err = new Error("not found");
      err.statusCode = 404;
      throw err;
    }

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

    makePhotoArray(menuData, dataArray, fullID);

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
      let fullID = this.branch_fullID + this.reqData.params.menu_id;
      let menuData = dbMenusData.menus[fullID];

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
      let dbMenusData = await this.getMenusData();
      let fullID = this.branch_fullID + this.reqData.params.menu_id;
      let menuData = dbMenusData.menus[fullID];

      if(typeof menuData == 'undefined'){
        let err = new Error("not found");
        err.statusCode = 404;
        throw err;
      }

      //output
      let dataArray = [];

      let makeI18nArray = function(source, dest, menu_fullID){
          for(let i18n_id in source.i18n){
            let i18nData = source.i18n[i18n_id];
            i18nData.id = menu_fullID+i18n_id;
            dest.push(i18nData);
          }
          return;
      }

      makeI18nArray(menuData, dataArray, fullID);

      //if empty
      if(dataArray.length == 0){
          let err = new Error("not found");
          err.statusCode = 404;
          throw err;
      }

      return JSONAPI.makeJSONAPI(I18N_TYPE_NAME, dataArray);
    }catch(err) {
      throw err;
    }
  }

  async getI18nByID() {
    try {
      let dbMenusData = await this.getMenusData();
      let fullID = this.branch_fullID + this.reqData.params.menu_id;
      let menuData = dbMenusData.menus[fullID];

      if(typeof menuData == 'undefined'){
          let err = new Error("not found");
          err.statusCode = 404;
          throw err;
      }

      let i18n_id = this.reqData.params.i18n_id;
      let i18nData = menuData.i18n[i18n_id];

      if(typeof i18nData == 'undefined'){
          let err = new Error("not found");
          err.statusCode = 404;
          throw err;
      }

      //output
      i18nData.id = fullID+i18n_id;
    　let output = JSONAPI.makeJSONAPI(I18N_TYPE_NAME, i18nData);

      return output;
    }catch(err) {
      throw err;
    }
  }

  async addI18n() {
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
        let i18n_id = this.getNewResourceID("i18n", arraySeq);
        let path = Utils.makePath(this.idArray);
        let outputBuf;

        console.log(oneData);
        menuData.i18n[i18n_id] = oneData;

        outputBuf = oneData;
        outputBuf.id = i18n_id;

        //check
        let defaultLang = oneData.default;
        if((typeof defaultLang != 'string')||(typeof oneData.data[defaultLang] == 'undefined')){
          for(let i in oneData.data){ //set the first lang to default
            oneData.default = i;
            break;
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
        output = JSONAPI.makeJSONAPI(I18N_TYPE_NAME, outputBufArray);
      }
      else {
        outputBuf = await oneDataProcess(inputData);
        output = JSONAPI.makeJSONAPI(I18N_TYPE_NAME, outputBuf);
      }
      
      //write into db
      menusData.menus[fullID] = menuData;
      let dbOutput = await db.put(TABLE_NAME, menusData);

      return output;
    }catch(err) {
      console.log(err);
      throw err;
    }
  }

  async updateI18n() {
    let inputData = JSONAPI.parseJSONAPI(payload);
    delete inputData.id;

    try {
      //get photo data
      let menusData = await db.queryById(TABLE_NAME, this.branch_fullID);
      let fullID = this.branch_fullID + this.reqData.params.menu_id;

      let menuData = menusData.menus[fullID];
      if(typeof itemData == 'undefined'){
          let err = new Error("not found");
          err.statusCode = 404;
          throw err;
      }
      let i18n_id = this.reqData.params.i18n_id;
      let i18nData = menuData.i18n[i18n_id];
      if(typeof i18nData == 'undefined'){
          let err = new Error("not found");
          err.statusCode = 404;
          throw err;
      }

      //check
      let defaultLang = inputData.default;
      if((typeof defaultLang != 'string')||(typeof inputData.data[defaultLang] == 'undefined')){
        for(let i in inputData.data){ //set the first lang to default
          inputData.default = i;
          break;
        }
      }

      //update
      menuData.i18n[i18n_id] = inputData;

      //write back
      menusData.menus[fullID] = menuData;
      let dbOutput = await db.put(TABLE_NAME, menusData);

      //output
      let outputBuf = dbOutput.menus[fullID].i18n[i18n_id];
      outputBuf.id = fullID+i18n_id;
      let output = JSONAPI.makeJSONAPI(I18N_TYPE_NAME, outputBuf);
      return output;
    }catch(err) {
        throw err;
    }
  }

  async deleteI18n() {
    try {
      //get resource data
      let menusData = await db.queryById(TABLE_NAME, this.branch_fullID);
      let fullID = this.branch_fullID + this.reqData.params.menu_id;
      let i18n_id = this.reqData.params.i18n_id;

      let menuData = menusData.menus[fullID];
      if(typeof menuData == 'undefined'){
          let err = new Error("not found");
          err.statusCode = 404;
          throw err;
      }
      if(typeof menuData.i18n[i18n_id] == 'undefined'){
        let err = new Error("not found");
        err.statusCode = 404;
        throw err;
      }

      //delete
      delete menuData.i18n[i18n_id];

      //write back
      menusData.menus[fullID] = menuData;
      let dbOutput = await db.put(TABLE_NAME, menusData);

      return dbOutput;
    }catch(err) {
        throw err;
    }
  }

}

exports.main = Menus;
