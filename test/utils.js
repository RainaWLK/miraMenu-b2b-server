function parseID(input){
    let result = {};
    let typeArray = input.match(/[^0-9a-fA-F]/g);
    let pattern = new RegExp(/[^rstmi]/);

    let tail = input.length
    for(let i = 0; i < typeArray.length; i++){
        let type = typeArray[i];

        //check
        if(pattern.test(type)){
            continue;
        }

        let start = input.indexOf(type)+1;

        let end = tail;
        if(i < typeArray.length-1){
        end = input.indexOf(typeArray[i+1]);
        }

        let id = input.substring(start, end);

        result[type] = id;
    }
    return result;
}

exports.parseID = parseID;