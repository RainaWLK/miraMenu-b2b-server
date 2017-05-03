let db = require('./dynamodb.js');
let JSONAPI = require('./jsonapi.js');
import { cloneDeep } from 'lodash';
import { sprintf } from 'sprintf-js';
import * as S3 from './s3.js';

const TABLE_NAME = "Restaurants";
const CONTROL_TABLE_NAME = "Control";

function RestaurantControl() {
    //contructor() {
        this.branchesMaxID = "0";
        this.branch_ids = [];
        this.pictureMaxID = "0";
    //}
}

class Restaurant {
    constructor(reqData){
        this.reqData = reqData;
    }

    getNewID(controlData) {
        let maxID = parseInt(controlData.value, 10) + 1;
        return maxID.toString();
    }

    getNewPictureID(controlData){
	//migration
	if(typeof controlData.pictureMaxID == 'undefined'){
		controlData.pictureMaxID = "0";
	}
		
        let maxID = parseInt(controlData.pictureMaxID, 10) + 1;
        return maxID.toString();
    }

    async get() {
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
    }

    async getByID() {
        try {
            let data = await db.queryById(TABLE_NAME, this.reqData.params.restaurant_id);
            delete data.restaurantControl;
            let output = JSONAPI.makeJSONAPI(this.reqData.paths[1], data);
            return output;
        }catch(err) {
            throw err;
        }
    }

    async create(payload) {
        try {
            let controlData = await db.queryById(CONTROL_TABLE_NAME, "RestaurantsMaxID");
            let data = JSONAPI.parseJSONAPI(payload);
            data.restaurantControl = JSON.parse(JSON.stringify(new RestaurantControl()));   //bug
            let restaurant_id = this.getNewID(controlData);

            data.id = restaurant_id;

            let msg = await db.post(TABLE_NAME, data);

            //update restaurant
            controlData.value = restaurant_id
            await db.put(CONTROL_TABLE_NAME, controlData);
			
	    //output
	    delete data.restaurantControl;
	    let output = JSONAPI.makeJSONAPI(this.reqData.paths[1], data);
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
            //console.log("--branchData--");
            //console.log(branchData);

            //copy control data
            data.branchControl = cloneDeep(restaurantData.restaurantControl);

            //update
            let msg = await db.put(TABLE_NAME, data);
            return msg;
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
	
    async getPicture() {
        try {
            let restaurant_id = this.reqData.params.restaurant_id;
            let restaurantData = await db.queryById(TABLE_NAME, restaurant_id);

	        let path = "restaurants/"+restaurant_id+"/pictures";
	        let file_name = this.reqData.queryString.key;
            let data = await S3.getS3Obj(path + "/" + file_name);
            return data;
        }catch(err) {
            throw err;
        }
    }

    async addPicture(payload) {
        try {
            let restaurant_id = this.reqData.params.restaurant_id;
            let restaurantData = await db.queryById(TABLE_NAME, restaurant_id);

	        let path = "restaurants/"+restaurant_id+"/pictures";
			
            let picture_id = this.getNewPictureID(restaurantData.restaurantControl);
	        let file_name = picture_id+".jpg";

            let msg = await S3.uploadToS3(path + "/" + file_name, payload);
			
            //update db
            if(typeof restaurantData.photo == 'undefined'){
                restaurantData.photo = {}; //filename: desc
            }
            restaurantData.photo[file_name] = "ccc";
            restaurantData.restaurantControl.pictureMaxID = picture_id;
        
            console.log(restaurantData);
            let msg2 = await db.put(TABLE_NAME, restaurantData);
            //console.log(msg);
            return msg;
        }catch(err) {
            throw err;
        }
    }

    async deletePicture() {
        try {
            let restaurant_id = this.reqData.params.restaurant_id;
            let restaurantData = await db.queryById(TABLE_NAME, restaurant_id);

	        let path = "restaurants/"+restaurant_id+"/pictures";

            if(typeof this.reqData.queryString.key == 'undefined'){
                console.log("qq");
                throw null;
            }
            let file_name = this.reqData.queryString.key;
            if(typeof restaurantData.photo[file_name] == 'undefined'){
                console.log("not found");
                throw null;
            }

            let msg = await S3.deleteS3Obj(path + "/" + file_name);

             //update db
            delete restaurantData.photo[file_name];
        
            console.log(restaurantData);
            let msg2 = await db.put(TABLE_NAME, restaurantData);           
            return msg;
        }catch(err) {
            throw err;
        }
    }
}


export default Restaurant;