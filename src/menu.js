let db = require('./dynamodb.js');
let JSONAPI = require('./jsonapi.js');
let Utils = require('./utils.js');
import { cloneDeep } from 'lodash';
import { sprintf } from 'sprintf-js';
let S3 = require('./s3');

const BRANCH_TABLE_NAME = "Branches";
const RESTAURANT_TABLE_NAME = "Restaurants";
const TABLE_NAME = "Menus";

const TYPE_NAME = "menus";

const PHOTO_TMP_TABLE_NAME = "photo_tmp";

function MenuControl() {
  this.photoMaxID = "p000";
}

class Menus {
    constructor(reqData){
      this.reqData = reqData;

      //store restaurant var
      this.restaurantTable = RESTAURANT_TABLE_NAME;
      this.restaurantID = this.reqData.params.restaurant_id;

      this.branchQuery = false;
      if(typeof this.reqData.params.branch_id != 'undefined'){
        this.branchQuery = true;
      }

      //parse request
      this.controlName = "restaurantControl";
      this.branch_fullID = this.reqData.params.restaurant_id;
      this.branchTable = RESTAURANT_TABLE_NAME;
      
      if(this.branchQuery){
          this.branch_fullID = this.restaurantID + this.reqData.params.branch_id;
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

  getNewPhotoID(controlData){
    if(typeof controlData.photoMaxID == 'undefined'){
      controlData.photoMaxID = "p000";
    }
    
    let idList = Utils.parseID(controlData.photoMaxID);
    let maxID = parseInt(idList.p, 10)+1;

    return "p"+maxID.toString();
  }

  async getMenusData(){
    let restaurantMenusData = await db.queryById(TABLE_NAME, this.restaurantID);
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
    delete data.menuControl;

    return data;
  }

    async get() {
        let dbMenusData = await this.getMenusData();
        let menuData = dbMenusData.menus;

        //output
        let dataArray = [];
        
        for(let menu_id in menuData) {
          console.log(menu_id);

          let output = this.output(menuData[menu_id], menu_id);

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
            let validItems = [];
            if(Array.isArray(inputData.items)) {
                validItems = inputData.items.reduce((result, item_fullID) => {
                    //console.log(item_id);
                    if(typeof dbMenusData.items[item_fullID] != 'undefined'){
                        result.push(item_fullID);
                    }
                    return result;
                }, []);
            }
            //console.log(validItems);
            inputData.items = validItems;

            let control = new MenuControl();
            inputData.menuControl = JSON.parse(JSON.stringify(control));   //bug
            inputData.photos = {};
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
      try{
        let menusData = await db.queryById(TABLE_NAME, this.branch_fullID);
        //let menu_id = this.reqData.params.menu_id;
        let fullID = this.branch_fullID + this.reqData.params.menu_id;

        //check menu existed
        if(typeof menusData.menus[fullID] == 'undefined'){
            let err = new Error("not found");
            err.statusCode = 404;
            throw err;
        }

        let data = JSONAPI.parseJSONAPI(payload);
        delete data.id;
        data.menuControl = cloneDeep(menusData.menus[fullID].menuControl);

        //copy photo data
        data.photos = cloneDeep(menusData.menus[fullID].photos);

        menusData.menus[fullID] = data;

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
    let restaurantMenuItemData = null;
    let restaurantMenuData = null;
    let branchMenuData = null;
    try {
        restaurantMenuItemData = await db.queryById(TABLE_NAME, this.restaurantID);
        restaurantMenuData = restaurantMenuItemData.menus;
    }
    catch(err) {
        //no restaurant menu
    }

    if(this.branchQuery){
        try {
            let branchMenuItemData = await db.queryById(TABLE_NAME, this.branch_fullID);
            branchMenuData = branchMenuItemData.menus;
        }catch(err) {
            //no branch menu
        }           
    }

    //output
    let dataArray = [];

    let makePhotoArray = function(source, dest, branchID, menu_id){
        for(let photo_id in source.photos){
          let photoData = source.photos[photo_id];
          photoData.id = branchID+menu_id+photo_id;
          dest.push(photoData);
        }
        return;
    }
    
    for(let menu_id in restaurantMenuData) {
      let data = restaurantMenuData[menu_id];
      makePhotoArray(data, dataArray, this.branch_fullID, menu_id);
    }

    for(let menu_id in branchMenuData) {
      let data = branchMenuData[menu_id];
      makePhotoArray(data, dataArray, this.branch_fullID, menu_id);
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
      let menusData = await db.queryById(TABLE_NAME, this.branch_fullID);

      let menuData = menusData.menus[this.reqData.params.menu_id];
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
      photoData.id = this.branch_fullID+this.reqData.params.menu_id+photo_id;
    　let output = JSONAPI.makeJSONAPI("photos", photoData);

      return output;
    }catch(err) {
      throw err;
    }
  }

  async addPhoto(payload) {
    try {
      let menusData = await db.queryById(TABLE_NAME, this.branch_fullID);
      let menu_id = this.reqData.params.menu_id;
      let menuData = menusData.menus[menu_id];

      //check item existed
      if(typeof menuData == 'undefined'){
          let err = new Error("not found");
          err.statusCode = 404;
          throw err;
      }


      let inputData = JSONAPI.parseJSONAPI(payload);
      delete inputData.id;
      console.log(inputData);
      
      //migration
      if(typeof menuData.menuControl == 'undefined'){
        let control = new MenuControl();
        menuData.menuControl = JSON.parse(JSON.stringify(control));   //bug
      }

      let photo_id = this.getNewPhotoID(menuData.menuControl);
      let path = Utils.makePath(this.idArray);

      let file_name = `${path}/${photo_id}.jpg`;
      console.log("file_name="+file_name);
      menuData.menuControl.photoMaxID = photo_id;
      console.log("menuData=");
      console.log(menuData);

      //sign
      let signedData = await S3.getPresignedURL(file_name, inputData.mimetype);
      console.log(signedData);

      //update db
      inputData.id = Utils.makeFullID(this.idArray) + photo_id;
      inputData.ttl = Math.floor(Date.now() / 1000) + 600;  //expire after 10min
      console.log(inputData);
      let dbOutput = await db.put(PHOTO_TMP_TABLE_NAME, inputData);
      console.log(dbOutput);

      menusData.menus[menu_id] = menuData;
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
      let menu_id = this.reqData.params.menu_id;

      let menuData = menusData.menus[menu_id];
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
      menusData.menus[menu_id] = menuData;
      let dbOutput = await db.put(TABLE_NAME, menusData);

      //output
      let outputBuf = dbOutput.menus[menu_id].photos[photo_id];
      outputBuf.id = this.branch_fullID+menu_id+photo_id;
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
      let menu_id = this.reqData.params.menu_id;

      let menuData = menusData.menus[menu_id];
      if(typeof menuData == 'undefined'){
          let err = new Error("not found");
          err.statusCode = 404;
          throw err;
      }
      let photo_id = this.reqData.params.photo_id;

      //delete
      let file_name = photo_id + ".jpg";
      if(typeof menuData.photos[photo_id] == 'undefined'){
          let err = new Error("not found");
          err.statusCode = 404;
          throw err;
      }
      let path = Utils.makePath(this.idArray);
      let msg = await S3.deleteS3Obj(path + "/" + file_name);

      delete menuData.photos[photo_id];

      //write back
      menusData.menus[menu_id] = menuData;
      let dbOutput = await db.put(TABLE_NAME, menusData);

      return dbOutput;
    }catch(err) {
        throw err;
    }
  }
}

exports.main = Menus;
