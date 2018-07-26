let env = require('./enviroment.js');
let schemaTest = require('./schema.js');
let _ = require('lodash');
let request = require('supertest');

let chai = env.chai;
let expect = chai.expect;

//aws
let aws4  = require('aws4');



class CommonTest {
  constructor(OrgURI, ignoreKeys) {
    this.orgURI = OrgURI;
    this.ignoreKeys = [];
    if(typeof ignoreKeys === 'object'){
      this.ignoreKeys = ignoreKeys;
    }
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

  removeInternalElement(inputData){
    console.log('removeInternalElement');
    if(typeof inputData === 'object') {
      if(typeof inputData.i18n !== 'undefined'){
        delete inputData.i18n;
      }
      if(typeof inputData.resources !== 'undefined'){
        delete inputData.resources;
      }
      if(typeof inputData.attributes.photos !== 'undefined'){
        delete inputData.attributes.photos;
      }
      //for menu sections
      inputData.attributes = this.removeIgnoreElement({
        sections: [{
          id: ''
        }],
        qrcode: ''
      }, inputData.attributes);
      //for others
      inputData.attributes = this.removeIgnoreElement(this.ignoreKeys, inputData.attributes);
    }
    console.log(inputData.attributes);
    return inputData;
  }

  setIgnore(ignoreKeys){
    console.log('setIgnore');
    console.log(ignoreKeys);
    this.ignoreKeys = ignoreKeys;
  }

  removeIgnoreElement(keys, inputData){
    //console.log('removeIgnoreElement');
    //console.log(keys);
    //console.log(inputData);
    for(let key in keys) {
      let value = keys[key];
      //console.log(key);
      //console.log(typeof value);
      //console.log(inputData[key]);
      if(typeof value === 'string'){
        if(typeof inputData[key] !== 'undefined'){
           //console.log('----delete !!!---');
           //console.log(this.ignoreKeys);
           //console.log(key);
           //console.log(inputData[key]);
          delete inputData[key];
        }
      }
      else if(Array.isArray(value)) {
        if(typeof inputData[key] !== 'undefined'){
          inputData[key].forEach(element => {
            this.removeIgnoreElement(value[0], element);
          });
        }        
      }
      else if(typeof value === 'object') {
        if(typeof inputData[key] !== 'undefined'){
          this.removeIgnoreElement(value, inputData[key]);
        }
        
      }
    }
    
    return inputData;
  }

  async checkOperation(op ,uri, input, expectOutput) {
    try{
      expectOutput = _.cloneDeep(expectOutput);
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
        console.log(output.data.attributes);
      }
        

      res.statusCode.should.within(200,210);
      schemaTest.checkSchema(res, op, this.orgURI);
      console.log("schema check finish");
      if(expectOutput) {
        if(Array.isArray(expectOutput.data)) {
          output.data = output.data.map(data => this.removeInternalElement(data));
          expectOutput.data = expectOutput.data.map(data => this.removeInternalElement(data));

          expect(output.data).to.include.something.that.deep.equal(expectOutput.data[0]);      
        }
        else {
          if(typeof output.data === 'object') {
            if(typeof output.data.id !== 'undefined'){
              delete output.data.id;
            }
          }
          output.data = this.removeInternalElement(output.data);
          expectOutput.data = this.removeInternalElement(expectOutput.data);
          //output.data.should.deep.include(expectOutput.data);
          expect(output).to.deep.equal(expectOutput);         
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



module.exports = CommonTest;