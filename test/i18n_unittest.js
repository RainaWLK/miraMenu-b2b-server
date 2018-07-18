let _ = require('lodash');
let I18n = require('../src/i18n.js');

var chai = require('chai');
var expect = chai.expect;

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

let i18nSchema = {
  "name": "",
  "desc": "",
  //section
  "sections": [{
    "name": ""
  }]
};

function unittest() {
  let i18nUtils = new I18n.main(sampleOrgData, this.idArray);
  let result = i18nUtils.makei18n(i18nSchema, _.cloneDeep(sampleDataTW), sampleDataTW.language);
  console.log(result);
  
  it('check string type', () => {
    for(let i in i18nSchema) {
      if(typeof i18nSchema[i] === 'string') {
        expect(result[i]).to.equal(sampleOrgData[i]);
      }
    }
  });
  
  it('check string type translation', () => {
    for(let i in i18nSchema) {
      if(typeof i18nSchema[i] === 'string') {
        let i18nKey = result[i].substring(6);
        let lang = result.language;
        console.log(i18nKey);
        console.log(lang);
        expect(result.i18n[lang][i18nKey]).to.equal(sampleDataTW[i]);
      }
    }
  });
  
  it('check array type', () => {
    for(let i in i18nSchema) {
      if(Array.isArray(i18nSchema[i])) {
        
      }
    }
  });
  
}

unittest();