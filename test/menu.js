let env = require('./enviroment.js');
let CommonTest = require('./common.js');
let _ = require('lodash');
let branchTest = require('./branch');
let photoTest = require('./phototest');
let utils = require('./utils');
let request = require('supertest');
let serv = request(env.server);

var expect = env.chai.expect;

let URI = "/v1/restaurants/{restaurant_id}/branches/{branch_id}/menus";
let URI_ID = URI+"/{menu_id}";

let sampleData = {
    "type": "menus",
    "language": "en-us",
    "attributes": {
      "name": "Menu 002",
      "desc": "tuna set",
      "category": "lunch",
      "availability": true,
      "sections": [{
        "name": "main",
        "items":[]
      },
      {
        "name": "dessert",
        "items":[]
      }],
      //"photos": [],
      "menu_hours": "24"
    }
}

let sampleDataTW = {
  "type": "menus",
  "language": "zh-tw",
  "attributes": {
    "name": "二號餐",
    "desc": "鮪魚套餐",
    "category": "lunch",
    "availability": true,
    "sections": [{
      "name": "主餐",
      "items":[]
    },
    {
      "name": "甜點",
      "items":[]
    }],
    //"photos": [],
    "menu_hours": "24"
  }
}

let sample = {"data": sampleData};
let sampleArray = {"data": []};

function menuTest() {
  let op;
  let idArray;
  let fullid;

  before('prepare data', () => {
    op = new CommonTest(URI);
    op.setIgnore({
      sections: [{
        id: ''
      }]
    });
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
        /*let output = _.cloneDeep(sample);
        output.data.id = fullid;
        //output.data.attributes.location.tel = "012-3345678";
        //output.data.attributes.desc = "囧";

        let res = await op.checkOperation('GET', URI, null, null);
        res.body.data.should.include.something.that.deep.equal(output.data);*/
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

function menuByIDTest() {
  let op;
  let idArray;
  let fullid;

  before('prepare data', () => {
    op = new CommonTest(URI_ID);
    op.setIgnore({
      sections: [{
        id: ''
      }]
    });
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
      
      res.body.data.attributes.sections.forEach(section => {
        expect(section).to.have.property('id');
      });
      
      
      //set id into sample data
      sampleData.attributes.sections = sampleData.attributes.sections.map(section => {
        let target = res.body.data.attributes.sections.find(element => element.name === section.name);
        if(target !== undefined){
          return target;
        }
        return section;
      });
      for(let i in sampleData.attributes.sections) {
        sampleDataTW.attributes.sections[i].id = sampleData.attributes.sections[i].id;
      }

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
    
    it('set section name with 2 language "zh-tw & orc": PATCH ' + URI_ID, async () => {
      let myURI_ID = utils.getURI(URI_ID, parent_idArray);
      let twData = _.cloneDeep(sampleDataTW);
			let input = {"data": twData};
			
			let testSection = {
        "name": "飲料",
        "items":[]
      };
      input.data.attributes.sections.push(testSection);

      let res = await op.checkOperation('PATCH', myURI_ID, input, input);
      res.body.data.should.have.deep.property('id', fullid);
      res.body.data.should.have.deep.property('language', input.data.language);
      testSection = res.body.data.attributes.sections.find(e => e.name===testSection.name);
      
      input.data.attributes.sections[2].id = testSection.id;
      input.data.attributes.sections[2].name = "飲品";
      
      //set zh-tw, change name to "飲品". should be the same id
      res = await op.checkOperation('PATCH', myURI_ID, input, input);
      testSection = res.body.data.attributes.sections.find(e => e.name==="飲品");
      expect(testSection.id).to.equal(input.data.attributes.sections[2].id);
      
      //set orc, should be the same id and named "lok-tar"
      input.data.language = 'orc';
      input.data.attributes.sections[2].name = "lok-tar";
      res = await op.checkOperation('PATCH', myURI_ID, input, input);
      testSection = res.body.data.attributes.sections.find(e => e.name==="lok-tar");
      expect(testSection.id).to.equal(input.data.attributes.sections[2].id);
      
      //check zh-tw, should be "飲品"
      res = await op.pureOperation('GET', myURI_ID+"?lang=zh-tw", null);
      testSection = res.body.data.attributes.sections.find(e => e.id===testSection.id);
      expect(testSection.name).to.equal("飲品");
    });
    
    //clear
    it('delete translation "orc": DELETE '+URI_ID, async () => {
      let deleteLang = 'orc';
      let myURI_ID = utils.getURI(URI_ID, parent_idArray) + '/i18n/'+deleteLang;

      let res = await op.pureOperation('DELETE', myURI_ID, null);
      
      expect(res.body.data.i18n).to.not.have.property(deleteLang);
      expect(res.body.data.i18n.default).to.not.equal(deleteLang);
    });
    
    //delete section
    it('delete a section: PATCH ' + URI_ID, async () => {
      let myURI_ID = utils.getURI(URI_ID, parent_idArray);
      let twData = _.cloneDeep(sampleDataTW);
      twData.attributes.sections = twData.attributes.sections.slice(1);
			let input = {"data": twData};

      let res = await op.checkOperation('PATCH', myURI_ID, input, input);
      res.body.data.should.have.deep.property('id', fullid);
      res.body.data.should.have.deep.property('language', input.data.language);
      expect(res.body.data.attributes.sections).to.deep.equal(twData.attributes.sections);
    });    
    
    it('check section: GET '+URI_ID+'?lang=zh-tw', async () => {
      let twData = _.cloneDeep(sampleDataTW);
      twData.attributes.sections = twData.attributes.sections.slice(1);
			let output = {"data": twData};
      //output.data.attributes.desc = "囧";
      let myURI_ID = utils.getURI(URI_ID, parent_idArray);
      myURI_ID += "?lang=zh-tw";

      let res = await op.checkOperation('GET', myURI_ID, null, output);
      res.body.data.should.have.deep.property('id', fullid);
      res.body.data.should.have.deep.property('language', output.data.language);
    });
    
    //restore section. section[1] should have zh-tw string only
    it('restore section: PATCH ' + URI_ID, async () => {
      let myURI_ID = utils.getURI(URI_ID, parent_idArray);
      let twData = _.cloneDeep(sampleDataTW);
			let input = {"data": twData};

      let res = await op.pureOperation('PATCH', myURI_ID, input);
      res.body.data.should.have.deep.property('id', fullid);
      res.body.data.should.have.deep.property('language', input.data.language);
    });   
    
    it('check translation: GET '+URI_ID, async () => {
      let enData = _.cloneDeep(sampleData);
			let output = {"data": enData};
      //output.data.attributes.desc = "囧";
      let myURI_ID = utils.getURI(URI_ID, parent_idArray);
      
      //check translation of section[0], should be zh-tw'
      output.data.attributes.sections[0].name = sampleDataTW.attributes.sections[0].name;

      let res = await op.checkOperation('GET', myURI_ID, null, output);
      expect(res.body.data).to.have.deep.property('language', output.data.language);
    });

    //delete translation
    it('delete default translation "en-us": DELETE '+URI_ID, async () => {
      let deleteLang = 'en-us';
      let myURI_ID = utils.getURI(URI_ID, parent_idArray) + '/i18n/'+deleteLang;

      let res = await op.pureOperation('DELETE', myURI_ID, null);
      
      expect(res.body.data.i18n).to.not.have.property(deleteLang);
      expect(res.body.data.i18n.default).to.not.equal(deleteLang);
    });
    
    it('check new default translation: GET '+URI_ID, async () => {
      let twData = _.cloneDeep(sampleDataTW);
			let output = {"data": twData};
      //output.data.attributes.desc = "囧";
      let myURI_ID = utils.getURI(URI_ID, parent_idArray);

      let res = await op.checkOperation('GET', myURI_ID, null, output);
      res.body.data.should.have.deep.property('language', output.data.language);
      
      expect(res.body.data.i18n).to.have.property(output.data.language);
      expect(res.body.data.i18n.default).to.equal(output.data.language);
    });
    
    //delete translation
    it('delete all translation : DELETE '+URI_ID, async () => {
      let deleteLang = 'zh-tw';
      let myURI_ID = utils.getURI(URI_ID, parent_idArray) + '/i18n/'+deleteLang;

      let res = await op.pureOperation('DELETE', myURI_ID, null);
      
      expect(res.statusCode).to.equal(403);
    });
    
    it('check default translation: GET '+URI_ID, async () => {
      let twData = _.cloneDeep(sampleDataTW);
			let output = {"data": twData};
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

function menuCreateTest() {
  let idArray;
  let fullid;

  describe('menuCreateTest', () => {
    it('perpare data: POST ' + URI, async () => {
      idArray = await prepareTest();
      fullid = utils.makeFullID(idArray);
      return;
    });


    it('check data saved: GET '+URI_ID, async () => {
      let myURI_ID = utils.getURI(URI_ID, idArray);
      let output = _.cloneDeep(sample);
      let res = await serv.get(myURI_ID).expect(200);
      //console.log(res.body);
  
      expect(res.body.data.id).to.equal(fullid);
    });
    
    it('check menu registation', async () => {
      let myURI_ID = utils.getURI('/v1/restaurants/{restaurant_id}/branches/{branch_id}', idArray);
      let res = await serv.get(myURI_ID);
      //console.log(res.body.data.attributes);
      
      expect(res.body.data.attributes.menus).to.include(fullid);
    });
	
    it('delete data: DELETE '+URI_ID, async () => {
      await cleanTest(idArray);
      return;
    });

  });
}


async function prepareTest(){
  let op = new CommonTest(URI);
  let input = _.cloneDeep(sample);
  let output = _.cloneDeep(sample);

  //create parent
  let branch_idArray = await branchTest.prepareTest();
  let myURI = utils.getURI(URI, branch_idArray);

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
  //res.should.have.status(404);
  res.statusCode.should.eql(404);

  //delete parent
  await branchTest.cleanTest(idArray);
  return;
}

function go() {
    //menuByIDTest();
    //menuTest();
    //translationTest();
    //photoUploadTest();
    menuCreateTest();
};
exports.go = go;
exports.prepareTest = prepareTest;
exports.cleanTest = cleanTest;


//沒item時
//restaurant menu + branch menu混合
//沒restaurant menu，只有branch menu時
