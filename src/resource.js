class Resource {
  constructor(resourceCollection){
    this.resourceCollection = resourceCollection;
  }

  getLang(lang, key){
    let resourceData = this.resourceCollection[key];

    if(resourceData.type != 'language'){
      return "";
    }

    if(typeof resourceData.data[lang] == 'string'){
      return resourceData.data[lang];
    }
    return resourceData.data[resourceData.default];
  }
}

exports.main = Resource;