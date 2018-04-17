import CommonTest from './common.js';
let _ = require('lodash');
let restaurantTest = require('./restaurant.js');
let photoTest = require('./phototest.js');
let utils = require('./utils.js');

let URI = "/v1/restaurants/{restaurant_id}/branches";
let URI_ID = URI+"/{branch_id}";

let sampleData = {
    "type": "branches",
    "default_language": "en-us",
    "language": "en-us",
    "attributes": {
      "name": "branch 2",
      "desc": "gg seafood branch 2 zz",
      "category": "seafood",
      "geolocation": {
        "zipcode": "12790"
      },
      "address": "mage dist NO.1, stormwind",
      "tel": "02-33333333",
      "currency": "TWD",
      "social": {
        "web": "https://www.ggseafood.com/2"
      },
      "total_table": 50,
      "capacity": 250,
      "branch_hours": "Mon 9:00-12:00, 17:00-23:00; Tue 6:00-9:00, 11:00-13:30, 17:00-23:00",
//      "photos": [],
      "level": 4,
      "rating": 4.5,
      "floor_plan": [
        {
          "table_id": "t001",
          "shape": "rectangle",
          "x": 40,
          "y": 20,
          "width": 20,
          "height": 10
        },
        {
          "table_id": "t002",
          "shape": "round",
          "x": 20,
          "y": 40,
          "width": 10,
          "height": 10
        }
      ],
      "tag": [
        "吱吱"
      ],
      "tables": [],
      "details": "zzz",
      "priority_pass": true,
      "priority_meal": false,
      "guarantee_best_seat": true,
      "welcome_drink": true,
      "appetizer_discount": true,
      "special_event": [
        "birthday cake",
        "anniversary flower"
      ],
      "minimum_order": "0"
    }
  };

let sampleDataTW = {
  "type": "branches",
  "default_language": "en-us",
  "language": "zh-tw",
  "attributes": {
    "name": "二號店",
    "desc": "吱吱海產二號店zz",
    "category": "seafood",
    "geolocation": {
      "zipcode": "12790"
    },
    "address": "吱吱漁港二號碼頭",
    "tel": "02-33333333",
    "currency": "TWD",
    "social": {
      "web": "https://www.ggseafood.com/2"
    },
    "total_table": 50,
    "capacity": 250,
    "branch_hours": "Mon 9:00-12:00, 17:00-23:00; Tue 6:00-9:00, 11:00-13:30, 17:00-23:00",
//      "photos": [],
    "level": 4,
    "rating": 4.5,
    "floor_plan": [
      {
        "table_id": "t001",
        "shape": "rectangle",
        "x": 40,
        "y": 20,
        "width": 20,
        "height": 10
      },
      {
        "table_id": "t002",
        "shape": "round",
        "x": 20,
        "y": 40,
        "width": 10,
        "height": 10
      }
    ],
    "tag": [
      "吱吱"
    ],
    "tables": [],
    "details": "囧",
    "priority_pass": true,
    "priority_meal": false,
    "guarantee_best_seat": true,
    "welcome_drink": true,
    "appetizer_discount": true,
    "special_event": [
      "生日蛋糕",
      "週年花束"
    ],
    "minimum_order": "0"
  }
};

let ignoreKeys = [
  "qrcode"
];

let sample = {"data": sampleData};
let sampleArray = {"data": []};

function branchTest() {
  let op;
  let idArray;
  let fullid;

  before('prepare data', () => {
    op = new CommonTest(URI, ignoreKeys);
  });

  describe(URI+' test', () => {
    describe('CRUD test', () => {

      before(async () => {
        idArray = await prepareTest();
        fullid = utils.makeFullID(idArray);
        return;
      });

      it('check data saved: GET '+URI, async () => {
        let myURI = utils.getURI(URI, idArray);
        let output = _.cloneDeep(sampleData);
        let outputArray = _.cloneDeep(sampleArray);
        output.id = fullid;
        //output.attributes.location.tel = "012-3345678";
        //output.attributes.desc = "囧";
        outputArray.data.push(output);

        let res = await op.checkOperation('GET', myURI, null, outputArray);
      });

      after(async () => {
        await cleanTest(idArray);
        return;
      });
    });
  });
}

function branchByIDTest() {
  let op;
  let idArray;
  let fullid;

  before('prepare data', () => {
    op = new CommonTest(URI_ID, ignoreKeys);
  });

  describe('/restaurants/{restaurant_id}/branches/{branch_id} test', () => {
    it('set data: POST ' + URI, async () => {
      idArray = await prepareTest();
      fullid = utils.makeFullID(idArray);
      return;
    });


    it('check data saved: GET '+URI_ID, async () => {
      let myURI_ID = utils.getURI(URI_ID, idArray);
      let output = _.cloneDeep(sample);
      //output.data.attributes.desc = "囧";

      let res = await op.checkOperation('GET', myURI_ID, null, output);
      res.body.data.should.have.deep.property('id', fullid);
    });

    it('check qr code existed: GET '+URI_ID, async () => {
      let myURI_ID = utils.getURI(URI_ID, idArray);
      let output = _.cloneDeep(sample);
      //output.data.attributes.desc = "囧";

      let res = await op.pureOperation('GET', myURI_ID, null);
      let qrcode_url = res.body.data.attributes.qrcode;

      res = await photoTest.doDownload(qrcode_url);
      res.statusCode.should.eql(200);
    });

    it('set data: PATCH ' + URI_ID, async () => {
      let myURI_ID = utils.getURI(URI_ID, idArray);
      let input = _.cloneDeep(sample);
	    input.data.attributes.social["twitch"] = "https://www.twitch.tv/HNRT";

      let res = await op.checkOperation('PATCH', myURI_ID, input, input);
      res.body.data.should.have.deep.property('id', fullid);

      //check
      res = await op.checkOperation('GET', myURI_ID, null, input);
      res.body.data.should.have.deep.property('id', fullid);
    });
	
    it('delete data: DELETE '+URI_ID, async () => {
      await cleanTest(idArray);
      return;
    });

  });
}


function translationTest() {
  let op;
  let parent_idArray;
  let fullid;

  before('prepare data', () => {
    op = new CommonTest(URI_ID, ignoreKeys);
  });

  describe(URI_ID+' test', () => {
    before(async () => {
      parent_idArray = await prepareTest();
      fullid = utils.makeFullID(parent_idArray);
      return;
    });

    it('check data saved: GET '+URI_ID, async () => {
      let output = _.cloneDeep(sample);
      //output.data.attributes.desc = "囧";
      let myURI_ID = utils.getURI(URI_ID, parent_idArray);

      let res = await op.checkOperation('GET', myURI_ID, null, output);
      res.body.data.should.have.deep.property('id', fullid);
      res.body.data.should.have.deep.property('language', output.data.language);

      //how to check i18n structure?
    });

    it('set data with another language: PATCH ' + URI_ID, async () => {
      let myURI_ID = utils.getURI(URI_ID, parent_idArray);
      let twData = _.cloneDeep(sampleDataTW);
			let input = {"data": twData};

      let res = await op.checkOperation('PATCH', myURI_ID, input, input);
      res.body.data.should.have.deep.property('id', fullid);
      res.body.data.should.have.deep.property('language', input.data.language);
    });

    it('check default translation: GET '+URI_ID, async () => {
      let output = _.cloneDeep(sample);
      //output.data.attributes.desc = "囧";
      let myURI_ID = utils.getURI(URI_ID, parent_idArray);

      let res = await op.checkOperation('GET', myURI_ID, null, output);
      res.body.data.should.have.deep.property('id', fullid);
      res.body.data.should.have.deep.property('language', output.data.language);
    });

    it('check translation: GET '+URI_ID+'?lang=zh-tw', async () => {
      let twData = _.cloneDeep(sampleDataTW);
			let output = {"data": twData};
      //output.data.attributes.desc = "囧";
      let myURI_ID = utils.getURI(URI_ID, parent_idArray);
      myURI_ID += "?lang=zh-tw";

      let res = await op.checkOperation('GET', myURI_ID, null, output);
      res.body.data.should.have.deep.property('id', fullid);
      res.body.data.should.have.deep.property('language', output.data.language);
    });

    it('check non-extsted translation: GET '+URI_ID+'?lang=orc', async () => {
      let output = _.cloneDeep(sample);
      //output.data.attributes.desc = "囧";
      let myURI_ID = utils.getURI(URI_ID, parent_idArray);
      myURI_ID += "?lang=orc";

      let res = await op.checkOperation('GET', myURI_ID, null, output);
      res.body.data.should.have.deep.property('id', fullid);
      res.body.data.should.have.deep.property('language', output.data.language);
    });
	
    it('delete data: DELETE '+URI_ID, async () => {
      await cleanTest(parent_idArray);
      return;
    });

  });
}

function photoUploadTest(){
  let myURI = URI_ID+"/photos";
  let myURI_ID = myURI+"/{photo_id}";
  let idArray;
  before(async () => {
    idArray = await prepareTest();
  });
  it('generic photo upload test', async () => {
    photoTest.photoTest(idArray, myURI, myURI_ID);
  });

  after(async () => {
    await cleanTest(idArray);
    return;
  });
}

async function prepareTest(){
  let op = new CommonTest(URI, ignoreKeys);
  let input = _.cloneDeep(sample);
  let output = _.cloneDeep(sample);

  //create parent
  let parent_idArray = await restaurantTest.prepareTest();
  let myURI = utils.getURI(URI, parent_idArray);

  //check
  describe('base data test', () => {
    it('check no content', async () => {
      let res = await op.pureOperation('GET', myURI, null);
      res.statusCode.should.eql(204);
    });
  });

  //output.data.attributes.social.facebook = "囧";
  let res = await op.checkOperation('POST', myURI, input, output);
  let idArray = utils.parseID(res.body.data.id);
  return idArray;
}

async function cleanTest(idArray){
  let op = new CommonTest();
  let myURI_ID = utils.getURI(URI_ID, idArray);

  await op.checkOperation('DELETE', myURI_ID, null, "");

  //check
  let res = await op.pureOperation('GET', myURI_ID, null);
  res.statusCode.should.eql(404);

  //delete parent
  await restaurantTest.cleanTest(idArray);
  return;
}

function go() {
  branchByIDTest();
  branchTest();
  translationTest();
  //photoUploadTest();
};
exports.go = go;
exports.prepareTest = prepareTest;
exports.cleanTest = cleanTest;