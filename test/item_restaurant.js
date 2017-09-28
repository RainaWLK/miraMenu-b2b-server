import CommonTest from './common.js';
let _ = require('lodash');
let restaurantTest = require('./restaurant');
let utils = require('./utils');

let URI = "/restaurants/{restaurant_id}/items";
let URI_prototype = URI;

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

let sample = {"data": sampleData};

function itemTest() {
  let URI_ID = URI+"/{item_id}";
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
        
        URI_ID = URI+"/"+"i"+idArray.i;
        fullid = "r"+idArray.r+"i"+idArray.i;
        return;
      });

      it('check data saved: GET '+URI, async () => {
        let output = _.cloneDeep(sample);
        output.data.id = fullid;
        //output.data.attributes.location.tel = "012-3345678";
        //output.data.attributes.desc = "囧";

        let res = await op.checkOperation('GET', URI, null, null);
        res.body.data.should.include.something.that.deep.equal(output.data);
      });

      after(async () => {
        await cleanTest(idArray);
        return;
      });
    });
  });
}

function itemByIDTest() {
  let URI_ID = URI+"/{item_id}";
  let op;
  let idArray;
  let fullid;

  before('prepare data', () => {
    op = new CommonTest(URI_ID);
  });

  describe(URI_ID+' test', () => {
    it('set data: POST ' + URI, async () => {
      idArray = await prepareTest();

      URI_ID = URI+"/"+"i"+idArray.i;
      fullid = "r"+idArray.r+"i"+idArray.i;
      return;
    });


    it('check data saved: GET '+URI_ID, async () => {
      let output = _.cloneDeep(sample);
      //output.data.attributes.item_desc = "囧";

      let res = await op.checkOperation('GET', URI_ID, null, output);
      res.body.data.should.have.deep.property('id', fullid);
    });

    it('set data: PATCH ' + URI_ID, async () => {
			let input = _.cloneDeep(sample);
	    input.data.attributes.item_desc = "泡麵";

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



async function prepareTest(){
  let op = new CommonTest(URI_prototype);
  let input = _.cloneDeep(sample);
  let output = _.cloneDeep(sample);

  //create parent
  let restaurant_id = await restaurantTest.prepareTest();
  URI = '/restaurants/'+restaurant_id+'/items';

  //output.data.attributes.social.facebook = "囧";
  let res = await op.checkOperation('POST', URI, input, output);
  let idArray = utils.parseID(res.body.data.id);
  return idArray;
}

async function cleanTest(idArray){
  let op = new CommonTest();
  let URI_ID = '/restaurants/'+'r'+idArray.r+'/items/'+'i'+idArray.i;

  await op.checkOperation('DELETE', URI_ID, null, "");

  //check
  let res = await op.pureOperation('GET', URI_ID, null);
  res.statusCode.should.eql(404);

  //delete parent
  await restaurantTest.cleanTest("r"+idArray.r);
  return;
}

function go() {
  itemByIDTest();
  itemTest();
};
exports.go = go;
exports.prepareTest = prepareTest;
exports.cleanTest = cleanTest;