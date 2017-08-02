process.env.NODE_ENV = "test";
//process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

var chai = require('chai');
let should = chai.should();

chai.use(require('chai-ajv-json-schema'));
chai.use(require('chai-things'));

exports.chai = chai;
//exports.server = 'http://localhost:8081';
exports.server = 'https://aoboid0wkl.execute-api.us-east-1.amazonaws.com/development';

//aws
exports.credentials = { 
    accessKeyId: 'ASIAJ2DAI5PD5F3DTNMQ',
    secretAccessKey: 'o8az/ILIfokBm1GOy4AghUuGweaCDKp9v/BjvTwa',
    sessionToken: 'AgoGb3JpZ2luED8aCXVzLWVhc3QtMSKAAgFTZF2GCjYQ3u9d/1SYXkk7pXn3Yq2iZu6PV/FmXPuW3zc3247sWEM34k8zKms3HcjUNn2cKrstroDc+9DURr0xYw9Gfo4ttD5bXOCAySyfe09OtfIUAneKOkm+BLcEop7S3N0ubniRdpb5WuChdIXJa6g1R3efwasipPyQVdz7///ZCztd7BG9m4RQZhSwhIhnM3SNV5o8zCom+awM06kjO5mbKYmREsBzm40AjQz3xOsPJP750RVQaiukBBSuNGB66fIbpuBEBHKFG3fIj3iqmBMeDELGNbwwOs99XwAOerI6lkKdLSM5JQMgmhYdSJOx0yt2TKv7HhH/xlejdjUqrwUI1P//////////ARAAGgw1NTI5NTAyNjIyODgiDGGr8MIZUfu7qFtIhSqDBZ/uim1geeMcz/hT+olqB/moWAeSVY7e4NoWW9KfVgBXAhUTIV39cZbv78bA0Ddui7FUR08YFqiS2CGdaeyuwlGGYLyJvFQVcHx/wjRPEc5W+Oqo9h9VJd9LkjA133TTotHVKIjqQUUDssSAvxUep163LnZ38nq5qTVzgtFTEqsZT/ljAHjBHPSp00a6qQBUp/pyjMyyEKTS2IaJz76+ym8sHd/eSAWAPtLFzBrUD8OYlJVO21EX2EY8QcDDTF+sBQM3LvKwVinwLwML0sH5hIZcArhedaFh8Vz5IU08Ss4L0/quc5LsyKabawEmTvVRsR6ctvB5KFIjeDsCyRQZSRCZeaD+Vyb/V2wtHVwdizDyCfTK7HJwlugyWGd8KfzxlUYsGo5EQ2AaCxus+knDjgjXmODok/YeTviggy7lPRTdQOH8+Xc1EQ4tET7HNahiuTbxKPzARUIfXv0yJlWB1ch19rJOknC/vuTimrBCkL6oYjMlA46Op4yl4fyrpWxXGHNBm0OEd19QY8GD1R/8rEdVGG+i6Ru+kMxWT9SVFYuw94jQSzsGhVCMq4d5ok9xEnn9hBiL+xpgleoO2/kL+ux0AqQptKv6F9i7NJhCk2pTyQ1Bxc9C0TCzILxszjAX482MO9z32emidUewKowvw7euuqg9Q2b9+BqYoLzvZuG4MqAHImvKgkIm6y+vROO11LqLcWZPQUK6ToouNOusDCBj5C9op7X6xgZsQo9tE0fJIF3BxgQ3YdVtKHYPS2xevN5zFKhrRQaWWhRRlPAqyqECJGyoULqLQmmZpyENWE2gs82Bx6uSr0zYrOErZrmozOzJY1J8z3r3vS9pucMBzKAXY2MwudqGzAU='
};