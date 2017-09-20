let db = require('./dynamodb.js');
let JSONAPI = require('./jsonapi.js');
let Utils = require('./utils.js');
let Image = require('./image.js');
import { cloneDeep } from 'lodash';
import { sprintf } from 'sprintf-js';
let S3 = require('./s3');

//import { makeInfo } from './image.js';

const TABLE_NAME = "Restaurants";
let CONTROL_TABLE_NAME = "Control";
const USERINFO_TABLE_NAME = "Users";

const TYPE_NAME = "restaurants";

const PHOTO_TMP_TABLE_NAME = "photo_tmp";

function RestaurantControl() {
    //contructor() {
        this.branchesMaxID = "s0";
        this.branch_ids = [];
        this.photoMaxID = "p000";
    //}
}

class Restaurant {
    constructor(reqData){
        this.reqData = reqData;

        //id array
        this.idArray = Utils.parseID(this.reqData.params.restaurant_id);
        console.log(this.idArray);
    }



    getNewID(controlData) {
        let idList = Utils.parseID(controlData.value);

        let maxID = parseInt(idList.r, 10)+1;

        return "r"+maxID.toString();
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
        let identityId = this.reqData.userinfo.cognitoIdentityId;

        try {
            //scan table Restaurant (bug: must merged into dynamodb.js)
            //let restaurant_id = this.reqData.params.restaurant_id.toString();
            var params = {
                TableName: TABLE_NAME,
                //ProjectionExpression: "#yr, title, info.rating",
                FilterExpression: "#a1.#a2 = :b",
                ExpressionAttributeNames: {
                    "#a1": "restaurantControl",
                    "#a2": "owner"
                },
                ExpressionAttributeValues: {
                     ":b": identityId 
                },
                ReturnConsumedCapacity: "TOTAL"
            };
            let dataArray = await db.scanDataByFilter(params);
            console.log(dataArray);
            dataArray.map(obj => {
                obj.photos = Utils.objToArray(obj.photos);
                delete obj.restaurantControl;
            });

            //if empty
            if(dataArray.length == 0){
                let err = new Error("not found");
                err.statusCode = 404;
                throw err;
            }

            return JSONAPI.makeJSONAPI(TYPE_NAME, dataArray);   
        }catch(err) {
            console.log("==restaurant get err!!==");
            console.log(err);
            throw err;
        } 
    }

    /*async get() {
        try {
            let msg = await db.scan(TABLE_NAME);
            msg.map(obj => {
                delete obj.restaurantControl;
            });
            return JSONAPI.makeJSONAPI(this.reqData.paths[1], msg);            
        }catch(err) {
            console.log("==restaurant get err!!==");
            console.log(err);
            throw err;
        }
    }*/

    async getByID() {
        try {
            let data = await db.queryById(TABLE_NAME, this.reqData.params.restaurant_id);
            data.photos = Utils.objToArray(data.photos);
            delete data.restaurantControl;
            let output = JSONAPI.makeJSONAPI(TYPE_NAME, data);
            return output;
        }catch(err) {
            throw err;
        }
    }

    async create(payload) {
        let controlData;
        let userData;
        let identityId = this.reqData.userinfo.cognitoIdentityId;

        try {
            controlData = await db.queryById(CONTROL_TABLE_NAME, "RestaurantsMaxID");
        }
        catch(err){ //init system
            let year = new Date().getFullYear();

            controlData = {
                id: "RestaurantsMaxID",
                value: "r"+year+"00000"
            }
        }

        try {
            userData = await db.queryById(USERINFO_TABLE_NAME, identityId);
            console.log("======1=======");
            console.log(userData);
        }
        catch(err){ //new user
            userData = {
                id: identityId,
                restaurants: []
            }
        }

        try {
            let data = JSONAPI.parseJSONAPI(payload);
            data.restaurantControl = JSON.parse(JSON.stringify(new RestaurantControl()));   //bug
            let restaurant_id = this.getNewID(controlData);

            data.id = restaurant_id;
            data.restaurantControl.owner = identityId;
            data.photos = {};
            data.resources = {};
            data.i18n = {};

            //update restaurant
            await db.post(TABLE_NAME, data);

            //update control data
            controlData.value = restaurant_id
            await db.put(CONTROL_TABLE_NAME, controlData);
			
            //update user data
            userData.restaurants.push(restaurant_id);
            await db.post(USERINFO_TABLE_NAME, userData);

            //output
            data.photos = Utils.objToArray(data.photos);
            delete data.restaurantControl;
            let output = JSONAPI.makeJSONAPI(TYPE_NAME, data);
            return output;    
        }catch(err) {
            throw err;
        }
    }

    async updateByID(payload) {
        let data = JSONAPI.parseJSONAPI(payload);

        try {
            data.id = this.reqData.params.restaurant_id;
            let restaurantData = await db.queryById(TABLE_NAME, data.id);

            //copy control data
            data.restaurantControl = cloneDeep(restaurantData.restaurantControl);

            //copy photo data
            data.photos = cloneDeep(restaurantData.photos);
            
            //copy resources data
            data.resources = cloneDeep(restaurantData.resources);

            //update
            let dbOutput = await db.put(TABLE_NAME, data);

            //output
            dbOutput.photos = Utils.objToArray(dbOutput.photos);
            delete dbOutput.restaurantControl;
            let output = JSONAPI.makeJSONAPI(TYPE_NAME, dbOutput);
            return output;
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
            return msg;
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
        let err = new Error("not found");
        err.statusCode = 404;
        throw err;
    }

    return JSONAPI.makeJSONAPI(TYPE_NAME, dataArray);
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

      //check item existed
      //if(typeof restaurantData == 'undefined'){
      //    let err = new Error("not found");
      //    err.statusCode = 404;
      //    throw err;
      //}

      let inputData = JSONAPI.parseJSONAPI(payload);
      delete inputData.id;
      console.log(inputData);


      let photo_id = this.getNewPhotoID(restaurantData.restaurantControl);
      console.log(photo_id);
      let path = Utils.makePath(this.idArray);
      console.log(path);

      let file_name = `${path}/photos/${photo_id}.jpg`;
      console.log("file_name="+file_name);
      restaurantData.restaurantControl.photoMaxID = photo_id;
      console.log("restaurantData=");
      console.log(restaurantData);

      //sign
      let signedData = await S3.getPresignedURL(file_name, inputData.mimetype);
      console.log(signedData);

      //update db
      inputData.id = Utils.makeFullID(this.idArray) + photo_id;
      inputData.ttl = Math.floor(Date.now() / 1000) + 600;  //expire after 10min
      console.log(inputData);
      let dbOutput = await db.put(PHOTO_TMP_TABLE_NAME, inputData);
      console.log(dbOutput);

      let dbOutput2 = await db.put(TABLE_NAME, restaurantData);

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
      let output = JSONAPI.makeJSONAPI(TYPE_NAME, outputBuf);
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