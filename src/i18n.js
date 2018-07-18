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
    let langPack = this.dbData.i18n[lang];
    let defaultPack = this.dbData.i18n[this.dbData.i18n.default];
    if(typeof langPack !== 'object'){
      //use default
      outputLang = this.dbData.i18n.default;
      langPack = defaultPack;
      
      //for compitable
      if(langPack === undefined){
        //console.log('no default langPack, skip');
        return this.dbData;
      }
    }
    
    let translateElement = (element) => {
      let header = "i18n::";
      if((typeof element == 'string')&&(element.indexOf(header) == 0)){
        let key = element.substring(header.length);
        if(key.indexOf('res-i18n-') == 0){
          element = this.getStr(langPack, defaultPack, key);
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

  getStr(langPack, defaultPack, key){
    let i18nStr = langPack[key];

    if(typeof i18nStr === 'string'){
      return i18nStr;
    }
    else {
      i18nStr = defaultPack[key];
      if(typeof i18nStr === 'string'){
        return i18nStr;
      }
      return "";
    }
  }

  makei18n(i18nSchema, inputData, lang) {
    let seq = -1;

    if(typeof this.dbData.i18n !== 'object'){
      this.dbData.i18n = {};
    }
    if(typeof this.dbData.i18n[lang] !== 'object'){
      this.dbData.i18n[lang] = {};
    }
    if(typeof this.dbData.i18n.default !== 'string'){
      this.dbData.i18n.default = lang;
    }
    inputData.i18n = this.dbData.i18n;
    let i18nPack = inputData.i18n[lang];
    
    let makei18nElement = (schemaData, element, dbDataElement) => {
      seq++;
      if((typeof element === typeof schemaData)&&(_.isEmpty(element) === false)){
        if(typeof element === 'string'){
          let key = null;
          let header = 'i18n::';
          let i18nExisted = false;

          //check string existed
          console.log(element);
          console.log(dbDataElement);
          if((typeof dbDataElement === 'string')&&(dbDataElement.indexOf(header) === 0)){
            key = dbDataElement.substring(header.length);
            console.log('dbDataElement == string');
            let defaultLang = inputData.i18n.default;
            if(typeof this.dbData.i18n[defaultLang][key] === 'string'){
              i18nExisted = true;
              
              console.log("i18n existed");
            }
          }

          if(i18nExisted){
            console.log("--key--");
            console.log(key);
            console.log(i18nPack[key]);
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
              console.log('array type');
              
              if((element.length > 0) && (typeof element[0].id === 'string')) {
                element = element.map(e => {
                  let orgE = dbDataElement.find(dbE => dbE.id = e.id);
                  return makei18nElement(schemaData[0], e, orgE);
                });
              }
              else {
                console.log('old compacility');
                //old compacility
                for(let i in element){
                  element[i] = makei18nElement(schemaData[0], element[i], dbDataElement[i]);
                }
              }
            }
            else{
              console.log('object type');
              for(let i in schemaData){
                element[i] = makei18nElement(schemaData[i], element[i], dbDataElement[i]);
              }
            }
          }
          else {
            console.log("makei18n dbDataElement !== object");
            console.log(element);
            if(Array.isArray(element)){
              console.log('array type2');
              element = element.map(e => makei18nElement(schemaData[0], e));
              //for(let i in element){
              //  element[i] = makei18nElement(schemaData[0], element[i]);
              //}
            }
            else {
              console.log('object type2');
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
