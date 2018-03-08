'use strict';
import 'babel-polyfill'
//require('./logger.js');
let Rest = require('./rest.js');
let Restaurant_API = require('./apis/restaurant_api.js');
let Branch_API = require('./apis/branch_api.js');
let Table_API = require('./apis/table_api.js');
let Menu_API = require('./apis/menu_api.js');
let Item_API = require('./apis/item_api.js');

let api = new Rest.main();

Restaurant_API.go(api);
Branch_API.go(api);
Table_API.go(api);
Menu_API.go(api);
Item_API.go(api);

//for compatility
let Restaurant_API_old = require('./apis/restaurant_api_old.js');
let Branch_API_old = require('./apis/branch_api_old.js');
let Table_API_old = require('./apis/table_api_old.js');
let Menu_API_old = require('./apis/menu_api_old.js');
let Item_API_old = require('./apis/item_api_old.js');

Restaurant_API_old.go(api);
Branch_API_old.go(api);
Table_API_old.go(api);
Menu_API_old.go(api);
Item_API_old.go(api);

//for unittest
//let utils = require('./utils');
//utils.unittest();


module.exports = api.app;
