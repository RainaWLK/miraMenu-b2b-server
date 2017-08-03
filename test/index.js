import 'babel-polyfill'

let restaurantTest = require('./restaurant.js');
let branchTest = require('./branch.js');
let tableTest = require('./table.js');
let menuTest = require('./menu.js');
let menuTest_restaurant = require('./menu_restaurant.js');
let itemTest = require('./item.js');
let itemTest_restaurant = require('./item_restaurant.js');

let env = require('./enviroment.js');
let aws = require('./aws_login');

before('login', async () => {
    let credentials = await aws.signIn(env.aws.account.username, env.aws.account.password);
    console.log(credentials);

    env.aws.credentials.accessKeyId = credentials.data.Credentials.AccessKeyId;
    env.aws.credentials.secretAccessKey = credentials.data.Credentials.SecretKey;
    env.aws.credentials.sessionToken = credentials.data.Credentials.SessionToken;
    return;
});

//restaurantTest.go();
//branchTest.go();
//tableTest.go();
//menuTest.go();
//menuTest_restaurant.go();
//itemTest.go();
itemTest_restaurant.go();
