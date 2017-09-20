let JSONAPI = require('./jsonapi.js');
let Utils = require('./utils.js');

const I18N_TYPE_NAME = "i18n";

class I18n {
  constructor(dbData, idArray){
    this.dbData = dbData;
    this.idArray = idArray;

    if(typeof this.dbData.i18n == 'undefined'){
      this.dbData.i18n = {};
    }
  }

  getLang(lang, key){
    let i18nData = this.dbData.i18n[key];
    console.log(i18nData);

    if(typeof i18nData.data[lang] == 'string'){
      return i18nData.data[lang];
    }
    return i18nData.data[i18nData.default];
  }

  getNewResourceID(type){
    const dateTime = Date.now();
    const timestamp = Math.floor(dateTime);

    return `res-${type}-${timestamp}`;
  }

  getI18n(fullID) {

    console.log("i18n getI18n");
    console.log(this.dbData);
    try{
      //output
      let dataArray = [];

      let makeI18nArray = function(source, dest){
          for(let i18n_id in source.i18n){
            let i18nData = source.i18n[i18n_id];
            i18nData.id = fullID+i18n_id;
            dest.push(i18nData);
          }
          return;
      }

      makeI18nArray(this.dbData, dataArray);

      //if empty
      if(dataArray.length == 0){
          let err = new Error("not found");
          err.statusCode = 404;
          throw err;
      }

      return JSONAPI.makeJSONAPI(I18N_TYPE_NAME, dataArray);
    }catch(err) {
      throw err;
    }
  }

  getI18nByID(params) {
    try {
      let i18n_id = params.i18n_id;
      let i18nData = this.dbData.i18n[i18n_id];
      let fullID = Utils.makeFullID(this.idArray);

      if(typeof i18nData == 'undefined'){
          let err = new Error("not found");
          err.statusCode = 404;
          throw err;
      }

      //output
      i18nData.id = fullID+i18n_id;
    　let output = JSONAPI.makeJSONAPI(I18N_TYPE_NAME, i18nData);

      return output;
    }catch(err) {
      throw err;
    }
  }

  addI18n(payload) {
    let output;
    let inputData = JSONAPI.parseJSONAPI(payload);

    try {
      let oneDataProcess = (oneData, arraySeq) => {
        let inputSeq = oneData.seq;
        delete oneData.id;
        let i18n_id = this.getNewResourceID("i18n", arraySeq);
        //let path = Utils.makePath(this.idArray);
        let outputBuf;

        console.log(i18n_id);
        //console.log(path);

        console.log(oneData);
        this.dbData.i18n[i18n_id] = oneData;

        outputBuf = oneData;
        outputBuf.id = i18n_id;

        //check
        let defaultLang = oneData.default;
        if((typeof defaultLang != 'string')||(typeof oneData.data[defaultLang] == 'undefined')){
          for(let i in oneData.data){ //set the first lang to default
            oneData.default = i;
            break;
          }
        }

        return outputBuf;
      }

      let outputBuf;
      if(Array.isArray(inputData)){
        let outputBufArray = [];
        for(let i in inputData){
          outputBuf = oneDataProcess(inputData[i], i);
          outputBufArray.push(outputBuf);
        }
        console.log(outputBufArray);
        output = JSONAPI.makeJSONAPI(I18N_TYPE_NAME, outputBufArray);
      }
      else {
        outputBuf = oneDataProcess(inputData);
        output = JSONAPI.makeJSONAPI(I18N_TYPE_NAME, outputBuf);
      }
      
      return output;
    }catch(err) {
      console.log(err);
      throw err;
    }
  }

  updateI18n(params, payload) {
    let inputData = JSONAPI.parseJSONAPI(payload);
    delete inputData.id;
    let fullID = Utils.makeFullID(this.idArray);

    try {
      let i18n_id = params.i18n_id;
      let i18nData = this.dbData.i18n[i18n_id];
      if(typeof i18nData == 'undefined'){
          let err = new Error("not found");
          err.statusCode = 404;
          throw err;
      }

      //check
      let defaultLang = inputData.default;
      if((typeof defaultLang != 'string')||(typeof inputData.data[defaultLang] == 'undefined')){
        for(let i in inputData.data){ //set the first lang to default
          inputData.default = i;
          break;
        }
      }

      //update
      this.dbData.i18n[i18n_id] = inputData;

      //output
      let outputBuf = inputData;
      outputBuf.id = fullID+i18n_id;
      let output = JSONAPI.makeJSONAPI(I18N_TYPE_NAME, outputBuf);

      return output;
    }catch(err) {
        throw err;
    }
  }

  deleteI18n(params) {
    try {
      let i18n_id = params.i18n_id;

      if(typeof this.dbData.i18n[i18n_id] == 'undefined'){
        let err = new Error("not found");
        err.statusCode = 404;
        throw err;
      }

      //delete
      delete this.dbData.i18n[i18n_id];

      return this.dbData;
    }catch(err) {
        throw err;
    }
  }
}

exports.main = I18n;