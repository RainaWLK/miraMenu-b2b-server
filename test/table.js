import CommonTest from './common.js';
let _ = require('lodash');
//let restaurantTest = require('./restaurant');
let branchTest = require('./branch');
let utils = require('./utils');

let URI = "/v1/restaurants/{restaurant_id}/branches/{branch_id}/tables";
let URI_prototype = URI;

let sampleData = {
    "type": "tables",
    "attributes": {
      "name": "Table 001",
      "table_desc": "1號桌",
      "availability": true,
      "total_seat": 6,
      "type": "square",
      "occupied": false,
      "tag": [
        "window facing",
        "accessibility",
        "private room"
      ],
      "table_hours": "Mon 9:00-12:00, 17:00-23:00; Tue 6:00-9:00, 11:00-13:30, 17:00-23:00"
    }
};

let sample = {"data": sampleData};
let sampleArray = {"data": []};

function tableTest() {
  let URI_ID = URI+"/{table_id}";
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
        
        URI_ID = URI+"/"+"t"+idArray.t;
        fullid = "r"+idArray.r+"s"+idArray.s+"t"+idArray.t;
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

function tableByIDTest() {
  let URI_ID = URI+"/{table_id}";
  let op;
  let idArray;
  let fullid;

  before('prepare data', () => {
    op = new CommonTest(URI_ID);
  });

  describe(URI_ID+' test', () => {
    it('set data: POST ' + URI, async () => {
      idArray = await prepareTest();

      URI_ID = URI+"/"+"t"+idArray.t;
      fullid = "r"+idArray.r+"s"+idArray.s+"t"+idArray.t;
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
      input.data.attributes['total_seat'] = 200;
          
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
  URI = '/restaurants/'+"r"+branch_idArray.r+'/branches/'+"s"+branch_idArray.s+'/tables';

  //output.data.attributes.social.facebook = "囧";
  let res = await op.checkOperation('POST', URI, input, output);
  let idArray = utils.parseID(res.body.data.id);
  return idArray;
}

async function cleanTest(idArray){
  let op = new CommonTest();
  let URI_ID = '/restaurants/'+'r'+idArray.r+'/branches/'+'s'+idArray.s+'/tables/'+'t'+idArray.t;

  await op.checkOperation('DELETE', URI_ID, null, "");

  //check
  let res = await op.pureOperation('GET', URI_ID, null);
  res.statusCode.should.eql(404);

  //delete parent
  await branchTest.cleanTest(idArray);
  return;
}

function go() {
    tableByIDTest();
    tableTest();
};
exports.go = go;
exports.prepareTest = prepareTest;
exports.cleanTest = cleanTest;