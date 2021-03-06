let db = require('./dynamodb.js');
let JSONAPI = require('./jsonapi.js');
let Utils = require('./utils.js');
let Image = require('./image.js');
let I18n = require('./i18n.js');
let _ = require('lodash');
let S3 = require('./s3');

const TABLE_NAME = "Restaurants";
const USERINFO_TABLE_NAME = "Users";

const TYPE_NAME = "restaurants";

const PHOTO_TMP_TABLE_NAME = "photo_tmp";

function RestaurantControl() {
    //contructor() {
        this.branchesMaxID = "s0";
        this.branch_ids = [];
    //    this.photoMaxID = "p000";
    //}
}

let i18nSchema = {
    "name": "",
    "desc": "",
    "address": ""
};

class Restaurant {
    constructor(reqData){
        this.reqData = reqData;

        //id array
        this.restaurant_fullID = "";
        if(typeof this.reqData.params.restaurant_id === 'string'){
            this.restaurant_fullID = this.reqData.params.restaurant_id;
        }
        this.idArray = Utils.parseID(this.restaurant_fullID);

        //lang
        if(typeof reqData.queryString.lang == 'string'){
            this.lang = reqData.queryString.lang;
        }
    }

    getNewID() {
      const dateTime = Date.now();
      const timestamp = Math.floor(dateTime);
  
      return `r${timestamp}`;
    }

    output(data, fullID){
        data.id = fullID;
        data.photos = Utils.objToArray(data.photos);
        delete data.restaurantControl;
        
        data.default_language = data.i18n.default;
    
        return data;
    }

    async get() {
      let identityId = this.reqData.userinfo.cognitoIdentityId;

      try {
        let restaurantsArray = await db.queryById(USERINFO_TABLE_NAME, identityId);
        let keyArray = restaurantsArray.restaurants;
        if(!Array.isArray(keyArray)){
          return "";
        }

        let params = {
          RequestItems: {}
        };
        params.RequestItems[TABLE_NAME] = {
          Keys: keyArray.map(id => {
            return {'id': id}
          })
        };

        let result = await db.batchGet(params);
        let dataArray = result.Responses[TABLE_NAME];

        dataArray.map(restaurantData => {
          //translate
          let i18n = new I18n.main(restaurantData, this.idArray);
          restaurantData = i18n.translate(this.lang);

          return this.output(restaurantData, restaurantData.id);
        });

        //if empty
        if(dataArray.length == 0){
          return "";
        }

        return JSONAPI.makeJSONAPI(TYPE_NAME, dataArray);
      }catch(err) {
        console.log("==restaurant get err!!==");
        console.log(err);
        //throw err;
        return "";
      }
    }

    async getByID() {
        try {
            let restaurantData = await db.queryById(TABLE_NAME, this.restaurant_fullID);

            //translate
            let i18n = new I18n.main(restaurantData, this.idArray);
            restaurantData = i18n.translate(this.lang);

            //output
            let output = this.output(restaurantData, this.restaurant_fullID);
            return JSONAPI.makeJSONAPI(TYPE_NAME, output);         
        }catch(err) {
            throw err;
        }
    }

    async create(payload) {
        let userData;
        let identityId = this.reqData.userinfo.cognitoIdentityId;

        try {
            userData = await db.queryById(USERINFO_TABLE_NAME, identityId);
            console.log("======user data=======");
            console.log(userData);
        }
        catch(err){ //new user
            userData = {
                id: identityId,
                restaurants: []
            }
        }

        try {
            let inputData = JSONAPI.parseJSONAPI(payload);
            inputData.restaurantControl = JSON.parse(JSON.stringify(new RestaurantControl()));   //bug
            let restaurant_id = this.getNewID();

            inputData.id = restaurant_id;
            inputData.restaurantControl.owner = identityId;
            inputData.photos = {};
            inputData.resources = {};
            inputData.i18n = {};

            //i18n
            let lang = inputData.language;
            delete inputData.language;
            if((lang === undefined)&&(typeof inputData.default_language === 'string')){
              lang = inputData.default_language;
            }
            else if(lang === undefined){
              lang = "en-us";
            }
            let i18nUtils = new I18n.main(inputData, this.idArray);
            inputData = i18nUtils.makei18n(i18nSchema, inputData, lang);

            //update restaurant
            await db.post(TABLE_NAME, inputData);

            //update user data
            userData.restaurants.push(restaurant_id);
            await db.post(USERINFO_TABLE_NAME, userData);

            //translate
            inputData = i18nUtils.translate(lang);
            //output
            let output = this.output(inputData, restaurant_id);
            return JSONAPI.makeJSONAPI(TYPE_NAME, output);            
        }catch(err) {
            throw err;
        }
    }

    async updateByID(payload) {
        let inputData = JSONAPI.parseJSONAPI(payload);

        try {
            inputData.id = this.reqData.params.restaurant_id;
            let restaurantData = await db.queryById(TABLE_NAME, inputData.id);

            //copy control data
            inputData.restaurantControl = _.cloneDeep(restaurantData.restaurantControl);

            //i18n
            let lang = inputData.language;
            delete inputData.language;
            if(typeof lang === 'string'){
                let i18nUtils = new I18n.main(restaurantData, this.idArray);
                inputData = i18nUtils.makei18n(i18nSchema, inputData, lang);
            }

            //copy photo data
            inputData.photos = _.cloneDeep(restaurantData.photos);
            //copy i18n data
            inputData.i18n = _.cloneDeep(restaurantData.i18n);      
            //copy resources data
            inputData.resources = _.cloneDeep(restaurantData.resources);

            //update
            let dbOutput = await db.put(TABLE_NAME, inputData);

            //translate
            let i18nOutputUtils = new I18n.main(dbOutput, this.idArray);
            dbOutput = i18nOutputUtils.translate(lang);
            //output
            let output = this.output(dbOutput, this.restaurant_fullID);
            return JSONAPI.makeJSONAPI(TYPE_NAME, output);  
        }catch(err) {
            console.log(err);
            throw err;
        }
    }

  async deleteByID() {
    let data = {
      id: this.reqData.params.restaurant_id
    };

    try {
      let msg = await db.delete(TABLE_NAME, data);
      return "";
    }catch(err) {
      console.log(err);
      throw err;
    }
  }

  async deleteI18n() {
    try {
      let targetLang = this.reqData.params.lang_code;

      let restaurantData = await db.queryById(TABLE_NAME, this.restaurant_fullID);
      //console.log("--restaurantData--");
      //console.log(restaurantData);

      let i18nUtils = new I18n.main(restaurantData, this.idArray);
      let newData = i18nUtils.deleteI18n(targetLang, restaurantData);

      //update
      let dbOutput = await db.put(TABLE_NAME, newData);
      
      //translate
      let i18nOutputUtils = new I18n.main(dbOutput, this.idArray);
      dbOutput = i18nOutputUtils.translate(newData.i18n.default);
      //output
      let output = this.output(dbOutput, this.branch_fullID);
      return JSONAPI.makeJSONAPI(TYPE_NAME, output);
    }catch(err) {
      console.log(err);
      throw err;
    }
  }

  async getPhotoInfo() {
    let restaurant_id = this.reqData.params.restaurant_id;
    let restaurantData = await db.queryById(TABLE_NAME, restaurant_id);

    //output
    let dataArray = [];

    let makePhotoArray = function(source, dest, restaurant_id){
        for(let photo_id in source.photos){
          let photoData = source.photos[photo_id];
          photoData.id = restaurant_id+photo_id;
          dest.push(photoData);
        }
        return;
    }

    makePhotoArray(restaurantData, dataArray, restaurant_id);

    //if empty
    if(dataArray.length == 0){
        //let err = new Error("not found");
        //err.statusCode = 404;
        //throw err;
        return "";
    }

    return JSONAPI.makeJSONAPI("photos", dataArray);
  }

  async getPhotoInfoByID() {
    try {
      let restaurant_id = this.reqData.params.restaurant_id;
      let restaurantData = await db.queryById(TABLE_NAME, restaurant_id);

      let photo_id = this.reqData.params.photo_id;
      let photoData = restaurantData.photos[photo_id];

      if(typeof photoData == 'undefined'){
          let err = new Error("not found");
          err.statusCode = 404;
          throw err;
      }

      //output
      photoData.id = restaurant_id+photo_id;
    　let output = JSONAPI.makeJSONAPI("photos", photoData);

      return output;
    }catch(err) {
      throw err;
    }
  }

  async addPhoto(payload) {
    try {
      let restaurant_id = this.reqData.params.restaurant_id;
      let restaurantData = await db.queryById(TABLE_NAME, restaurant_id);
      let inputData = JSONAPI.parseJSONAPI(payload);
      let output = Image.addPhoto(inputData, this.idArray);
      
      return output;
    }catch(err) {
      console.log(err);
      throw err;
    }
  }

  async updatePhotoInfo(payload) {
    try {
      let restaurant_id = this.reqData.params.restaurant_id;
      let restaurantData = await db.queryById(TABLE_NAME, restaurant_id);
      let photo_id = this.reqData.params.photo_id;
      let photoData = restaurantData.photos[photo_id];
      if(typeof photoData == 'undefined'){
          let err = new Error("not found");
          err.statusCode = 404;
          throw err;
      }

      //update
      let data = JSONAPI.parseJSONAPI(payload);
      delete data.id;

      data.url = photoData.url;
      restaurantData.photos[photo_id] = data;

      //write back
      let dbOutput = await db.put(TABLE_NAME, restaurantData);

      //output
      let outputBuf = dbOutput.photos[photo_id];
      outputBuf.id = restaurant_id+photo_id;
      let output = JSONAPI.makeJSONAPI("photos", outputBuf);
      return output;
    }catch(err) {
        throw err;
    }
  }

  async deletePhoto() {
    try {
      let restaurant_id = this.reqData.params.restaurant_id;
      let restaurantData = await db.queryById(TABLE_NAME, restaurant_id);
      let photo_id = this.reqData.params.photo_id;

      if(typeof restaurantData.photos[photo_id] == 'undefined'){
          let err = new Error("not found");
          err.statusCode = 404;
          throw err;
      }
      //delete
      await Image.deletePhotos(restaurantData.photos[photo_id].url);
      delete restaurantData.photos[photo_id];
      //delete
      //let file_name = photo_id + ".jpg";
      //let path = Utils.makePath(this.idArray);
      //let msg = await S3.deleteS3Obj(path + "/" + file_name);

      //delete restaurantData.photos[photo_id];

      //write back
      let dbOutput = await db.put(TABLE_NAME, restaurantData);

      return dbOutput;
    }catch(err) {
        throw err;
    }
  }

}


exports.main = Restaurant;