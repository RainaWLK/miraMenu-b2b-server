let restaurantTest = require('./restaurant.js');
let branchTest = require('./branch.js');
let tableTest = require('./table.js');
let menuTest = require('./menu.js');
let menuTest_restaurant = require('./menu_restaurant.js');
let menuTest_photo = require('./menu_photo.js');
let itemTest = require('./item.js');
let itemTest_restaurant = require('./item_restaurant.js');
let itemTest_photo = require('./item_photo.js');
let itemTest_resource = require('./item_resource.js');
let itemTest_i18n = require('./item_i18n.js');

let env = require('./enviroment.js');
let aws = require('./aws_login');

before('login', async () => {
    let credentials = await aws.signIn(env.aws.account.username, env.aws.account.password);

    env.aws.credentials.accessKeyId = credentials.data.Credentials.AccessKeyId;
    env.aws.credentials.secretAccessKey = credentials.data.Credentials.SecretKey;
    env.aws.credentials.sessionToken = credentials.data.Credentials.SessionToken;
    return;
});

//restaurantTest.go();
//branchTest.go();
//tableTest.go();
menuTest.go();
//menuTest_restaurant.go();
//itemTest.go();
//itemTest_restaurant.go();
//itemTest_photo.go();
//itemTest_resource.go();
//itemTest_i18n.go();