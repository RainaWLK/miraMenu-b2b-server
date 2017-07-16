process.env.NODE_ENV = "test";
//process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

var chai = require('chai');
var chaiHttp = require('chai-http');
let should = chai.should();

chai.use(require('chai-ajv-json-schema'));
chai.use(require('chai-things'));
chai.use(chaiHttp);

exports.chai = chai;
//exports.server = 'http://localhost:8081';
exports.server = 'https://aoboid0wkl.execute-api.us-east-1.amazonaws.com/production';
