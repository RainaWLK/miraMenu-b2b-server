let env = require('./enviroment.js');
let CommonTest = require('./common.js');
let _ = require('lodash');
let branchTest = require('./branch');
let utils = require('./utils');
let request = require('supertest');
let serv = request(env.server);

var expect = env.chai.expect;

let URI = "/v1/restaurants/{restaurant_id}/branches/{branch_id}/items";
let URI_ID = URI+"/{item_id}";

let sampleData = {
  "type": "items",
  "language": "en-us",
  "attributes": {
      "name": "food 01",
      "desc": "milk",
      "category": "common breakfast",
      "list_price": "99.99",
      "sale_price": "80",
      "tag": ["...."],
      "note": ["zzzzz"],
//      "photos": [],
      "nutrition": "366 cal",
      "availability": true,
      "ingredients": ["fish", "zzz"],
      "inventory": "Sufficient"
  }
}

let sampleDataTW = {
  "type": "items",
  "language": "zh-tw",
  "attributes": {
      "name": "一號",
      "desc": "牛奶",
      "category": "common breakfast",
      "list_price": "99.99",
      "sale_price": "80",
      "tag": ["...."],
      "note": ["囧"],
//      "photos": [],
      "nutrition": "366卡",
      "availability": true,
      "ingredients": ["魚", "雜七雜八"],
      "inventory": "Sufficient"
  }
}

let sample = {"data": sampleData};
let sampleArray = {"data": []};

function itemTest() {
  let op;
  let idArray;
  let fullid;

  before('prepare data', () => {
    op = new CommonTest(URI);
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

function itemByIDTest() {
  let op;
  let idArray;
  let fullid;

  before('prepare data', () => {
    op = new CommonTest(URI_ID);
  });

  describe(URI_ID+' test', () => {
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
	    input.data.attributes.desc = "泡麵";

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

function itemDeleteTest() {
  /*let idArray = {
    r: '1531207779057',
    s: '1534748388645',
    i: '1536689023262',
    m: '1536602589978'
  };
  let fullid = `r${idArray.r}s${idArray.s}i${idArray.i}`;*/
  
  let idArray2 = {
    r: '1531207779057',
    i: '1536690286083'
  };
  let fullid2 = `r${idArray2.r}i${idArray2.i}`;
  
  let idArray;
  let fullid;

  describe('itemDeleteTest', () => {
    it('prepare data', async () => {
      idArray = await prepareTest();
      fullid = utils.makeFullID(idArray);
    });
    
    it('register into menu', async () => {

    });
    
    it('delete item', async () => {
      let myURI_ID = utils.getURI(URI_ID, idArray);

      let res = await serv.delete(myURI_ID).expect(204);
      //console.log(res.body);
    });
    
    it('check item existed', async () => {
      let myURI_ID = utils.getURI(URI_ID, idArray);
      let res = await serv.get(myURI_ID).expect(404);
    });
    
    it('check item unregistation', async () => {
      let myURI_ID = utils.getURI('/v1/restaurants/{restaurant_id}/branches/{branch_id}/menus/{menu_id}', idArray);
      let res = await serv.get(myURI_ID);
      console.log(res.body.data.attributes);
      
      res.body.data.attributes.sections.forEach(section => {
        expect(section.items).to.not.include(fullid);
      });
    });
    
    it('delete data', async () => {
      await cleanTest(idArray);
      return;
    });
  });
  /*
  describe('restaurant itemDeleteTest', () => {
    it('delete item', async () => {
      let myURI_ID = utils.getURI('/v1/restaurants/{restaurant_id}/items/{item_id}', idArray2);

      let res = await serv.delete(myURI_ID).expect(204);
      //console.log(res.body);
    });
    
    it('check item existed', async () => {
      let myURI_ID = utils.getURI(URI_ID, idArray);
      let res = await serv.get(myURI_ID).expect(404);
    });
    
    it('check item unregistation', async () => {
      let myURI_ID = utils.getURI('/v1/restaurants/{restaurant_id}/branches/{branch_id}/menus/{menu_id}', idArray);
      let res = await serv.get(myURI_ID);
      console.log(res.body.data.attributes);
      
      res.body.data.attributes.sections.forEach(section => {
        expect(section.items).to.not.include(fullid2);
      });
    });
  });*/
}

async function prepareTest(){
  let op = new CommonTest(URI);
  let input = _.cloneDeep(sample);
  let output = _.cloneDeep(sample);

  //create parent
  let branch_idArray = await branchTest.prepareTest();
  let myURI = utils.getURI(URI, branch_idArray);

  //output.data.attributes.social.facebook = "囧";
  //check
  describe('base data test', () => {
    it('check no content', async () => {
      let res = await op.pureOperation('GET', myURI, null);
      res.statusCode.should.eql(204);
    });
  });

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
  await branchTest.cleanTest(idArray);
  return;
}

function go() {
  //itemByIDTest();
  //itemTest();
  //translationTest();
  itemDeleteTest();
};
exports.go = go;
exports.prepareTest = prepareTest;
exports.cleanTest = cleanTest;