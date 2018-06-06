let env = require('./enviroment.js');
let CommonTest = require('./common.js');
let _ = require('lodash');
let utils = require('./utils');
let photoTest = require('./phototest');

var expect = env.chai.expect;

let URI = '/v1/restaurants';
let URI_ID = URI+"/{restaurant_id}";

let sampleData = {
    "type": "restaurants",
    "default_language": "en-us",
    "language": "en-us",
    "attributes": {
        "social": {
            "facebook": "htttps://www.facebook.com/testraman"
        },
//        "photos": [],
        "geolocation": {
          "zipcode": "12790"
        },
        "address": "mage dist NO.1, stormwind",
        "tel": "02-33333333",
        "category": "japanese",
        "name": "jumi raman",
        "desc": "This is a auto test data: Raman"
    }
}

let sampleDataTW = {
  "type": "restaurants",
  "default_language": "en-us",
  "language": "zh-tw",
  "attributes": {
      "social": {
          "facebook": "htttps://www.facebook.com/testraman"
      },
//        "photos": [],
      "geolocation": {
        "zipcode": "12790"
      },
      "address": "法師區 NO.1, stormwind",
      "tel": "02-33333333",
      "category": "japanese",
      "name": "啾咪拉麵",
      "desc": "自動測試資料：拉麵"
  }
}

let sample = {"data": sampleData};
let sampleArray = {"data": []};

function restaurantTest() {
  let op = new CommonTest(URI);
  let idArray;
  let fullid;

  describe(URI+' test', () => {
    describe('CRUD test', () => {

      before(async () => {
        idArray = await prepareTest();
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

function restaurantByIDTest() {
  let op = new CommonTest(URI_ID);
  let idArray;
  let fullid;

  describe(URI+'/{id} test', () => {
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

    it('set data with another language "zh-tw": PATCH ' + URI_ID, async () => {
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
	
    it('change default to non-existed language "orc": PATCH ' + URI_ID, async () => {
      let myURI_ID = utils.getURI(URI_ID, parent_idArray);
      let twData = _.cloneDeep(sampleDataTW);
      twData.default_language = "orc";
      
			let input = {"data": twData};

      let res = await op.checkOperation('PATCH', myURI_ID, input, null);
      res.body.data.should.have.deep.property('id', fullid);
      res.body.data.should.have.deep.property('language', input.data.language);
      res.body.data.should.have.deep.property('default_language', sampleDataTW.default_language);
    });
    
    it('check default translation: GET '+URI_ID, async () => {
      let output = _.cloneDeep(sample);
      //output.data.attributes.desc = "囧";
      let myURI_ID = utils.getURI(URI_ID, parent_idArray);

      let res = await op.checkOperation('GET', myURI_ID, null, output);
      res.body.data.should.have.deep.property('id', fullid);
      res.body.data.should.have.deep.property('language', output.data.language);
    });
	
    it('change default language "zh-tw": PATCH ' + URI_ID, async () => {
      let myURI_ID = utils.getURI(URI_ID, parent_idArray);
      let twData = _.cloneDeep(sampleDataTW);
      twData.default_language = twData.language;
      
			let input = {"data": twData};
			console.log(input.data.language);

      let res = await op.checkOperation('PATCH', myURI_ID, input, input);
      res.body.data.should.have.deep.property('id', fullid);
      res.body.data.should.have.deep.property('language', input.data.language);
      //res.body.data.should.have.deep.property('default_language', input.data.language);
    });
    
    it('check default translation: GET '+URI_ID, async () => {
      let twData = _.cloneDeep(sampleDataTW);
      let output = {"data": twData};
      //output.data.attributes.desc = "囧";
      let myURI_ID = utils.getURI(URI_ID, parent_idArray);
      output.data.default_language = twData.language;

      let res = await op.checkOperation('GET', myURI_ID, null, output);
      res.body.data.should.have.deep.property('id', fullid);
      res.body.data.should.have.deep.property('language', output.data.language);
    });	
    
    //delete translation
    it('delete translation "zh-tw": DELETE '+URI_ID, async () => {
      let deleteLang = 'zh-tw';
      let myURI_ID = utils.getURI(URI_ID, parent_idArray) + '/i18n/'+deleteLang;

      let res = await op.pureOperation('DELETE', myURI_ID, null);
      
      expect(res.body.data.i18n).to.not.have.property(deleteLang);
      expect(res.body.data.i18n.default).to.not.equal(deleteLang);
    });
    
    it('check default translation: GET '+URI_ID, async () => {
      let output = _.cloneDeep(sample);
      //output.data.attributes.desc = "囧";
      let myURI_ID = utils.getURI(URI_ID, parent_idArray);

      let res = await op.checkOperation('GET', myURI_ID, null, output);
      res.body.data.should.have.deep.property('id', fullid);
      res.body.data.should.have.deep.property('language', output.data.language);
    });
    
    //delete translation
    it('delete all translation : DELETE '+URI_ID, async () => {
      let deleteLang = 'en-us';
      let myURI_ID = utils.getURI(URI_ID, parent_idArray) + '/i18n/'+deleteLang;

      let res = await op.pureOperation('DELETE', myURI_ID, null);
      
      expect(res.statusCode).to.equal(403);
    });
    
    it('check default translation: GET '+URI_ID, async () => {
      let output = _.cloneDeep(sample);
      //output.data.attributes.desc = "囧";
      let myURI_ID = utils.getURI(URI_ID, parent_idArray);

      let res = await op.checkOperation('GET', myURI_ID, null, output);
      res.body.data.should.have.deep.property('language', output.data.language);
      
      expect(res.body.data.i18n).to.have.property(output.data.language);
      expect(res.body.data.i18n.default).to.equal(output.data.language);
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
    return;
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
  let op = new CommonTest(URI);
  let input = _.cloneDeep(sample);
  let output = _.cloneDeep(sample);

  //output.data.attributes.social.facebook = "囧";
  let res = await op.checkOperation('POST', URI, input, output);

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
  return;
}

function go() {
  //restaurantByIDTest();
  //restaurantTest();
  translationTest();
  //photoUploadTest();
};

exports.go = go;
exports.prepareTest = prepareTest;
exports.cleanTest = cleanTest;

