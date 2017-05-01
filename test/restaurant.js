import CommonTest from './common.js';

function restaurantTest() {
  let URI = '/restaurants';
  let modbusEquipment;
  let op = new CommonTest(URI);

  describe(URI+' test', () => {

    describe('POST test', () => {
      let id;
      /*it('set data: POST ' + URI, (done) => {
        let rnd = Math.floor(Math.random() * modbusEquipment.equipmentTags.length);
        let input = {
          "reference": "0x40000",
          "quantity": modbusEquipment.equipmentTags[rnd].quantity,
          "equipmentName": modbusEquipment.equipmentName,
          "equipmentType": modbusEquipment.equipmentType,
          "tagName": modbusEquipment.equipmentTags[rnd].name
        }

        op.checkOperation('POST', URI, input).then((res) => {
          id = res.body.id;
          done(); 
        }).catch(err => {
          done(err);
        });
      });*/

      it('check data saved: GET '+URI, (done) => {
        op.checkOperation('GET', URI, null, null).then((res) => {
          //res.body.should.include.something.that.have.deep.property('id', id);
          done();
        }).catch(err => {
          done(err);
        });
      });

      /*it('set data: PUT ' + URI, (done) => {
        let rnd = Math.floor(Math.random() * modbusEquipment.equipmentTags.length);
        let input = [{
          "id": id,
          "reference": "0x40003",
          "quantity": modbusEquipment.equipmentTags[rnd].quantity,
          "equipmentName": modbusEquipment.equipmentName,
          "equipmentType": modbusEquipment.equipmentType,
          "tagName": modbusEquipment.equipmentTags[rnd].name
        }];

        op.checkOperation('PUT', URI, input).then((res) => {
          done(); 
        }).catch(err => {
          done(err);
        });
      });

      it('check data saved: GET '+URI, (done) => {
        op.checkOperation('GET', URI, null, null).then((res) => {
          res.body.should.include.something.that.have.deep.property('id', id);
          done();
        }).catch(err => {
          done(err);
        });
      });

      it('delete data: DELETE '+URI, (done) => {
        let input = [id];
        op.checkOperation('DELETE', URI, input).then((res) => {          
          done();
        }).catch(err => {
          done(err);
        });
      });

      it('check data deleted: GET '+URI, (done) => {
        op.checkOperation('GET', URI, null, null).then((res) => {
          res.body.should.not.include.something.that.have.deep.property('id', id);
          done();
        }).catch(err => {
          done(err);
        })
      });*/

    });
  });
}

function restaurantByIDTest() {
  let URI = '/restaurants';
  let URI_ID = URI+"/{restaurant_id}";
  let op = new CommonTest(URI_ID);
  let modbusEquipment;
  let id;
  
  id = "20170003";
  URI_ID = URI+"/"+id;

  /*describe(URI+'/{id} test', () => {
    it('set data: POST ' + URI_ID, (done) => {
      let rnd = Math.floor(Math.random() * modbusEquipment.equipmentTags.length);
      let input = {
        "reference": "0x40000",
        "quantity": modbusEquipment.equipmentTags[rnd].quantity,
        "equipmentName": modbusEquipment.equipmentName,
        "equipmentType": modbusEquipment.equipmentType,
        "tagName": modbusEquipment.equipmentTags[rnd].name
      };

      op.pureOperation('POST', URI, input).then((res) => {
        id = res.body.id;
        URI_ID = URI+"/"+id;
        done(); 
      }).catch(err => {
        done(err);
      });
    });*/

    it('check data saved: GET '+URI_ID, (done) => {
      op.checkOperation('GET', URI_ID, null, null).then((res) => {
        res.body.data.should.have.deep.property('id', id);
        done();
      }).catch(err => {
        done(err);
      });
    });

    /*it('set data: PUT ' + URI_ID, (done) => {
      let rnd = Math.floor(Math.random() * modbusEquipment.equipmentTags.length);
      let input = {
        "reference": "0x40001",
        "quantity": modbusEquipment.equipmentTags[rnd].quantity,
        "equipmentName": modbusEquipment.equipmentName,
        "equipmentType": modbusEquipment.equipmentType,
        "tagName": modbusEquipment.equipmentTags[rnd].name
      };
      op.checkOperation('PUT', URI_ID, input).then((res) => {
        return op.checkOperation('GET', URI_ID, null, input);
      }).then((res) => {
        done();
      }).catch(err => {
        done(err);
      });
    });

    it('delete data: DELETE '+URI_ID, (done) => {
      op.checkOperation('DELETE', URI_ID, null).then((res) => {
        return op.pureOperation('GET', URI_ID, null);
        res.should.have.status(404);
      }).then((res) => {
        done();
      }).catch(err => {
        done(err);
      });
    });

  });*/
}

function go() {
  restaurantTest();
  restaurantByIDTest();
};
exports.go = go;