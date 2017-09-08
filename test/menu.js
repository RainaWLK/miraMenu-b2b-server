import CommonTest from './common.js';
let _ = require('lodash');
let branchTest = require('./branch');
let utils = require('./utils');

let URI = "/restaurants/{restaurant_id}/branches/{branch_id}/menus";
let URI_prototype = URI;

let sampleData = {
    "type": "menus",
    "attributes": {
      "name": "Menu 002",
      "menu_desc": "鮪魚套餐",
      "menu_cat": "breakfast",
      "menu_availability": true,
      "items": [],
      "photos": [],
      "menu_hours": "24"
    }
}

let sample = {"data": sampleData};

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
        fullid = "r"+idArray.r+"s"+idArray.s+"m"+idArray.m;
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
      fullid = "r"+idArray.r+"s"+idArray.s+"m"+idArray.m;
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



async function prepareTest(){
  let op = new CommonTest(URI_prototype);
  let input = _.cloneDeep(sample);
  let output = _.cloneDeep(sample);

  //create parent
  let branch_idArray = await branchTest.prepareTest();
  URI = '/restaurants/'+"r"+branch_idArray.r+'/branches/'+"s"+branch_idArray.s+'/menus';

  //output.data.attributes.social.facebook = "囧";
  let res = await op.checkOperation('POST', URI, input, output);
  let idArray = utils.parseID(res.body.data.id);
  return idArray;
}

async function cleanTest(idArray){
  let op = new CommonTest();
  let URI_ID = '/restaurants/'+'r'+idArray.r+'/branches/'+'s'+idArray.s+'/menus/'+'m'+idArray.m;

  await op.checkOperation('DELETE', URI_ID, null, "");

  //check
  let res = await op.pureOperation('GET', URI_ID, null);
  //res.should.have.status(404);
  res.statusCode.should.eql(404);

  //delete parent
  await branchTest.cleanTest(idArray);
  return;
}

function go() {
    menuByIDTest();
		menuTest();
		
		//menuByIDTest_restaurant();
		//menuTest_restaurant();
};
exports.go = go;
exports.prepareTest = prepareTest;
exports.cleanTest = cleanTest;


//沒item時
//restaurant menu + branch menu混合
//沒restaurant menu，只有branch menu時
