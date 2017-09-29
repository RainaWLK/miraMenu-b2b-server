import CommonTest from './common.js';
let _ = require('lodash');
let utils = require('./utils');

let URI = '/restaurants';

let sampleData = {
    "type": "restaurants",
    "language": "en-us",
    "attributes": {
        "social": {
            "facebook": "htttps://www.facebook.com/testraman"
        },
//        "photos": [],
        "location": {
            "continent": "asia",
            "country": "japan",
            "address": "Ikebukuro, 1町目123-1",
            "city": "tokyo",
            "dist": "Ikebukuro",
            "tel": "012-3345678",
            "state": "tokyo"
        },
        "category": "japanese",
        "name": "jumi raman",
        "desc": "This is a auto test data: Raman"
    }
}

let sampleDataTW = {
  "type": "restaurants",
  "language": "zh-tw",
  "attributes": {
      "social": {
          "facebook": "htttps://www.facebook.com/testraman"
      },
//        "photos": [],
      "location": {
          "continent": "asia",
          "country": "japan",
          "address": "Ikebukuro, 1町目123-1",
          "city": "tokyo",
          "dist": "Ikebukuro",
          "tel": "012-3345678",
          "state": "tokyo"
      },
      "category": "日式",
      "name": "啾咪拉麵",
      "desc": "自動測試資料：拉麵"
  }
}

let sample = {"data": sampleData};
let sampleArray = {"data": []};

function restaurantTest() {
  let URI_ID = URI+"/{restaurant_id}";
  let op = new CommonTest(URI);
  let id;

  describe(URI+' test', () => {
    describe('CRUD test', () => {

      before(async () => {
        id = await prepareTest();
        URI_ID = URI+"/"+id;
        return;
      });

      it('check data saved: GET '+URI, async () => {
        let output = _.cloneDeep(sampleData);
        let outputArray = _.cloneDeep(sampleArray);
        output.id = id;
        //output.attributes.location.tel = "012-3345678";
        //output.attributes.desc = "囧";
        outputArray.data.push(output);

        let res = await op.checkOperation('GET', URI, null, outputArray);
      });

      after(async () => {
        await cleanTest(id);
        return;
      });
    });
  });
}

function restaurantByIDTest() {
  let URI_ID = URI+"/{restaurant_id}";
  let op = new CommonTest(URI_ID);
  let id;

  describe(URI+'/{id} test', () => {
    it('set data: POST ' + URI, async () => {
      id = await prepareTest();
      URI_ID = URI+"/"+id;
      return;
    });

    it('check data saved: GET '+URI_ID, async () => {
      let output = _.cloneDeep(sample);
      //output.data.attributes.desc = "囧";

      let res = await op.checkOperation('GET', URI_ID, null, output);
      res.body.data.should.have.deep.property('id', id);
    });
	
    it('set data: PATCH ' + URI_ID, async () => {
      let input = _.cloneDeep(sample);
	    input.data.attributes.social["twitch"] = "https://www.twitch.tv/HNRT";

      let res = await op.checkOperation('PATCH', URI_ID, input, input);
      res.body.data.should.have.deep.property('id', id);

      //check
      res = await op.checkOperation('GET', URI_ID, null, input);
      res.body.data.should.have.deep.property('id', id);
    });


    it('delete data: DELETE '+URI_ID, async () => {
      await cleanTest(id);
      return;
    });

  });
}


function translationTest() {
  let URI_ID = URI+"/{restaurant_id}";
  let op;
  let parent_idArray;
  let fullid;

  before('prepare data', () => {
    op = new CommonTest(URI_ID);
  });

  describe(URI_ID+' test', () => {
    before(async () => {
      let id = await prepareTest();
      id = id.substring(1);
      parent_idArray = {
        'r': id
      };
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
      await cleanTest('r'+parent_idArray.r);
      return;
    });

  });
}

async function prepareTest(){
  let op = new CommonTest(URI);
  let id;
  let input = _.cloneDeep(sample);
  let output = _.cloneDeep(sample);

  //output.data.attributes.social.facebook = "囧";
  let res = await op.checkOperation('POST', URI, input, output);
  id = res.body.data.id;
  return id;
}

async function cleanTest(id){
  let op = new CommonTest();
  let URI_ID = URI+"/"+id;

  await op.checkOperation('DELETE', URI_ID, null, "");

  //check
  let res = await op.pureOperation('GET', URI_ID, null);
  res.statusCode.should.eql(404);
  return;
}

function go() {
  restaurantByIDTest();
  restaurantTest();
  translationTest();
};

exports.go = go;
exports.prepareTest = prepareTest;
exports.cleanTest = cleanTest;

