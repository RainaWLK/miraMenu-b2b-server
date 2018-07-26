let _ = require('lodash');
let I18n = require('../src/i18n.js');

var chai = require('chai');
var expect = chai.expect;

let i18nSchema = {
  "name": "",
  "desc": "",
  //section
  "sections": [{
    "name": ""
  }]
};

//i18n key should be same with original
function testi18nKey(schema, source, target) {
  for(let i in schema) {
    if(typeof schema[i] === 'string') {
      it(`target=${target[i]}\tsource=${source[i]}`, () => {
        expect(target[i]).to.equal(source[i]);
      })
    }
  }
}

//translation words should be same with input
function testi18nWord(schema, source, target, i18n, lang) {
  for(let i in schema) {
    if(typeof schema[i] === 'string') {
      let i18nKey = target[i].substring(6);
      it(`key=${i18nKey}\tlang=${lang}\tword=${i18n[lang][i18nKey]}\tsource=${source[i]}`, () => {
        expect(i18n[lang][i18nKey]).to.equal(source[i]);
      });
    }
  }
}

function checki18nKey(schema, target, i18n, lang) {
  for(let i in schema) {
    if(typeof schema[i] === 'string') {
      let i18nKey = target[i].substring(6);
      it(`key=${i18nKey}\tlang=${lang}\tword=${i18n[lang][i18nKey]}\tnew item`, () => {
        expect(i18n[lang][i18nKey]).to.be.a('string');
      });
    }
  }
}
/*
function checki18nKeyDeleted(schema, target, i18n, lang) {
  for(let i in schema) {
    if(typeof schema[i] === 'string') {
      let i18nKey = target[i].substring(6);
      it(`key=${i18nKey}\tlang=${lang}\tword=${i18n[lang][i18nKey]}\tnew item`, () => {
        expect(i18n[lang][i18nKey]).to.be.a('string');
      });
    }
  }
}*/

function unittest(sampleOrgData, sampleDataWords) {
  let i18nUtils = new I18n.main(sampleOrgData, this.idArray);
  let result = i18nUtils.makei18n(i18nSchema, _.cloneDeep(sampleDataWords), sampleDataWords.language);
  //console.log(result);

  describe('check string type', () => {
    testi18nKey(i18nSchema, sampleOrgData, result);
  });
  
  describe('check string type translation', () => {
    testi18nWord(i18nSchema, sampleDataWords, result, result.i18n, result.language);
  });
  
  describe('check array type', () => {
    for(let i in i18nSchema) {
      if(Array.isArray(i18nSchema[i])) {
        result[i].map(resultElement => {
          let sampleData = sampleOrgData[i].find(sampleDataElement => sampleDataElement.id===resultElement.id);
          if(sampleData !== undefined) {
            //console.log('---old item---');
            //console.log(sampleData);
            //console.log(resultElement);
            testi18nKey(i18nSchema[i][0], sampleData, resultElement);
          }
          else {
            //new item
            //console.log('----new item---');
            //console.log(resultElement);
            //console.log(result.i18n);
            checki18nKey(i18nSchema[i][0], resultElement, result.i18n, result.language);
          }
        });
      }
    }
  });

  describe('check array translation', () => {
    for(let i in i18nSchema) {
      if(Array.isArray(i18nSchema[i])) {
        result[i].map(resultElement => {
          let sampleData = sampleDataWords[i].find(sampleDataElement => sampleDataElement.id===resultElement.id);
          if(sampleData !== undefined) {
            testi18nWord(i18nSchema[i][0], sampleData, resultElement, result.i18n, result.language);
          }
          else {
            //new item, do nothing
          }
        });
        
      }
    }
  });

  describe('add new lang', () => {

  });


}



//test case:
describe('update data with same lang', () => {
  let sampleDataTW = {
    "id": "r1524107780801s1524642972145m1524725848720",
    "language": "zh-TW",
    "name": "二號餐",
    "desc": "鮪魚套餐",
    "category": "General",
    "availability": true,
    "sections": [
      {
        "id": 0,
        "name": "主餐",
        "items":["r1s1i1", "r1i2"]
      },
      {
        "id": 1,
        "name": "甜點",
        "items":["r1s1i3"]
      }
    ],
    "photos": [
      {
        "id": "p1510823573751-0",
        "mimetype": "image/jpeg",
        "size": {
          "height": 1536,
          "width": 2048
        },
        "url": {
          "huge": "https://cdn.mira.menu/restaurants/r1509608965017/branches/s1509947746510/items/i1510037409816/photos/p1520920200442-0_huge.jpg",
          "large": "https://cdn.mira.menu/restaurants/r1509608965017/branches/s1509947746510/items/i1510037409816/photos/p1520920200442-0_large.jpg",
          "medium": "https://cdn.mira.menu/restaurants/r1509608965017/branches/s1509947746510/items/i1510037409816/photos/p1520920200442-0_medium.jpg",
          "original": "https://cdn.mira.menu/restaurants/r1509608965017/branches/s1509947746510/items/i1510037409816/photos/p1520920200442-0.jpg",
          "small": "https://cdn.mira.menu/restaurants/r1509608965017/branches/s1509947746510/items/i1510037409816/photos/p1520920200442-0_small.jpg"
        }
      }
    ],
    "menu_hours": "24"
  };
  
  let sampleOrgData = {
    "id": "r1524107780801s1524642972145m1524725848720",
    "name": "i18n::res-i18n-1524725848943-0",
    "desc": "i18n::res-i18n-1524725848943-1",
    "category": "General",
    "availability": true,
    "i18n": {
      "default": "zh-TW",
      "zh-CN": {
        "res-i18n-1524725848943-0": "测试菜单001(中文简体)",
        "res-i18n-1524725848943-1": "测试菜单Description(中文简体)",
        "res-i18n-1524725848943-2": "General",
        "res-i18n-1528682781519-4": "测试菜单 section 01"
      },
      "zh-TW": {
        "res-i18n-1524725848943-0": "測試菜單001(中文臺灣)",
        "res-i18n-1524725848943-1": "測試菜單Description(中文臺灣)",
        "res-i18n-1524725848943-2": "General",
        "res-i18n-1528682781519-4": "測試菜單 section 01"
      }
    },
    "menu_hours": "123",
    "menuControl": {},
    "photos": {
      "p1510823573751-0": {
        "mimetype": "image/jpeg",
        "size": {
          "height": 1536,
          "width": 2048
        },
        "url": {
          "huge": "https://cdn.mira.menu/restaurants/r1509608965017/branches/s1509947746510/items/i1510037409816/photos/p1520920200442-0_huge.jpg",
          "large": "https://cdn.mira.menu/restaurants/r1509608965017/branches/s1509947746510/items/i1510037409816/photos/p1520920200442-0_large.jpg",
          "medium": "https://cdn.mira.menu/restaurants/r1509608965017/branches/s1509947746510/items/i1510037409816/photos/p1520920200442-0_medium.jpg",
          "original": "https://cdn.mira.menu/restaurants/r1509608965017/branches/s1509947746510/items/i1510037409816/photos/p1520920200442-0.jpg",
          "small": "https://cdn.mira.menu/restaurants/r1509608965017/branches/s1509947746510/items/i1510037409816/photos/p1520920200442-0_small.jpg"
        }
      }
    },
    "resources": {},
    "sections": [
      {
        "id": 0,
        "items": [
          "r1524107780801s1524642972145i1524711441640"
        ],
        "name": "i18n::res-i18n-1528682781519-4"
      }
    ]
  };
  unittest(sampleOrgData, sampleDataTW);
});

describe('update data with new lang', () => {
  let sampleDataWords = {
    "id": "r1524107780801s1524642972145m1524725848720",
    "language": "mars",
    "name": "~~~~~~~~~~",
    "desc": "*******",
    "category": "General",
    "sections": [
      {
        "id": 0,
        "name": "!@$!#%!$!#",
        "items":["r1s1i1", "r1i2"]
      },
      {
        "id": 1,
        "name": "^^^^^^^^^^^^^^^^",
        "items":["r1s1i3"]
      }
    ],
    "photos": [
      {
        "id": "p1510823573751-0",
        "mimetype": "image/jpeg",
      }
    ]
  };
  
  let sampleOrgData = {
    "id": "r1524107780801s1524642972145m1524725848720",
    "name": "i18n::res-i18n-1524725848943-0",
    "desc": "i18n::res-i18n-1524725848943-1",
    "category": "General",
    "i18n": {
      "default": "zh-TW",
      "zh-CN": {
        "res-i18n-1524725848943-0": "测试菜单001(中文简体)",
        "res-i18n-1524725848943-1": "测试菜单Description(中文简体)",
        "res-i18n-1524725848943-2": "General",
        "res-i18n-1528682781519-4": "测试菜单 section 01"
      },
      "zh-TW": {
        "res-i18n-1524725848943-0": "測試菜單001(中文臺灣)",
        "res-i18n-1524725848943-1": "測試菜單Description(中文臺灣)",
        "res-i18n-1524725848943-2": "General",
        "res-i18n-1528682781519-4": "測試菜單 section 01"
      }
    },
    "photos": {
      "p1510823573751-0": {
        "mimetype": "image/jpeg"
      }
    },
    "sections": [
      {
        "id": 0,
        "items": [
          "r1524107780801s1524642972145i1524711441640"
        ],
        "name": "i18n::res-i18n-1528682781519-4"
      }
    ]
  };
  unittest(sampleOrgData, sampleDataWords);
});

describe('update data and delete something with same lang', () => {
  console.log('------update data and delete something with same lang-----');
  let sampleDataWords = {
    "id": "r1524107780801s1524642972145m1524725848720",
    "language": "zh-CN",
    "name": "二號餐",
    "desc": "鮪魚套餐",
    "category": "General",
    "sections": [
      {
        "id": 1,
        "name": "甜點",
        "items":["r1s1i3"]
      }
    ],
    "photos": [
      {
        "id": "p1510823573751-0",
        "mimetype": "image/jpeg",
      }
    ]
  };
  
  let sampleOrgData = {
    "id": "r1524107780801s1524642972145m1524725848720",
    "name": "i18n::res-i18n-1524725848943-0",
    "desc": "i18n::res-i18n-1524725848943-1",
    "category": "General",
    "i18n": {
      "default": "zh-TW",
      "zh-CN": {
        "res-i18n-1524725848943-0": "测试菜单001(中文简体)",
        "res-i18n-1524725848943-1": "测试菜单Description(中文简体)",
        "res-i18n-1524725848943-2": "General",
        "res-i18n-1528682781519-4": "测试菜单 section 01"
      },
      "zh-TW": {
        "res-i18n-1524725848943-0": "測試菜單001(中文臺灣)",
        "res-i18n-1524725848943-1": "測試菜單Description(中文臺灣)",
        "res-i18n-1524725848943-2": "General",
        "res-i18n-1528682781519-4": "測試菜單 section 01"
      }
    },
    "photos": {
      "p1510823573751-0": {
        "mimetype": "image/jpeg"
      }
    },
    "sections": [
      {
        "id": 0,
        "name": "i18n::res-i18n-1524725848943-2",
        "items":["r1s1i1", "r1i2"]
      },
      {
        "id": 1,
        "items": [
          "r1524107780801s1524642972145i1524711441640"
        ],
        "name": "i18n::res-i18n-1528682781519-4"
      }
    ]
  };
  unittest(sampleOrgData, sampleDataWords);
});

describe('update data and delete something with new lang', () => {
  let sampleDataWords = {
    "id": "r1524107780801s1524642972145m1524725848720",
    "language": "zh-CN",
    "name": "二號餐",
    "desc": "鮪魚套餐",
    "category": "General",
    "sections": [
      {
        "id": 1,
        "name": "甜點",
        "items":["r1s1i3"]
      },
      {
        "id": 99999,
        "name": "Raman",
        "items": ["r1s1i1", "r2s2i2"]
      }
    ],
    "photos": [
      {
        "id": "p1510823573751-0",
        "mimetype": "image/jpeg",
      }
    ]
  };
  
  let sampleOrgData = {
    "id": "r1524107780801s1524642972145m1524725848720",
    "name": "i18n::res-i18n-1524725848943-0",
    "desc": "i18n::res-i18n-1524725848943-1",
    "category": "General",
    "i18n": {
      "default": "zh-TW",
      "zh-CN": {
        "res-i18n-1524725848943-0": "测试菜单001(中文简体)",
        "res-i18n-1524725848943-1": "测试菜单Description(中文简体)",
        "res-i18n-1524725848943-2": "General",
        "res-i18n-1528682781519-4": "测试菜单 section 01"
      },
      "zh-TW": {
        "res-i18n-1524725848943-0": "測試菜單001(中文臺灣)",
        "res-i18n-1524725848943-1": "測試菜單Description(中文臺灣)",
        "res-i18n-1524725848943-2": "General",
        "res-i18n-1528682781519-4": "測試菜單 section 01"
      }
    },
    "photos": {
      "p1510823573751-0": {
        "mimetype": "image/jpeg"
      }
    },
    "sections": [
      {
        "id": 0,
        "name": "i18n::res-i18n-1524725848943-2",
        "items":["r1s1i1", "r1i2"]
      },
      {
        "id": 1,
        "items": [
          "r1524107780801s1524642972145i1524711441640"
        ],
        "name": "i18n::res-i18n-1528682781519-4"
      }
    ]
  };
  unittest(sampleOrgData, sampleDataWords);
});

/*
describe('new data test', () => {
  let sampleDataWords = {
    "id": "r1524107780801s1524642972145m1524725848720",
    "language": "zh-CN",
    "name": "二號餐",
    "desc": "鮪魚套餐",
    "category": "General",
    "sections": [
      {
        "id": 1,
        "name": "甜點",
        "items":["r1s1i3"]
      },
      {
        "id": 99999,
        "name": "Raman",
        "items": ["r1s1i1", "r2s2i2"]
      }
    ],
    "photos": [
      {
        "id": "p1510823573751-0",
        "mimetype": "image/jpeg",
      }
    ]
  };
  //TODO:
  
  unittest({}, sampleDataWords);
  
});*/