import CommonTest from './common.js';

let sampleData = {
    "type": "restaurants",
    "attributes": {
        "social": {
            "facebook": "htttps://www.facebook.com/testraman"
        },
        "photos": {},
        "location": {
            "continent": "asia",
            "country": "japan",
            "address": "Ikebukuro, 1町目123-1",
            "city": "tokyo",
            "dist": "Ikebukuro",
            "tel": "012-3345678",
            "state": "tokyo"
        },
        "menus": {},
        "category": "japanese",
        "branch_ids": [],
        "name": "啾咪拉麵",
        "desc": "This is a auto test data: Raman"
    }
}

let sample = {"data": sampleData};

function restaurantTest() {
  let URI = '/restaurants';
  let op = new CommonTest(URI);

  describe(URI+' test', () => {

    describe('CRUD test', () => {
      let id;
      it('set data: POST ' + URI, (done) => {
        let input = sample;

        op.checkOperation('POST', URI, input).then((res) => {
          id = res.body.data.id;
          done(); 
        }).catch(err => {
          done(err);
        });
      });

      it('check data saved: GET '+URI, (done) => {
        op.checkOperation('GET', URI, null, null).then((res) => {
          res.body.data.should.include.something.that.have.deep.property('id', id);
          done();
        }).catch(err => {
          done(err);
        });
      });

      it('delete data: DELETE '+URI, (done) => {
	 let URI_ID = URI + "/" +id;
        op.checkOperation('DELETE', URI_ID, null).then((res) => {          
          done();
        }).catch(err => {
          done(err);
        });
      });

      it('check data deleted: GET '+URI, (done) => {
        op.checkOperation('GET', URI, null, null).then((res) => {
          res.body.data.should.not.include.something.that.have.deep.property('id', id);
          done();
        }).catch(err => {
          done(err);
        })
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
    it('set data: POST ' + URI, (done) => {
        let input = sample;

        op.checkOperation('POST', URI, input).then((res) => {
          id = res.body.data.id;
	   URI_ID = URI+"/"+id;
          done(); 
        }).catch(err => {
          done(err);
        });
      });

    it('check data saved: GET '+URI_ID, (done) => {
      op.checkOperation('GET', URI_ID, null, null).then((res) => {
        res.body.data.should.have.deep.property('id', id);
        done();
      }).catch(err => {
        done(err);
      });
    });
	
    it('set data: PATCH ' + URI_ID, (done) => {
	let input = sample;
	input.data.attributes.social["twitch"] = "https://www.twitch.tv/HNRT";

        op.checkOperation('PATCH', URI_ID, input).then((res) => {
          done(); 
        }).catch(err => {
          done(err);
        });
    });
	
    it('check data saved: GET '+URI_ID, (done) => {
      op.checkOperation('GET', URI_ID, null, null).then((res) => {
        res.body.data.should.have.deep.property('id', id);
	 res.body.data.should.have.deep.property('attributes.social.twitch', 'https://www.twitch.tv/HNRT');
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

  });
}

function go() {
  restaurantTest();
  restaurantByIDTest();
};
exports.go = go;