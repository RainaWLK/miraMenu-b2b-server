let env = require('./enviroment.js');
let schemaTest = require('./schema.js');
let _ = require('lodash');
let request = require('supertest');

let chai = env.chai;

//aws
let aws4  = require('aws4');



class CommonTest {
  constructor(OrgURI) {
    this.orgURI = OrgURI;
  }

  setAWSCredentials(req, op, uri, body){
    let opts = {
      method: op,
      hostname: env.aws.host,
      path: env.aws.stage+uri,
      service: 'execute-api',
      region: env.aws.region
    };
    if((typeof body !== 'undefined')&&(body !== null)){
      opts.headers = {
        'Content-Type': 'application/json'
      };
      opts.body = JSON.stringify(body);
    }

    aws4.sign(opts, env.aws.credentials);
    //console.log("======sign======");
    //console.log(opts);
    req = req.set('Host', opts.headers['Host']);
    req = req.set('X-Amz-Date', opts.headers['X-Amz-Date']);
    req = req.set('Authorization', opts.headers.Authorization);
    req = req.set('X-amz-security-token', opts.headers['X-Amz-Security-Token']);

    if((typeof body !== 'undefined')&&(body !== null)){
      req = req.set('Content-type', opts.headers['Content-Type']);
    }

    return req;
  }

  sendRequest(op, uri, body) {
    let req = request(env.server);

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
    
    //aws
    req = this.setAWSCredentials(req, op, uri, body);

    if((typeof body !== 'undefined')&&(body !== null)){
      req = req.send(body);
    }
    //console.log(req);

    return req;
  }

  async checkOperation(op ,uri, input, expectOutput) {
    try{
      console.log("======================");
      console.log(op + " " + uri);
      if(_.isEmpty(input) === false){
        console.log(input.data);
      }

      let res = await this.sendRequest(op, uri, input);
      let output = _.cloneDeep(res.body);
      console.log("--------response-----------");
      console.log(res.statusCode);
      if(_.isEmpty(output) === false){
        console.log(output.data);
      }
        

      res.statusCode.should.within(200,210);
      schemaTest.checkSchema(res, op, this.orgURI);
      console.log("schema check finish");
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
      console.log("checkOperation err");
      console.log(err);
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