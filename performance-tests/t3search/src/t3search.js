import http from 'k6/http';
import papaparse from 'https://jslib.k6.io/papaparse/5.1.1/index.js';
import { randomItem } from 'https://jslib.k6.io/k6-utils/1.2.0/index.js';
import { SharedArray } from 'k6/data';
import { textSummary } from 'https://jslib.k6.io/k6-summary/0.0.2/index.js';
import { htmlReport } from "https://raw.githubusercontent.com/benc-uk/k6-reporter/main/dist/bundle.js";

const idKeys = new SharedArray('idKeys', function () {
  return papaparse.parse(open('data-with-tokens.csv'), { header: true }).data;
});

const subscription_key = __ENV.subscription_key;

export const options = {
  discardResponseBodies: true,
  summaryTrendStats: ['avg', 'min', 'med', 'max', 'p(95)', 'p(99)', 'p(99.5)', 'p(99.9)', 'count'],
  thresholds: {
    http_req_failed: ['rate<0.01'],
  },

};

export function setup() {
  var data = {
    searchUrlYt: `https://platform.yt01.altinn.cloud/storage/api/v1/sbl/instances/search`,
    idKeys: []
  };

  for (const idKey of idKeys) {
    data.idKeys.push({
      partyId: idKey.partyId, 
      userId: idKey.userId,
      ssn: idKey.ssn,
      token: idKey.token
    });
    if ((options.vus === undefined || options.vus === 1) && (options.iterations === undefined || options.iterations === 1)) {
      break;
    }
  };
  return data;
}

export default function(data) {
  if ((options.vus === undefined || options.vus === 1) && (options.iterations === undefined || options.iterations === 1)) {
    search(data, data.idKeys[0]);
  }
  else {
    while (true) { search(data, randomItem(data.idKeys)); }
  }
}

export function search(data, id) {
  var query = 
    {
      Language: 'nb',
      InstanceOwnerPartyIdList: [ id.partyId ],
      FromCreated: new Date(2018, 12, 12),
      ToCreated: new Date(2099, 1, 1),
      IncludeActive: false,
      IncludeArchived: true
    };

  var params = {
    headers: {
      Authorization: 'Bearer ' + id.token,
      'Content-Type': 'application/json',
      'Ocp-Apim-Subscription-Key': subscription_key
    },
  }

  var request_body = JSON.stringify(query)
  http.post(data.searchUrlYt, request_body, params);
}

export function handleSummary(data) {
  return {
    'stdout': textSummary(data, { indent: ' ', enableColors: true }),
    'stdout.txt': textSummary(data, { indent: ' ', enableColors: true }),
    "summary.html": htmlReport(data),
  };
}
