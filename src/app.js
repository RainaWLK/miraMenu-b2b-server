'use strict';
import 'babel-polyfill'
let Rest = require('./rest.js');
let Restaurant_API = require('./apis/restaurant_api');
let Branch_API = require('./apis/branch_api');
let Table_API = require('./apis/table_api');
let Menu_API = require('./apis/menu_api');
let Item_API = require('./apis/item_api');

let api = new Rest.main();

Restaurant_API.go(api);
Branch_API.go(api);
Table_API.go(api);
Menu_API.go(api);
Item_API.go(api);


module.exports = api.app;
