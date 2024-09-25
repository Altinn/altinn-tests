import papaparse from 'https://jslib.k6.io/papaparse/5.1.1/index.js';
import { SharedArray } from 'k6/data';
import {generateToken} from './token-generator.js';
import file from 'k6/x/file';


const environment = __ENV.env.toLowerCase();
const tokenGeneratorUserName = __ENV.tokengenuser;
const tokenGeneratorUserPwd = __ENV.tokengenuserpwd;

const filepath = 'data-with-tokens.csv';
const idKeys = new SharedArray('idKeys', function () {
  return papaparse.parse(open('data.csv'), { header: true }).data;
});

export const options = { 
  vus: 1,
};

export default function(data) {
  file.writeString(filepath, 'userId,partyId,ssn,token');
  for (const idKey of idKeys) {
    var tokenGenParams = {
      env: environment,
      userId: idKey.userid,
      partyId: idKey.partyid,
      pid: idKey.ssn,
      ttl: 3600*24*10,
    };
    var token = generateToken(tokenGeneratorUserName, tokenGeneratorUserPwd, tokenGenParams);
    file.appendString(filepath, `\n${idKey.userid},${idKey.partyid},${idKey.ssn},${token}`);
  };
}