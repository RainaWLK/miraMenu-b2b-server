function parseID(input){
  let result = {};
  if(typeof input == 'undefined'){
    return result;
  }
  let typeArray = input.match(/[^0-9a-fA-F\-]/g);
  let pattern = new RegExp(/[^rstmip]/);

  let tail = input.length;
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

function makeFullID(idArray){

  let id = "";
  if(typeof idArray.r != 'undefined'){
    id += `r${idArray.r}`;
  }
  if(typeof idArray.s != 'undefined'){
    id += `s${idArray.s}`;
  }
  if(typeof idArray.t != 'undefined'){
    id += `t${idArray.t}`;
  }
  if(typeof idArray.m != 'undefined'){
    id += `m${idArray.m}`;
  }  
  if(typeof idArray.i != 'undefined'){
    id += `i${idArray.i}`;
  }
  if(typeof idArray.p != 'undefined'){
    id += `p${idArray.p}`;
  }
  console.log(`makeFullID=${id}`);
  return id;
}

function makePath(idArray){

  let path = "";
  if(typeof idArray.r != 'undefined'){
    path += `/restaurants/r${idArray.r}`;
  }
  if(typeof idArray.s != 'undefined'){
    path += `/branches/s${idArray.s}`;
  }
  if(typeof idArray.t != 'undefined'){
    path += `/tables/t${idArray.t}`;
  }
  if(typeof idArray.m != 'undefined'){
    path += `/menus/m${idArray.m}`;
  }  
  if(typeof idArray.i != 'undefined'){
    path += `/items/i${idArray.i}`;
  }
  if(typeof idArray.p != 'undefined'){
    path += `/photos/p${idArray.p}`;
  }
  path = path.slice(1);
  return path;
}

function objToArray(obj){
    let resultArray = [];
    for(let id in obj){
      let element = obj[id];
      element.id = id;
      resultArray.push(element);
    }
    return resultArray;
}

function getURI(URI, idArray){
  let path = URI;
  if(typeof idArray.r != 'undefined'){
    path = path.replace('{restaurant_id}', `r${idArray.r}`);
  }
  if(typeof idArray.s != 'undefined'){
    path = path.replace('{branch_id}', `s${idArray.s}`);
  }
  if(typeof idArray.t != 'undefined'){
    path = path.replace('{table_id}', `t${idArray.t}`);
  }
  if(typeof idArray.m != 'undefined'){
    path = path.replace('{menu_id}', `m${idArray.m}`);
  }  
  if(typeof idArray.i != 'undefined'){
    path = path.replace('{item_id}', `i${idArray.i}`);
  }
  if(typeof idArray.p != 'undefined'){
    path = path.replace('{photo_id}', `p${idArray.p}`);
  }
  console.log("====getURI====");
  console.log(path);
  return path;
}

function _sleep(ms){
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve();
    }, ms);
  });
}

exports.parseID = parseID;
exports.makePath = makePath;
exports.makeFullID = makeFullID;
exports.objToArray = objToArray;
exports.getURI = getURI;
exports._sleep = _sleep;