# Load test for dialogporten
Load test for t3search, does the following, divided in two separate steps

## Tests
### Create dialog
1. Generate maskinporten token
Needed parameters:
- env: environment to run in: yt01 | at21 ...
- org: organisation that sends the dialog, text string
- orgNo: Organisation number (9 digits)
- scopes: digdir:dialogporten.serviceprovider
2. Create dialog
Needed parameters:
- token from 1.
- ssn: personnummer (11 digits)
- resource: super-simple-service

### Search messages, enduser
1. Create token for user
Needed parameters
- env: environment to run in
- org: 
- pid: ssn or orgNo
- scopes:
2. Search
- ssn
- resource
- token
### Search messages, graphQL
    
## Run locally
1. Clone this repo
2. Go to src directory
3. build k6 with fileextention
4. run k6 extention to create tokens
5. run test
```
git clone <this repo>
cd altinn-test/performance-tests/dialogporten/src
xk6 build v0.46.0 --with github.com/avitalique/xk6-file@latest
./k6 run -e env=<> -e tokengenuser=<> -e tokengenuserpwd=<> ./generate-maskinporten-tokens.js
k6 run create-dialog.js -e env=<>  
```
## Github actions
### On push
Runs a test for every push to the performance-loadtest/dialogporten directory
- one vu
- one minute
### Ondemand
Runs when requested
- selectable number of vus
- selectable duration
- selectable runner