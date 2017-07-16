let env = require('./enviroment.js');
let schemaTest = require('./schema.js');
let _ = require('lodash');
let chai = env.chai;

class CommonTest {
  constructor(OrgURI) {
    this.orgURI = OrgURI;
  }

  sendRequest(op, uri, body) {
    let req = chai.request(env.server);

    switch(op) {
      case 'GET':
        req = req.get(uri);
        break;
      case 'POST':
        req = req.post(uri);
        break;
      case 'PUT':
        req = req.put(uri);
        break;
      case 'PATCH':
        req = req.patch(uri);
        break;
      case 'DELETE':
        req = req.delete(uri);
        break;
    }

    //req = req.set('mx-api-token', env.token);
    if(typeof body != 'undefined'){
      req = req.send(body);
    }

    return req;
  }

  async checkOperation(op ,uri, input, expectOutput) {
    try{
      console.log("======================");
      console.log(op + " " + uri);

      let res = await this.sendRequest(op, uri, input);
      let output = _.cloneDeep(res.body);
      console.log("=="+op+"==");
      console.log(output);

      res.statusCode.should.within(200,210);
      schemaTest.checkSchema(res, op, this.orgURI);

      if(expectOutput) {
        if(Array.isArray(expectOutput)) {
          for(let row in expectOutput) {
            for(let i in expectOutput[i]) {
              output[row].should.have.property(i).eql(expectOutput[i]);
            }
          }
        }
        else {
          if((typeof output.data == 'object')&&
            (typeof output.data.id != 'undefined')){
            delete output.data.id;
          }
          output.should.deep.equal(expectOutput);         
        }

      }

      return res;
    }
    catch(err){
      //console.log("checkOperation err");
      //console.log(err);
      throw err;
    }
  }

  async pureOperation(op ,uri, input) {
    try{
      let res = await this.sendRequest(op, uri, input);
      console.log("=囧="+op+"=囧=");
      console.log(res.body);
      return res;
    }
    catch(err){
      return err;
    }
  }
}



export default CommonTest;