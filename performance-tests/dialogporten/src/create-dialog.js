import http from 'k6/http';
import papaparse from 'https://jslib.k6.io/papaparse/5.1.1/index.js';
import { randomItem } from 'https://jslib.k6.io/k6-utils/1.2.0/index.js';
import { SharedArray } from 'k6/data';

const environment = __ENV.env.toLowerCase();
const baseUrl = `https://platform.${environment}.altinn.no/dialogporten/api/v1/serviceowner/dialogs`
const filepath = `data-with-tokens-${environment}.csv`;

const message = JSON.parse(open('dialog.json'));
const idKeys = new SharedArray('idKeys', function () {
  return papaparse.parse(open(filepath), { header: true }).data;
});

export const options = {
    summaryTrendStats: ['avg', 'min', 'med', 'max', 'p(95)', 'p(99)', 'p(99.5)', 'p(99.9)', 'count'],
    thresholds: {
      http_req_failed: ['rate<0.01'],
    },
};  

export default function() {
    if ((options.vus === undefined || options.vus === 1) && (options.iterations === undefined || options.iterations === 1)) {
      create_dialog(idKeys[0]);
    }
    else {
      while (true) { create_dialog(randomItem(idKeys)); }
    }
  }

export function create_dialog(id) {
    var endPoint = baseUrl
    var params = {
      headers: {
        Authorization: 'Bearer ' + id.token,
        'Content-Type': 'application/json',
      },
      tags: { name: 'create_dialog' }
    };
    message.serviceResource = `urn:altinn:resource:${id.resource}`;
    message.party = `urn:altinn:person:identifier-no:${id.ssn}`;
    console.log(message.serviceResource);
    console.log(message.party);
    var resp = http.post(endPoint, JSON.stringify(message), params);
    console.log(resp.status_text);
}
  
