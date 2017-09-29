import CommonTest from './common.js';
let _ = require('lodash');
let restaurantTest = require('./restaurant');
let utils = require('./utils');

let URI = "/restaurants/{restaurant_id}/menus";
let URI_prototype = URI;

let sampleData = {
    "type": "menus",
    "language": "en-us",
    "attributes": {
      "name": "Menu 002",
      "menu_desc": "tuna set",
      "menu_cat": "breakfast",
      "menu_availability": true,
      "items": [],
      //"photos": [],
      "menu_hours": "24"
    }
}

let sampleDataTW = {
  "type": "menus",
  "language": "zh-tw",
  "attributes": {
    "name": "二號餐",
    "menu_desc": "鮪魚套餐",
    "menu_cat": "午餐",
    "menu_availability": true,
    "items": [],
    //"photos": [],
    "menu_hours": "24"
  }
}

let sample = {"data": sampleData};
let sampleArray = {"data": []};

function menuTest() {
  let URI_ID = URI+"/{menu_id}";
  let op;
  let idArray;
  let fullid;

  before('prepare data', () => {
    op = new CommonTest(URI_prototype);
  });

  describe(URI+' test', () => {
    describe('CRUD test', () => {

      before(async () => {
        idArray = await prepareTest();
        
        URI_ID = URI+"/"+"m"+idArray.m;
        fullid = utils.makeFullID(idArray);
        return;
      });

      it('check data saved: GET '+URI, async () => {
        let output = _.cloneDeep(sampleData);
        let outputArray = _.cloneDeep(sampleArray);
        output.id = fullid;
        //output.attributes.location.tel = "012-3345678";
        //output.attributes.desc = "囧";
        outputArray.data.push(output);

        let res = await op.checkOperation('GET', URI, null, outputArray);
      });

      after(async () => {
        await cleanTest(idArray);
        return;
      });
    });
  });
}

function menuByIDTest() {
  let URI_ID = URI+"/{menu_id}";
  let op;
  let idArray;
  let fullid;

  before('prepare data', () => {
    op = new CommonTest(URI_ID);
  });

  describe(URI_ID+' test', () => {
    it('set data: POST ' + URI, async () => {
      idArray = await prepareTest();

      URI_ID = URI+"/"+"m"+idArray.m;
      fullid = utils.makeFullID(idArray);
      return;
    });


    it('check data saved: GET '+URI_ID, async () => {
      let output = _.cloneDeep(sample);
      //output.data.attributes.desc = "囧";

      let res = await op.checkOperation('GET', URI_ID, null, output);
      res.body.data.should.have.deep.property('id', fullid);
    });

    it('set data: PATCH ' + URI_ID, async () => {
			let input = _.cloneDeep(sample);
	    input.data.attributes.menu_desc = "泡麵";

      let res = await op.checkOperation('PATCH', URI_ID, input, input);
      res.body.data.should.have.deep.property('id', fullid);

      //check
      res = await op.checkOperation('GET', URI_ID, null, input);
      res.body.data.should.have.deep.property('id', fullid);
    });
	
    it('delete data: DELETE '+URI_ID, async () => {
      await cleanTest(idArray);
      return;
    });

  });
}


function translationTest() {
  let URI_ID = URI+"/{menu_id}";
  let op;
  let parent_idArray;
  let fullid;

  before('prepare data', () => {
    op = new CommonTest(URI_ID);
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


async function prepareTest(){
  let op = new CommonTest(URI_prototype);
  let input = _.cloneDeep(sample);
  let output = _.cloneDeep(sample);

  //create parent
  let restaurant_id = await restaurantTest.prepareTest();
  URI = '/restaurants/'+restaurant_id+'/menus';

  //output.data.attributes.social.facebook = "囧";
  let res = await op.checkOperation('POST', URI, input, output);
  let idArray = utils.parseID(res.body.data.id);
  return idArray;
}

async function cleanTest(idArray){
  let op = new CommonTest();
  let URI_ID = '/restaurants/'+'r'+idArray.r+'/menus/'+'m'+idArray.m;

  await op.checkOperation('DELETE', URI_ID, null, "");

  //check
  let res = await op.pureOperation('GET', URI_ID, null);
  res.statusCode.should.eql(404);

  //delete parent
  await restaurantTest.cleanTest("r"+idArray.r);
  return;
}

function go() {
  menuByIDTest();
  menuTest();
  translationTest();
};
exports.go = go;
exports.prepareTest = prepareTest;
exports.cleanTest = cleanTest;