let env = require('./enviroment.js');
let schemaTest = require('./schema.js');
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

  checkOperation(op ,uri, input, expectOutput) {
    return new Promise((resolve, reject) => {
      this.sendRequest(op, uri, input).end((err, res) => {
        if(err) {
          //console.log(err);
          reject(err);
        }
        else {
          console.log("=="+op+"==");
          console.log(res.body);

          try {
            //console.log("checkSchema:"+this.orgURI);
            schemaTest.checkSchema(res, op, this.orgURI);
          }
          catch(err) {
            reject(err);
            return;
          }
          

          if(expectOutput) {
            if(Array.isArray(expectOutput)) {
              for(let row in expectOutput) {
                for(let i in expectOutput[i]) {
                  res.body[row].should.have.property(i).eql(expectOutput[i]);
                }
              }
            }
            else {
              for(let i in expectOutput[i]) {
                res.body.should.have.property(i).eql(expectOutput[i]);
              }            
            }

          }
          resolve(res);
        }
      });
    });
  }

  pureOperation(op ,uri, input) {
    return new Promise((resolve, reject) => {
      this.sendRequest(op, uri, input).end((err, res) => {
        if(err) {
          //console.log(err);
          resolve(err);
        }
        else {
          console.log("=囧="+op+"=囧=");
          console.log(res.body);
          resolve(res);
        }
      });
    });
  }
}



export default CommonTest;


//exports.sendRequest = sendRequest;
//exports.checkOperation = checkOperation;
//exports.pureOperation = pureOperation;
