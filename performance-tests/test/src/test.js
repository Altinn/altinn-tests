import http from 'k6/http';
import { group, check } from 'k6';
import papaparse from 'https://jslib.k6.io/papaparse/5.1.1/index.js';
import { randomItem } from 'https://jslib.k6.io/k6-utils/1.2.0/index.js';
import { SharedArray } from 'k6/data';
import { textSummary } from 'https://jslib.k6.io/k6-summary/0.0.2/index.js';
import { htmlReport } from "https://raw.githubusercontent.com/benc-uk/k6-reporter/main/dist/bundle.js";
import {generateToken, stopIterationOnFail} from './token-generator.js';
const taxXml = open('tax.xml', 'b');

const messages = ["KKKKKKKKKK"];

export const options = {
  summaryTrendStats: ['avg', 'min', 'med', 'max', 'p(95)', 'p(99)', 'p(99.5)', 'p(99.9)', 'count'],
  thresholds: {
    'http_req_duration{group:create_instance}': [],
    'http_req_duration{group:upload_data}': [],
    'http_req_duration{group:trigger_callback_and_confirm}': [],
    'http_req_duration{group:get_receipt_id}': [],
    'http_req_duration{group:get_receipt}': [],
    'http_req_duration{all:all}': [],
    'http_reqs{group:create_instance}': [],
    'http_reqs{group:upload_data}': [],
    'http_reqs{group:trigger_callback_and_confirm}': [],
    'http_reqs{group:get_receipt_id}': [],
    'http_reqs{group:get_receipt}': [],
    'http_reqs{all:all}': [],
  },

};

export function setup() {
  var data = {
    environment: __ENV.YTENVIRONMENT.toLowerCase(),
    userId: __ENV.userid,
    partyId: __ENV.partyid,
    ssn: __ENV.ssn,
    serviceOwner: __ENV.serviceowner,
    searchUrlYt: `https://${__ENV.serviceowner}.apps.yt01.altinn.cloud/`,
    basePath: (__ENV.serviceowner == 'ttd' ? "ttd/skattemelding-kopi" : "skd/formueinntekt-skattemelding-v2"),
    idKeys: []
  };
  var tokenGeneratorUserName = __ENV.tokengenuser;
  var tokenGeneratorUserPwd =  __ENV.tokengenuserpwd;
  var tokenGenParams = {
      env: data.environment,
      userId: data.userId,
      partyId: data.partyId,
      pid: data.ssn,
      ttl: 3600*24*10,
  };
  
  var token = generateToken(tokenGeneratorUserName, tokenGeneratorUserPwd, tokenGenParams);
  token = token.body;
  data.idKeys.push({
      partyId: data.partyId, 
      userId: data.userId,
      ssn: data.ssn,
      token: token,
  });
  return data;
}

export default function(data) {
  if ((options.vus === undefined || options.vus === 1) && (options.iterations === undefined || options.iterations === 1)) {
    console.log("Single call");
    submit_tax(data, data.idKeys[0]);
  }
  else {
    while (true) { submit_tax(data, randomItem(data.idKeys)); }
    // data.forEach((id) => {
    //   submit_tax(id);
    // });
  }
}

export function submit_tax(data, id) {
  http.get('https://test.k6.io');
  // group("Submit tax report", function () {
  //     // 1. Create instance
  //   var instance_resp = create_instance(data, id);
  //   if (instance_resp.status != 201) return; 

  //   // 2. Uplod tax report
  //   var instance = instance_resp.json();
  //   var upload_resp = upload_data(data, instance, id);
  //   if (upload_resp.status != 201) return; 

  //   // 3 & 4. Trigger callback and confirm
  //   var cb_c_resp = trigger_callback_and_confirm(data, instance, id);
  //   if (cb_c_resp.status != 200) return;
  //   cb_c_resp = trigger_callback_and_confirm(data, instance, id);
  //   if (cb_c_resp.status != 200) return;

  //   // 5. Get receipt id
  //   var receipt_id_resp = get_receipt_id(data, instance, id);
  //   if (receipt_id_resp.status != 200) return;

  //   // 6. Get receipt
  //   var receipt_element = receipt_id_resp.json().data.find(x => x.dataType === "Skattemeldingsapp_v2")
  //   var receipt_resp = get_receipt(data, instance, id, receipt_element.id)
  // });
  
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

  console.log(data.searchUrlYt);
  console.log(data.basePath);
    
  var endPoint = data.searchUrlYt + data.basePath + "/instances";
  var params = {
    headers: {
      Authorization: 'Bearer ' + id.token,
      'Content-Type': 'application/json'
    },
    tags: { group: 'create_instance', all: 'all' }
  };

  var request_body = JSON.stringify(instance)
  console.log(endPoint);
  console.log(params);
  console.log(request_body);
  var resp = http.post(endPoint, request_body, params);
  console.log(endPoint);
  console.log(resp.status_text);
  check(resp, {
    'instance generation is success': (r) => r.status === 201,
  });
  return resp;
}

export function upload_data(data, instance, id) {
  var endPoint = data.searchUrlYt + data.basePath + "/instances/" + instance.id + "/data?dataType=skattemeldingOgNaeringsspesifikasjon";
  var params = {
    headers: {
      Authorization: 'Bearer ' + id.token,
      'Content-Type': 'text/xml',
      'Content-Disposition': 'attachment; filename=\"skattemelding.xml\"'
    },
    tags: { group: 'upload_data', all: 'all' }
  };
  var resp = http.post(endPoint, taxXml, params);
  check(resp, {
    'upload tax is success': (r) => r.status === 201,
  });
  return resp;
}

export function trigger_callback_and_confirm(data, instance, id) {
  var endPoint = data.searchUrlYt + data.basePath + "/instances/" + instance.id + "/process/next"
  var params = { 
    headers: {
      Authorization: 'Bearer ' + id.token
    },
    tags: { group: 'trigger_callback_and_confirm', all: 'all' }
  }
  var resp = http.put(endPoint, null, params);
  check(resp, {
    'process next tax is success': (r) => r.status === 200,
  });
  return resp;
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
    tags: { group: tag, all: 'all' }
  }
  var resp = http.get(endPoint, params);
  check(resp, {
    'get receipt is success': (r) => r.status === 200,
  });
  return resp;
}

export function handleSummary2(data) {
  return {
    'summary.json': JSON.stringify(data), //the default data object
  };
}

export function my_summary(data) {
  console.log("my_summary");
  console.log(messages);
  var lines = [];
  lines.push("sjekker egen stout");
  lines.push("funker det?");
  return lines.join('\n');
}

// export function handleSummary(data) {
//   return {
//     'stdout': my_summary(data, { indent: ' ', enableColors: true }),
//     'stdout.txt': textSummary(data, { indent: ' ', enableColors: true }),
//     'summary.json': JSON.stringify(data), //the default data object
//     "summary.html": htmlReport(data),
//   };

//   // return {
//   //   'junit.xml': jUnit(data), // Transform summary and save it as a JUnit XML...
//   // };
// }
