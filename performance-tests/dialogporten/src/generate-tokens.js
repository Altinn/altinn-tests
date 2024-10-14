import papaparse from 'https://jslib.k6.io/papaparse/5.1.1/index.js';
import {generateToken} from '../../generate-tokens/src/token-generator.js';
import file from 'k6/x/file';


const environment = __ENV.env.toLowerCase();
const tokenGeneratorUserName = __ENV.tokengenuser;
const tokenGeneratorUserPwd = __ENV.tokengenuserpwd;
const limit = (__ENV.limit === undefined ? 0 : __ENV.limit);
const ttl = (__ENV.ttl === undefined ? 3600 : __ENV.ttl)

const filepath = `../data/.tmp/data-with-tokens-${environment}.csv`;
const data_file = `../data/data-${environment}.csv`;
const idKeys = papaparse.parse(open(data_file), { header: true }).data;

export const options = { 
  vus: 1,
  thresholds: {
    http_req_failed: ['rate<=0.0'],
  },
};

export default function() {
  file.writeString(filepath, 'ssn,resource,mptoken,idtoken');
  var count = 0
  for (const idKey of idKeys) {
    // maskinporten token, used to create dialog
    var mpTokenGenParams = {
      env: environment,
      org: idKey.org,
      orgNo: idKey.orgno,
      scopes: idKey.scopes,
      ttl: ttl
    };
    // ip porten token, used for search
    var idTokenGenParams = {
      env: environment,
      org: idKey.org,
      pid: idKey.ssn,
      scopes: idKey.scopes_search,
      ttl: ttl
    };
    var mp_token = generateToken('enterprise', tokenGeneratorUserName, tokenGeneratorUserPwd, mpTokenGenParams);
    var id_token = generateToken('personal', tokenGeneratorUserName, tokenGeneratorUserPwd, idTokenGenParams);
    file.appendString(filepath, `\n${idKey.ssn},${idKey.resource},${mp_token},${id_token}`);
    count += 1;
    if (count >= limit && limit > 0) break;
  };
}

