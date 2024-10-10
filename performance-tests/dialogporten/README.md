# Load test for dialogporten
Load test for t3search, does the following, divided in two separate steps

## Tests
### Post dialog
The test must:
1. Find a organisation to send a dialog from, a resource to send the dialog on and a user to send the dialog to
2. Get a maskinporten token for orgnisation on resource (and user?)
3. POST a message with token from 2. and payload (message metadata + message?)
### Search messages, enduser
1. Create token for user (and resource?)
2. Send a GET on enduser endpoint
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