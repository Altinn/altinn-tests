import http from 'k6/http';
import papaparse from 'https://jslib.k6.io/papaparse/5.1.1/index.js';
import { randomItem } from 'https://jslib.k6.io/k6-utils/1.2.0/index.js';
import { SharedArray } from 'k6/data';
import {buildQueryParametersForEndpoint} from '../../generate-tokens/src/token-generator.js';
import { getBaseUrl } from '../../config/config.js';

const environment = __ENV.env;
const filepath = `../data/.tmp/data-with-tokens-${environment}.csv`;

const idKeys = new SharedArray('idKeys', function () {
  return papaparse.parse(open(filepath), { header: true }).data;
});

const baseUrl = `${getBaseUrl(environment)}dialogporten/api/v1/enduser/dialogs`;

export const options = {
  //discardResponseBodies: true,
  summaryTrendStats: ['avg', 'min', 'med', 'max', 'p(95)', 'p(99)', 'p(99.5)', 'p(99.9)', 'count'],
  thresholds: {
    http_req_failed: ['rate<0.01'],
  },
};

export default function() {
  if ((options.vus === undefined || options.vus === 1) && (options.iterations === undefined || options.iterations === 1)) {
    search(idKeys[0]);
  }
  else {
    while (true) { search(randomItem(idKeys)); }
  }
}

export function search(id) {
  var params = {
    headers: {
      Authorization: 'Bearer ' + id.idtoken,
    },
  }

  var queryParams = { ServiceResource: `urn:altinn:resource:${id.resource}` };
  var uri = baseUrl + buildQueryParametersForEndpoint(queryParams);
  var resp = http.get(uri, params);
  var json_resp = resp.json();
  console.log(json_resp.items[0].createdAt);
}