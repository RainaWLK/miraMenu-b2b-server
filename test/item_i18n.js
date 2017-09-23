import CommonTest from './common.js';
let _ = require('lodash');
let itemTest = require('./item');
let utils = require('./utils');

let URI = "/restaurants/{restaurant_id}/branches/{branch_id}/items/{item_id}/i18n";
let URI_ID = URI + '/{i18n_id}';
let URI_prototype = URI;

let ITEM_URI_ID = "/restaurants/{restaurant_id}/branches/{branch_id}/items/{item_id}";

let languageForm = {
  "data": {
    "type": "i18n",
    "attributes": [{
      "default": "en-us",
      "data": {
          "zh-hant": "蘋果",
          "jp": "りんご",
          "en-us": "apple",
          "kr": "애플"
      }
    }]
  }
}

let languageSingleForm = {
  "data": {
    "type": "i18n",
    "attributes": {
      "default": "en-us",
      "data": {
          "zh-hant": "蘋果",
          "jp": "りんご",
          "en-us": "apple",
          "kr": "애플"
      }
    }
  }
}

let itemSampleData = {
  "data": {
    "type": "items",
    "attributes": {
        "name": "food 01",
        "desc": "milk",
        "category": "common breakfast",
        "list_price": "99.99",
        "sale_price": "80",
        "tag": ["...."],
        "note": ["zzzzz"],
        "photos": [],
        "nutrition": "366 cal",
        "availability": true,
        "ingredients": "fish, zzz",
        "inventory": "Sufficient"
    }
  }
}



function i18nTest() {
  let op;
  let parent_idArray;
  let i18n_idArray;
  let fullid;
  let i18n_fullid;
  let i18n_id;


  before('prepare data', () => {
    op = new CommonTest(URI_prototype);
  });

  describe(URI+' test', () => {
    describe('item i18n test', () => {

      before(async () => {
        parent_idArray = await prepareTest();
        fullid = utils.makeFullID(parent_idArray);
        return;
      });

      it('Add i18n string: POST '+URI, async () => {
        let input = _.cloneDeep(languageForm);
        let myURI_ID = utils.getURI(URI, parent_idArray);

        let res = await op.checkOperation('POST', myURI_ID, input, null);
        i18n_id = res.body.data[0].id;
        i18n_fullid = fullid+i18n_id;
        i18n_idArray = utils.parseID(i18n_fullid);
      });

      it('check i18n data: GET '+URI_ID, async () => {
        let output = _.cloneDeep(languageSingleForm);
        let myURI_ID = utils.getURI(URI_ID, i18n_idArray);

        //check
        let res = await op.checkOperation('GET', myURI_ID, null, output);
        res.body.data.should.have.deep.property('id', i18n_fullid);
      });

      it('change i18n data: PATCH ' + URI_ID, async () => {
        let input = _.cloneDeep(languageSingleForm);
        input.data.attributes.data["orc"] = "泡麵";
        let myURI_ID = utils.getURI(URI_ID, i18n_idArray);
  
        let res = await op.checkOperation('PATCH', myURI_ID, input, input);
        res.body.data.should.have.deep.property('id', i18n_fullid);
      });

      it('check i18n data: GET '+URI_ID, async () => {
        let output = _.cloneDeep(languageSingleForm);
        output.data.attributes.data["orc"] = "泡麵";
        let myURI_ID = utils.getURI(URI_ID, i18n_idArray);

        //check
        let res = await op.checkOperation('GET', myURI_ID, null, output);
        res.body.data.should.have.deep.property('id', i18n_fullid);
      });

      it('set desc string: PATCH ' + ITEM_URI_ID, async () => {
        let i18nString = "i18n::"+i18n_id;
        let input = _.cloneDeep(itemSampleData);
        input.data.attributes.desc = i18nString;
        let myURI_ID = utils.getURI(ITEM_URI_ID, parent_idArray);
  
        let res = await op.pureOperation('PATCH', myURI_ID, input);
        res.body.data.attributes.should.have.deep.property('desc', i18nString);
      });

      it('check default translation: GET '+ITEM_URI_ID, async () => {
        let myURI_ID = utils.getURI(ITEM_URI_ID, parent_idArray);

        //check
        let res = await op.pureOperation('GET', myURI_ID, null);
        res.body.data.attributes.should.have.property('desc', "apple");
      });

      it('check translation: GET '+ITEM_URI_ID, async () => {
        let myURI_ID = utils.getURI(ITEM_URI_ID, parent_idArray);
        myURI_ID += "?lang=orc";

        //check
        let res = await op.pureOperation('GET', myURI_ID, null);
        res.body.data.attributes.should.have.property('desc', "泡麵");
      });

      it('check non-exist translation: GET '+ITEM_URI_ID, async () => {
        let myURI_ID = utils.getURI(ITEM_URI_ID, parent_idArray);
        myURI_ID += "?lang=orz";

        //check
        let res = await op.pureOperation('GET', myURI_ID, null);
        res.body.data.attributes.should.have.property('desc', "apple");
      });

      after(async () => {
        await cleanTest(i18n_idArray);
        return;
      });

    });
  });
}

async function prepareTest(){
  //create parent
  let idArray = await itemTest.prepareTest();

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
  await itemTest.cleanTest(idArray);
  return;
}

function go() {
  i18nTest();
};
exports.go = go;
exports.prepareTest = prepareTest;
exports.cleanTest = cleanTest;