class dataObj {
    constructor(id) {
    	this.id = id;
    	this.type = "";
    	this.attributes = {};
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
    console.log('==parseJSONAPI==');
    //console.log(orgData);
    let data = orgData.data;
    //console.log(data);

    let dbData = data.attributes;

    if(typeof data.id != 'undefined')
        dbData.id = data.id;

    //console.log(dbData);
    return dbData;
}

exports.makeJSONAPI = makeJSONAPI;
exports.parseJSONAPI = parseJSONAPI;