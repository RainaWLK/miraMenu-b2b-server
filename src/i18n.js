let _ = require('lodash');

const I18N_TYPE_NAME = "i18n";

class I18n {
  constructor(dbData, idArray){
    this.dbData = dbData;
    this.idArray = idArray;

    if((typeof this.dbData == 'object')&&(typeof this.dbData.i18n == 'undefined')){
      this.dbData.i18n = {};
    }

    this.outputLang = "en-us";
  }

  translate(lang){
    let outputLang = lang;
    if(typeof this.dbData.i18n !== 'object'){
      return this.dbData;
    }
    //get lang pack
    let langPack = this.getLangPack(this.dbData.i18n, lang);
    let defaultPack = this.getLangPack(this.dbData.i18n, this.dbData.i18n.default);
    if(typeof langPack !== 'object'){
      //use default
      outputLang = this.dbData.i18n.default;
      langPack = defaultPack;
      
      //for compitable
      //if(langPack === undefined){
        //console.log('no default langPack, skip');
      //  return this.dbData;
      //}
    }
    
    let translateElement = (element) => {
      let header = "i18n::";
      if((typeof element == 'string')&&(element.indexOf(header) == 0)){
        let key = element.substring(header.length);
        if(key.indexOf('res-i18n-') == 0){
          element = this.getStr(lang, this.dbData.i18n, key);
        }
      }
      else if(typeof element == 'object'){
        for(let i in element){
          element[i] = translateElement(element[i]);
        }
      }
      return element;
    }

    for(let i in this.dbData){
      this.dbData[i] = translateElement(this.dbData[i]);
    }
    this.dbData.language = outputLang;
    return this.dbData;
  }

  getLangPack(i18n, lang) {
    if(typeof lang !== 'string') {
      return undefined;
    }
    if(typeof i18n[lang] === 'object') {
      return i18n[lang];
    }

    for(let i in i18n) {
      if(lang.toLowerCase() === i.toLowerCase()) {
        return i18n[i];
      }
    }
    return undefined;
  }

  getStr(lang, i18n, key){
    let langPack = this.getLangPack(i18n, lang);
    let defaultPack = this.getLangPack(i18n, i18n.default);
    let i18nStr;
    
    if((typeof langPack === 'object') && (typeof langPack[key] === 'string')) {
      i18nStr = langPack[key];
    }
    else {
      i18nStr = defaultPack[key];
    }

    if(typeof i18nStr === 'string'){
      return i18nStr;
    }
    else {
      //pick any lang
      for(let lang in i18n){
        if(lang === 'default'){
          continue;
        }
        if((typeof i18n[lang] === 'object') && 
          (typeof i18n[lang][key] === 'string')) {
          return i18n[lang][key];
        }
      }
      return "";
    }
  }

  makei18n(i18nSchema, inputData, lang) {
    let seq = -1;

    if(typeof this.dbData.i18n !== 'object'){
      this.dbData.i18n = {};
    }
    if(typeof this.getLangPack(this.dbData.i18n, lang) !== 'object'){
      this.dbData.i18n[lang] = {};
    }
    if(typeof this.dbData.i18n.default !== 'string'){
      this.dbData.i18n.default = lang;
    }
    inputData.i18n = this.dbData.i18n;
    let i18nPack = this.getLangPack(inputData.i18n, lang);
    
    let makei18nElement = (schemaData, element, dbDataElement) => {
      seq++;
      if((typeof element === typeof schemaData)&&(_.isEmpty(element) === false)){
        if(typeof element === 'string'){
          let key = null;
          let header = 'i18n::';
          let i18nExisted = false;

          //check string existed
          if((typeof dbDataElement === 'string')&&(dbDataElement.indexOf(header) === 0)){
            key = dbDataElement.substring(header.length);
            let defaultLang = inputData.i18n.default;
            for(let i in this.dbData.i18n) {
              let someLang = this.dbData.i18n[i];
              if(typeof someLang[key] === 'string') {
                i18nExisted = true;
                break;
              }
            }
          }

          if(i18nExisted){
            i18nPack[key] = element;
            element = dbDataElement;
          }
          else {
            key = this.getNewResourceID("i18n", seq);
            i18nPack[key] = element;
            element = header+key;
          }
          
        }
        else if(typeof element === 'object'){

          if(typeof dbDataElement === 'object'){
            if(Array.isArray(element)){
              
              if((element.length > 0) && (element[0].id !== undefined)) {
                element = element.map(e => {
                  let orgE = dbDataElement.find(dbE => dbE.id == e.id);
                  if(orgE !== undefined) {
                    return makei18nElement(schemaData[0], e, orgE);
                  }
                  else {
                    return makei18nElement(schemaData[0], e);
                  }
                });
              }
              else {
                //old compacility
                for(let i in element){
                  element[i] = makei18nElement(schemaData[0], element[i], dbDataElement[i]);
                }
              }
            }
            else{
              for(let i in schemaData){
                element[i] = makei18nElement(schemaData[i], element[i], dbDataElement[i]);
              }
            }
          }
          else {
            if(Array.isArray(element)){
              element = element.map(e => makei18nElement(schemaData[0], e));
              //for(let i in element){
              //  element[i] = makei18nElement(schemaData[0], element[i]);
              //}
            }
            else {
              for(let i in schemaData){
                element[i] = makei18nElement(schemaData[i], element[i]);
              }
            }
          }
        }
    
      };
      return element;
    };
    
    if((typeof this.dbData === 'object')&&(typeof inputData === 'object')) {
      for(let i in i18nSchema){  
        inputData[i] = makei18nElement(i18nSchema[i], inputData[i], this.dbData[i]);
      }
    }
    
    //default lang
    let inputDefaultLang = inputData.default_language;
    if((typeof inputDefaultLang === 'string') && (typeof inputData.i18n[inputDefaultLang] === 'object')){
      inputData.i18n.default = inputDefaultLang;
    }
    delete inputData.default_language;
    
    
    //console.log(inputData);
    return inputData;
  }

  //================ CRUD ========================
  getNewResourceID(type, seq){
    const dateTime = Date.now();
    const timestamp = Math.floor(dateTime);

    let id = `res-${type}-${timestamp}`;
    if((typeof seq == 'string')||(typeof seq == 'number')){
      id += '-'+seq;
    }
    return id;
  }
  
  deleteI18n(targetLang, orgData) {
    let langArray = [];
    for(let i in orgData.i18n) {
      if(i === 'default')
        continue;

      if(i === targetLang)  //skip lang which will be deleted
        continue;

      langArray.push(i);
    }

    if(langArray.length <= 0){
      let err = new Error("Only one language left, cannot be deleted");
      err.statusCode = 403;
      throw err;
    }
    if(typeof orgData.i18n[targetLang] === 'object') {
      delete orgData.i18n[targetLang];
      
      if(orgData.i18n.default == targetLang){
        orgData.i18n.default = langArray[0];
      }
    }
    else {
      let err = new Error("not found");
      err.statusCode = 404;
      throw err;
    }
    return orgData;
  }

}


exports.main = I18n;
