class I18n {
  constructor(i18nCollection){
    this.i18nCollection = i18nCollection;
  }

  getLang(lang, key){
    let i18nData = this.i18nCollection[key];

    if(typeof i18nData.data[lang] == 'string'){
      return i18nData.data[lang];
    }
    return i18nData.data[i18nData.default];
  }
}

exports.main = I18n;