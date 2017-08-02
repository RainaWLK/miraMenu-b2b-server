import CommonTest from './common.js';
let _ = require('lodash');
let restaurantTest = require('./restaurant');
let utils = require('./utils');

let URI = "/restaurants/{restaurant_id}/branches";
let URI_prototype = URI;

let sampleData = {
    "type": "branches",
    "attributes": {
      "name": "二號店",
      "desc": "吱吱海產二號店zz",
      "category": "seafood",
      "location": {
        "continent": "Asia",
        "country": "Taiwan",
        "state": "Taiwan",
        "city": "基隆",
        "dist": "吱吱區",
        "address": "吱吱漁港二號碼頭",
        "tel": "02-33333333"
      },
      "currency": "TWD",
      "social": {
        "web": "https://www.ggseafood.com/2"
      },
      "total_table": 50,
      "capacity": 250,
      "branch_hours": "Mon 9:00-12:00, 17:00-23:00; Tue 6:00-9:00, 11:00-13:30, 17:00-23:00",
      "photo": [],
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
      "tables": ["0", "1"],
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

let sample = {"data": sampleData};

function branchTest() {
  let URI_ID = URI+"/{branch_id}";
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
        
        URI_ID = URI+"/"+"s"+idArray.s;
        fullid = "r"+idArray.r+"s"+idArray.s;
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

function branchByIDTest() {
  let URI_ID = URI+"/{branch_id}";
  let op;
  let idArray;
  let fullid;

  before('prepare data', () => {
    op = new CommonTest(URI_ID);
  });

  describe('/restaurants/{restaurant_id}/branches/{branch_id} test', () => {
    it('set data: POST ' + URI, async () => {
      idArray = await prepareTest();

      URI_ID = URI+"/"+"s"+idArray.s;
      fullid = "r"+idArray.r+"s"+idArray.s;
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
	    input.data.attributes.social["twitch"] = "https://www.twitch.tv/HNRT";

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
  URI = "/restaurants/"+restaurant_id+'/branches';

  //output.data.attributes.social.facebook = "囧";
  let res = await op.checkOperation('POST', URI, input, output);
  let idArray = utils.parseID(res.body.data.id);
  return idArray;
}

async function cleanTest(idArray){
  let op = new CommonTest();
  let URI_ID = '/restaurants/'+'r'+idArray.r+'/branches/'+'s'+idArray.s;

  await op.checkOperation('DELETE', URI_ID, null, "");

  //check
  let res = await op.pureOperation('GET', URI_ID, null);
  //res.should.have.status(404);
  res.statusCode.should.eql(404);

  //delete parent
  await restaurantTest.cleanTest("r"+idArray.r);
  return;
}

function go() {
  branchByIDTest();
  branchTest();
};
exports.go = go;
exports.prepareTest = prepareTest;
exports.cleanTest = cleanTest;