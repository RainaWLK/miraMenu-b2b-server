let AWS = require('aws-sdk');
let AWSCognito = require('amazon-cognito-identity-js');
//let Secrets = require('./secret').Secrets;
let env = require('./enviroment.js');

let poolData = {
    UserPoolId : env.aws.cognito.cognito_user_pool_id, // your user pool id here
    ClientId :  env.aws.cognito.congito_client_id// your app client id here
};

AWS.config.region = env.aws.region;

function signIn(username, password) {
    let userPool = new AWSCognito.CognitoUserPool(poolData);

    let userData = {
        Username : username, // your username here
        Pool : userPool
    };

    let authenticationData = {
        Username : username, // your username here
        Password : password, // your password here
    };

    return new Promise((resolve, reject) => {
        let authenticationDetails = new AWSCognito.AuthenticationDetails(authenticationData);

        //step1: aws cognito user pool sign in
        let cognitoLoginUser = new AWSCognito.CognitoUser(userData);
        cognitoLoginUser.authenticateUser(authenticationDetails, {
            onSuccess: async function (result) {
                let access_token = result.getAccessToken().getJwtToken();
                let id_token = result.getIdToken().getJwtToken();

                console.log(id_token);

                //step2: Integrate into federate identity
                let idp = 'cognito-idp.us-east-1.amazonaws.com/'+ env.aws.cognito.cognito_user_pool_id;
                try{
                    let credentals = await registerFederateIdentityPool(idp, id_token);
                    resolve(credentals);
                }
                catch(err){
                    reject(err);
                }       
            },

            onFailure: function(err) {
                reject(err);
                return;
            }
            /*mfaRequired: function(codeDeliveryDetails) {
                var verificationCode = prompt('Please input verification code' ,'');
                cognitoLoginUser.sendMFACode(verificationCode, this);
            }*/
        });
    });

}


function registerFederateIdentityPool(idp, id_token){
    return new Promise((resolve, reject) => {
        //integrate into federate indentity pool
        let logins = {};
        logins[idp] = id_token;

        console.log(logins);
        //AWS.config.credentials.clearCachedId();
        AWS.config.credentials = new AWS.CognitoIdentityCredentials({
            IdentityPoolId : env.aws.cognito.aws_identity_pool_id,
            Logins : logins
        });

        AWS.config.credentials.refresh((err) => {
            if (err) {
                reject(err);
                return;
            } else {
                console.log('Successfully logged!');
                console.log(AWS.config.credentials);
                resolve(AWS.config.credentials);
            }
        });

    });
}


exports.signIn = signIn;
