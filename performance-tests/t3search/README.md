# Load test for t3search
Load test for t3search, does the following, divided in two separate steps

## Steps
1. create tokens
2. Do a simple search:
    
## Run locally
1. Clone this repo
2. Go to src directory
3. build k6 with fileextention
4. run k6 extention to create tokens
4. run test
```
git clone <this repo>
cd altinn-test/performance-tests/t3search/src
xk6 build v0.46.0 --with github.com/avitalique/xk6-file@latest
./k6 run -e env=<> -e tokengenuser=<> -e tokengenuserpwd=<> ../../generate-tokens/src/generate-tokens.js
k6 run -e subscription_key=<Ocp-Apim-Subscription-Key> t3search.js
```
## Github actions
### On push
Runs a test for every push to the performance-loadtest/t3search directory
- one vu
- one minute
### Ondemand
Runs when requested
- selectable number of vus
- selectable duration
- selectable runner
  