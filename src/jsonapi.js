let _ = require('lodash');

class dataObj {
    constructor(id) {
    	this.id = id;
        this.type = "";
        this.attributes = {};
        this.i18n = [];
        this.resources = [];
    	//this.relationships = {};
        //this.links = {};
    }
}


function makeJSONAPI(path, dataList) {
    let result = {
        "data": {}
    };

    let makeData = (orgData) => {    
        let id = orgData.id;
        delete orgData.id;
        let obj = new dataObj(id);

        obj.type = path;
        if(typeof orgData.language === 'string'){
            obj.language = orgData.language;
            delete orgData.language;
        }
        if((typeof orgData.i18n === 'object') && (_.isEmpty(orgData.i18n) === false)){
            obj.i18n = _.cloneDeep(orgData.i18n);
            delete orgData.i18n;
            
            if(typeof orgData.default_language === 'string'){
                obj.default_language = obj.i18n.default;
                delete orgData.default_language;
            }
        }
        
        obj.attributes = orgData;

        if(typeof orgData.resources != 'undefined'){
            //obj.resources = _.cloneDeep(orgData.resources);
            for(let resource_id in orgData.resources){
                let resourceData = orgData.resources[resource_id];
                resourceData.id = resource_id;
                obj.resources.push(resourceData);
            }
            delete orgData.resources;
        }
        if(obj.resources.length == 0){
            delete obj.resources;
        }

        //obj.relationships = {};
        //obj.links.self = "/"+obj.type+"/"+id;
        return obj;
    }

    if(Array.isArray(dataList)) {
        result.data = [];

        for(let i in dataList) {
            let data = dataList[i];
            let obj = makeData(data);
            result.data.push(obj); 
        }
    }
    else {
        result.data = makeData(dataList);
    }

    return result;
}

function parseJSONAPI(orgData) {
    let data = orgData.data;
    let dbData;

    let makeSingleData = (jsonApiData) => {
        let singleData = jsonApiData.attributes;
        if(typeof data.id != 'undefined')
            singleData.id = data.id;
        if(typeof data.language != 'undefined')
            singleData.language = data.language;
        if(typeof data.default_language != 'undefined')
            singleData.default_language = data.default_language;
        return singleData;
    }

    if(Array.isArray(data)){
        dbData = [];
        for(let i in data){
            dbData.push(makeSingleData(data[i]));
        }
    }
    else{
        dbData = makeSingleData(data);
    }

    return dbData;
}



exports.makeJSONAPI = makeJSONAPI;
exports.parseJSONAPI = parseJSONAPI;