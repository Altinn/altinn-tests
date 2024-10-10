import papaparse from 'https://jslib.k6.io/papaparse/5.1.1/index.js';
import {generateMaskinPortenToken, generateToken} from '../../generate-tokens/src/token-generator.js';
import file from 'k6/x/file';


const environment = __ENV.env.toLowerCase();
const tokenGeneratorUserName = __ENV.tokengenuser;
const tokenGeneratorUserPwd = __ENV.tokengenuserpwd;
const limit = (__ENV.limit === undefined ? 0 : __ENV.limit);
const ttl = (__ENV.ttl === undefined ? 3600 : __ENV.ttl)

const filepath = `../data/data-with-tokens-${environment}.csv`;
const data_file = `../data/data-${environment}.csv`;
const idKeys = papaparse.parse(open(data_file), { header: true }).data;

export const options = { 
  vus: 1,
};

// org,scopes,partyId,pid,ssn,resource
export default function() {
  file.writeString(filepath, 'ssn,resource,token');
  var count = 0
  for (const idKey of idKeys) {
    var tokenGenParams = {
      env: environment,
      org: idKey.org,
      scopes: idKey.scopes,
      partyId: idKey.partyid,
      pid: idKey.pid,
      ttl: ttl
    };
    var token = generateToken(tokenGeneratorUserName, tokenGeneratorUserPwd, tokenGenParams);
    //token = generateMaskinPortenToken(token, environment);
    file.appendString(filepath, `\n${idKey.ssn},${idKey.resource},${token}`);
    count += 1;
    if (count >= limit && limit > 0) break;
  };
}
