import CommonTest from './common.js';
let _ = require('lodash');

let sampleData = {
    "type": "restaurants",
    "attributes": {
        "social": {
            "facebook": "htttps://www.facebook.com/testraman"
        },
        "photo": {},
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
        "name": "啾咪拉麵",
        "desc": "This is a auto test data: Raman"
    }
}

let sample = {"data": sampleData};

function restaurantTest() {
  let URI = '/restaurants';
  let URI_ID = URI+"/{restaurant_id}";
  let op = new CommonTest(URI);
  let id;

  describe(URI+' test', () => {
    describe('CRUD test', () => {

    it('set data: POST ' + URI, async () => {
      let input = _.cloneDeep(sample);
      let output = _.cloneDeep(sample);
      //output.data.attributes.social.facebook = "囧";

      let res = await op.checkOperation('POST', URI, input, output);
      id = res.body.data.id;
      URI_ID = URI+"/"+id;
    });

    it('check data saved: GET '+URI, async () => {
      let output = _.cloneDeep(sample);
      output.data.id = id;
      //output.data.attributes.location.tel = "012-3345678";
      //output.data.attributes.desc = "囧";

      let res = await op.checkOperation('GET', URI, null, null);
      //res.body.data.should.include.something.that.have.deep.property('id', id);
      res.body.data.should.include.something.that.deep.equal(output.data);
    });

    it('delete data: DELETE '+URI_ID, async () => {
      await op.checkOperation('DELETE', URI_ID, null, "");

      //check
      let res = await op.pureOperation('GET', URI_ID, null);
      res.should.have.status(404);
    });


    });
  });
}

function restaurantByIDTest() {
  let URI = '/restaurants';
  let URI_ID = URI+"/{restaurant_id}";
  let op = new CommonTest(URI_ID);
  let id;

  describe(URI+'/{id} test', () => {
    it('set data: POST ' + URI, async () => {
      let input = _.cloneDeep(sample);
      let output = _.cloneDeep(sample);
      //output.data.attributes.social.facebook = "囧";
      let res = await op.checkOperation('POST', URI, input, output);
      id = res.body.data.id;
      URI_ID = URI+"/"+id;
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
      await op.checkOperation('DELETE', URI_ID, null, "");

      //check
      let res = await op.pureOperation('GET', URI_ID, null);
      res.should.have.status(404);
    });


  });
}


function go() {
  restaurantByIDTest();
  restaurantTest();
};
exports.go = go;