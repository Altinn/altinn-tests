import http from 'k6/http';
import { group } from 'k6';
import papaparse from 'https://jslib.k6.io/papaparse/5.1.1/index.js';
import { randomItem } from 'https://jslib.k6.io/k6-utils/1.2.0/index.js';
import { SharedArray } from 'k6/data';
import { textSummary } from 'https://jslib.k6.io/k6-summary/0.0.2/index.js';
import { htmlReport } from "https://raw.githubusercontent.com/benc-uk/k6-reporter/main/dist/bundle.js";

const taxXml = open('tax.xml', 'b');
const idKeys = new SharedArray('idKeys', function () {
  return papaparse.parse(open('data-with-tokens.csv'), { header: true }).data;
});

export const options = {
  summaryTrendStats: ['avg', 'min', 'med', 'max', 'p(95)', 'p(99)', 'p(99.5)', 'p(99.9)', 'count'],
  thresholds: {
    http_req_failed: ['rate<0.01'],
    'http_req_duration{name:create_instance}': [],
    'http_req_duration{name:upload_data}': [],
    'http_req_duration{name:trigger_callback_and_confirm}': [],
    'http_req_duration{name:get_receipt_id}': [],
    'http_req_duration{name:get_receipt}': [],
    'http_reqs{name:create_instance}': [],
    'http_reqs{name:upload_data}': [],
    'http_reqs{name:trigger_callback_and_confirm}': [],
    'http_reqs{name:get_receipt_id}': [],
    'http_reqs{name:get_receipt}': [],
  },

};

export function setup() {
  var data = {
    searchUrlYt: `https://${__ENV.serviceowner}.apps.yt01.altinn.cloud/`,
    basePath: (__ENV.serviceowner == 'ttd' ? "ttd/skattemelding-kopi" : "skd/formueinntekt-skattemelding-v2"),
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
    submit_tax(data, data.idKeys[0]);
  }
  else {
    while (true) { submit_tax(data, randomItem(data.idKeys)); }
  }
}

export function submit_tax(data, id) {
  group("Submit tax report", function () {
    
    // 1. Create instance
    var instance_resp = create_instance(data, id);
    if (instance_resp.status != 201) return;
    
    // 2. Uplod tax report
    var instance = instance_resp.json();
    var upload_resp = upload_data(data, instance, id);
    if (upload_resp.status != 201) return; 

    // 3 & 4. Trigger callback and confirm
    var cb_c_resp = trigger_callback_and_confirm(data, instance, id);
    if (cb_c_resp.status != 200) return;
    cb_c_resp = trigger_callback_and_confirm(data, instance, id);
    if (cb_c_resp.status != 200) return;

    // 5. Get receipt id
    var receipt_id_resp = get_receipt_id(data, instance, id);
    if (receipt_id_resp.status != 200) return;

    // 6. Get receipt
    var receipt_element = receipt_id_resp.json().data.find(x => x.dataType === "Skattemeldingsapp_v2")
    get_receipt(data, instance, id, receipt_element.id)

  });
  
}

export function create_instance(data, id) {
  var instance = 
    {
      InstanceOwner: { 
        PartyId: id.partyId 
      },
      AppId: data.basePath,
      DataValues: { inntektsaar: "2021" }
    };

  var endPoint = data.searchUrlYt + data.basePath + "/instances";
  var params = {
    headers: {
      Authorization: 'Bearer ' + id.token,
      'Content-Type': 'application/json'
    },
    tags: { name: 'create_instance' }
  };

  var request_body = JSON.stringify(instance)
  return http.post(endPoint, request_body, params);
}

export function upload_data(data, instance, id) {
  var endPoint = data.searchUrlYt + data.basePath + "/instances/" + instance.id + "/data?dataType=skattemeldingOgNaeringsspesifikasjon";
  var params = {
    headers: {
      Authorization: 'Bearer ' + id.token,
      'Content-Type': 'text/xml',
      'Content-Disposition': 'attachment; filename=\"skattemelding.xml\"'
    },
    tags: { name: 'upload_data' }
  };
  return http.post(endPoint, taxXml, params);
}

export function trigger_callback_and_confirm(data, instance, id) {
  var endPoint = data.searchUrlYt + data.basePath + "/instances/" + instance.id + "/process/next"
  var params = { 
    headers: {
      Authorization: 'Bearer ' + id.token
    },
    tags: { name: 'trigger_callback_and_confirm' }
  }
  return http.put(endPoint, null, params);
}

export function get_receipt_id(data, instance, id) {
  var endPoint = data.searchUrlYt + data.basePath + "/instances/" + instance.id
  return http_get_with_token(endPoint, id.token, "get_receipt_id");
}

export function get_receipt(data, instance, id, receipt_id) {
  var endPoint = data.searchUrlYt + data.basePath + "/instances/" + instance.id + "/data/" + receipt_id;
  return http_get_with_token(endPoint, id.token, "get_receipt");
}

export function http_get_with_token(endPoint, token, tag) {
  var params = { 
    headers: {
      Authorization: 'Bearer ' + token
    },
    tags: { name: tag }
  }
  return http.get(endPoint, params);
}

export function handleSummary(data) {
  return {
    'stdout': textSummary(data, { indent: ' ', enableColors: true }),
    'stdout.txt': textSummary(data, { indent: ' ', enableColors: true }),
    "summary.html": htmlReport(data),
  };
}
