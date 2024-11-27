#!/bin/bash

# Check if required environment variables are set
if [ -z "$TOKEN_GENERATOR_USERNAME" ] || [ -z "$TOKEN_GENERATOR_PASSWORD" ] || [ -z "$API_ENVIRONMENT" ]; then
    echo "Error: TOKEN_GENERATOR_USERNAME, TOKEN_GENERATOR_PASSWORD, and API_ENVIRONMENT must be set"
    exit 1
fi

# Function to display usage information
usage() {
    echo "Usage: $0 <testdatafilepath> <limit>"
    echo "  <testdatafilepath>: Path to the test data files"
    echo "  <limit>: limit number of tokens to generate. 0 means generate all"
    exit 1
}

# Validate arguments
if [ $# -ne 2 ]; then
    usage
fi

tokengenuser=${TOKEN_GENERATOR_USERNAME}
tokengenpasswd=${TOKEN_GENERATOR_PASSWORD}

env=""
case $API_ENVIRONMENT in
    "at21")
        env="at21" ;;
    "tt02")
        env="tt02" ;;
    "yt01")
        env="yt01" ;;
    *)
        echo "Error: Unknown api environment $API_ENVIRONMENT"
        exit 1 ;;
esac

testdatafilepath=$1
limit=$2

enduser_datafile="$testdatafilepath/data-$API_ENVIRONMENT.csv"
enduser_tokenfile=".data-with-tokens.csv"

if [ ! -f "$enduser_datafile" ]; then
    echo "Error: Input file not found: $enduser_datafile"
    exit 1
fi
echo "userId,partyId,ssn,token" > $enduser_tokenfile
generated=0
while IFS=, read -r partyId userId ssn
do
    if [ $limit -gt 0 ] && [ $generated -gt $limit ]; then
        break
    fi
    url="https://altinn-testtools-token-generator.azurewebsites.net/api/GetPersonalToken?env=$env&userId=$userId&partyId=$partyId&pid=$ssn&ttl=3600"
    token=$(curl -s -f $url -u "$tokengenuser:$tokengenpasswd" )
    if [ $? -ne 0 ]; then
        echo "Error: Failed to generate personal token for: $ssn, $scopes "
        continue
    fi
    echo "$userId,$partyId,$ssn,$token" >> $enduser_tokenfile
    status=$?
    if [ $status -ne 0 ]; then
        echo "Error: Failed to write personal token to file for: $ssn"
    else
        ((generated++))
    fi

    
done < <(tail -n +2 $enduser_datafile)