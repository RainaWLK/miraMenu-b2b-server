let _ = require('lodash');

class dataObj {
    constructor(id) {
    	this.id = id;
    	this.type = "";
        this.attributes = {};
        this.resources = {};
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
        obj.attributes = orgData;

        if(typeof orgData.resources != 'undefined'){
            obj.resources = _.cloneDeep(orgData.resources);         
            delete orgData.resources;
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

    let dbData = data.attributes;

    if(typeof data.id != 'undefined')
        dbData.id = data.id;

    return dbData;
}

exports.makeJSONAPI = makeJSONAPI;
exports.parseJSONAPI = parseJSONAPI;