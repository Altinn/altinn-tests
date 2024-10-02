import http from 'k6/http';
import { check } from 'k6';
import encoding from 'k6/encoding';
import { fail } from 'k6';

export function generateToken(userName, userPwd, queryParams) {
  const credentials = `${userName}:${userPwd}`;
  const encodedCredentials = encoding.b64encode(credentials);
  var endpoint = 'https://altinn-testtools-token-generator.azurewebsites.net/api/GetPersonalToken';
  endpoint += buildQueryParametersForEndpoint(queryParams);
  var params = {
    headers: {
      Authorization: `Basic ${encodedCredentials}`,
    },
  };

  var token = http.get(endpoint, params);
  if (token.status != 200) stopIterationOnFail('token gen failed', false, token);
  token = token.body;
  return token;
}

export function buildQueryParametersForEndpoint(filterParameters) {
    var query = '?';
    Object.keys(filterParameters).forEach(function (key) {
        if (Array.isArray(filterParameters[key])) {
            filterParameters[key].forEach((value) => {
            query += key + '=' + value + '&';
        });
        } else {
            query += key + '=' + filterParameters[key] + '&';
        }
    });
    query = query.slice(0, -1);
    return query;
}

export function stopIterationOnFail(testName, success, res) {
    if (!success && res != null) {
        console.log("fail 1");
        fail(testName + ': Response code: ' + res.status);
    } else if (!success) {
        console.log("fail 2");
        fail(testName);
    }
}
