# Load test for tax report
Load test for tax report, does the following, divided in two separate steps

## Steps
1. create tokens
2. upload tax report:
    - create instance
    - upload tax report
    - callbacks and confirm (twice)
    - get receipt id
    - get receipt
## Run locally
1. Clone this repo
2. Go to src directory
3. build k6 with fileextention
4. run k6 extention to create tokens
4. run test
```
git clone <this repo>
cd altinn-test/performance-tests/tax-report/src
xk6 build v0.46.0 --with github.com/avitalique/xk6-file@latest
./k6 run -e env=<> -e tokengenuser=<> -e tokengenuserpwd=<> generate-tokens.js
k6 run -e serviceowner=<> tax-report.js
```
## Github actions
### On push
Runs a test for every push to the performance-loadtest/tax-report directory
- one vu
- one minute
### Scheduled
Runs every morning at 06:15
- 40 vus
- 15 minutes
### Ondemand
Runs when requested
- selectable number of vus
- selectable duration
- selectable runner
  

