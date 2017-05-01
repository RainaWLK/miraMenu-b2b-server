var fs = require('fs');
let env = require('./enviroment.js');
let chai = env.chai;

let mySchema;

function sendGetRequest(uri){
  return chai.request(env.server)
        .get(uri);
        //.set('mx-api-token', env.token);
}
/*
function transformURI(uri) {
  let schemaURI = uri;
  let uriArray = uri.split('/');
  let tail = parseInt(uriArray[uriArray.length-1]);
  if(isNaN(tail) == false) { //{id} type
    uriArray[uriArray.length-1] = '{id}';
    //transform tail /1 ==> /{id}
    schemaURI = "";
    uriArray.map(data => {
      schemaURI += data + '/';
    });
    schemaURI = schemaURI.slice(0, schemaURI.length-1);
  }
  return schemaURI;
}
*/
function checkSchema(res, method, URI) {
  let schemaPath = "["+method.toUpperCase()+"]"+URI;
  let responseSchema;
  if(Array.isArray(mySchema[schemaPath])){
	responseSchema = mySchema[schemaPath][0].schema;
  }
  else {
	responseSchema = mySchema[schemaPath].schema;
  }
  console.log(responseSchema);

  res.should.have.status(200);

  if(typeof responseSchema != 'undefined') {
      res.body.should.be.validWithSchema(responseSchema);
  }
  return;
}


before(done => {
  // load first instance manually
  fs.readFile('./test/schema.json', (err, data) => {
    mySchema = JSON.parse(data.toString());
    console.log(mySchema);
    chai.ajv.addSchema(mySchema, "test_schema");
    done();
  });


});

function go(method, URI) {
  return new Promise((resolve, reject) => {
    sendGetRequest(URI)
    .end((err, res) => {
      //console.log(err);
      //console.log(res.body);
      try {
        checkSchema(res, method, URI);
        resolve();
      }
      catch(e) {
        reject(e);
      }
    });
  });
};
exports.go = go;
exports.checkSchema = checkSchema;