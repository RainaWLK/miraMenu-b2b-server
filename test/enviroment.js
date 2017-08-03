process.env.NODE_ENV = "test";
//process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

var chai = require('chai');
let should = chai.should();

chai.use(require('chai-ajv-json-schema'));
chai.use(require('chai-things'));

exports.chai = chai;


//aws
let aws = {
  region: 'us-east-1',
  host: 'aoboid0wkl.execute-api.us-east-1.amazonaws.com',
  //stage: 'development',
  stage: 'auth',
  //credentials: { 
  //  accessKeyId: 'ASIAJEJDSVKVHO5XXC2A',
  //  secretAccessKey: 'klp4D0fEITXLKc7dQPp8a5lOlxuRQbFLz4rIpMIc',
  //  sessionToken: 'AgoGb3JpZ2luEFEaCXVzLWVhc3QtMSKAAhbNLpn5rK6u6RYSi0GpaMYHPCcp0ro2LsoQIg9kNk92WFLZnWiR/bQAJ74sLythAnSp8LYCVTG2V5exCM1NubBf+45heJQNwLkBPqTrag6+8JXOsoX45EpKYO8rwSzYNu4hZ5oA4LDG4aodFwgkzdnMI0Ii3068SjWbX7gUaCUpY2NDYB0gTrjbObL4bl6UM7vRcY/4lpFhPPfkD8hWKVkwnuhxPK7/gV9TuNEAoJMqptpAU9PToHzCObSuEAbXPM1fDXPMWYBjP+2VZUfM+2X7/nlRWTvyY7TqO3jGFXckEG6mEd3Dnz2MHS9zmZ6KAqUN7dhhEXxA6f9mhMsrmvcqrwUI5///////////ARAAGgw1NTI5NTAyNjIyODgiDPsCv34eda/NPB7VGyqDBdkMMELoUvarLknwzw+fZWRWYOSJGZx2BRLeFbsCee7tt9iQqHE56q2THcv3ID6kSOVZAkU9zlyyS9RPyABYEifYiwUDYvI1af+h/aPAzFiXe08js0IOpALs5jC0qEvaSQuozCgbanYymu58Qj4YBt3fyvwxdI8LAx2TF8GsV1M5KbqD7ziXnTNK7koW70pcrg6KhbQTndvwQl034fP16u6PHxRbbCSjdTuunCm8XYolvU5j2AGBu28vg96kp3cfaC5KQguQcen6Xh6C1oVHZWa0k/U1pifoEZ3ANNgq3bnCUku/DyqbY7BOM1o0Ip+PEfIUnZtzvmnlcQD3kEaEoyq4ynxBeUrAYqPcK1AiWgskP8rQy1g7jvWV20MtYBycFujIiv14iRKnj1A6sFoX7LR5y0lECK0oHbpQUohSXmIs3krQfzlRRRrlB8K7fGmcklZSBdLEWmcheoZiFfZciAo0fDc7RsGuF3T7f65sFFez26x+viZIIZ2PPJX1itVS+koSn5RPsmb/XGUZCKQC/5RDn8NRtDY2lSNyeAZZnBm0VRqVM485HJSoUUMI7Op+bsqqTkrW6TBIAX/0Zzsf7659umRPNv/68cQGH+5OeIeoubJwhk/KogJ8l/I17x/AQ71QNYXodqyJdhaUt4X4XyqcC+Ie6tqCgciqrH2ah6LfdYDV9ul5NfyBSU4SsUtOSuN2b0JmuYg+uy7xLWYUFsqoROfW+grgEokoyx+FDzjM1FxNma7fhromkbs+vPJwC6tZjGDZayHfziePQym2UQJdy/ZgVMicG3xaEbLPMoFTVHbsK0w3LVmBDz/S+u0cO7limAczBwFDgpRHnEBjirHJZOIwnOqKzAU='
  //},
  credentials: {},
  cognito: {
    cognito_user_pool_id: "us-east-1_kNIvkACXW",
    congito_client_id: '5bkbb4foiaickvetk89ucq4p2c',    //cognito app client id
    aws_identity_pool_id: 'us-east-1:4ad17068-f8a4-4fed-aaf7-55e7e9a2e7ac'  //federate identity pool
  },
  account: {
    username: 'eee',
    password: '12345678'
  }
}

exports.aws = aws;
exports.server = 'https://'+aws.host+'/'+aws.stage;
//exports.server = 'http://localhost:8081';

