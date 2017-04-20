import CommonTest from './common.js';
let schemaTest = require('./schema.js');

class rwTest{
  constructor(URI) {
    this.URI = URI;
    this.orgData = {};
  }

  doTest(input, expectOutput) {
    let op = new CommonTest(this.URI);

    //describe('test '+this.URI, () => {

      describe('Get original settings', () => {
        it('Get original settings: GET '+this.URI, (done) => {
          op.checkOperation('GET', this.URI).then((res) => {
            this.orgData = res.body;
            done();
          }).catch(err => {
            done();
          });
        })
      });

      describe('PUT test', () => {

        it('set data: PUT ' + this.URI, (done) => {
          op.checkOperation('PUT', this.URI, input).then((res) => {
            //setTimeout(() => {
              done();
            //}, 2000);   
          }).catch(err => {
            done();
          });
        });

        it('check data: GET '+this.URI, (done) => {
          op.checkOperation('GET', this.URI, null, expectOutput).then((res) => {

            done();
          }).catch(err => {
            done();
          });
        });

      });

      describe('Restore data', () => {
        it('Restore data: PUT '+this.URI, (done) => {
          op.checkOperation('PUT', this.URI, this.orgData).then((res) => {
            //setTimeout(() => {
              done();
            //}, 2000);  
          }).catch(err => {
            done();
          });
        })
      });

    //});
  };
};



function go(uri, input, expectOutput) {
  let newTest = new rwTest(uri);
  newTest.doTest(input, expectOutput);
}

exports.go = go;