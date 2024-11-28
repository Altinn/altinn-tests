param (
    [Parameter(Mandatory=$true)]
    [string]$TOKEN_GENERATOR_USERNAME,
    [Parameter(Mandatory=$true)]
    [string]$TOKEN_GENERATOR_PASSWORD,
    [Parameter(Mandatory=$true)]
    [string]$API_ENVIRONMENT,
    [Parameter(Mandatory=$true)]
    [string]$testdatafilepath,
    [Parameter(Mandatory=$true)]
    [int]$limit
)

# Check if required environment variables are set
if (-not $TOKEN_GENERATOR_USERNAME -or -not $TOKEN_GENERATOR_PASSWORD -or -not $API_ENVIRONMENT) {
    Write-Host "Error: TOKEN_GENERATOR_USERNAME, TOKEN_GENERATOR_PASSWORD, and API_ENVIRONMENT must be set"
    exit 1
}

# Function to display usage information
function Usage {
    Write-Host "Usage: $PSCommandPath -testdatafilepath <testdatafilepath> -limit <limit>"
    Write-Host "  <testdatafilepath>: Path to the test data files"
    Write-Host "  <limit>: limit number of tokens to generate. 0 means generate all"
    exit 1
}

# Validate arguments
#if ($args.Length -ne 2) {
#    Usage
#}

$tokengenuser = $env:TOKEN_GENERATOR_USERNAME
$tokengenpasswd = $env:TOKEN_GENERATOR_PASSWORD

$env = ""
switch ($API_ENVIRONMENT) {
    "at21" { $env = "at21" }
    "tt02" { $env = "tt02" }
    "yt01" { $env = "yt01" }
    default {
        Write-Host "Error: Unknown api environment $API_ENVIRONMENT"
        exit 1
    }
}

$enduser_datafile = "$testdatafilepath/data-$API_ENVIRONMENT.csv"
$enduser_tokenfile = ".data-with-tokens.csv"

if (-not (Test-Path $enduser_datafile)) {
    Write-Host "Error: Input file not found: $enduser_datafile"
    exit 1
}

"userId,partyId,ssn,token" | Out-File -FilePath $enduser_tokenfile -Encoding utf8
$status = $?
if ($status -ne 1) {
    Write-Host "Error: Failed to write header to file $enduser_tokenfile"
    exit 1
}   

$generated = 0
Import-Csv -Path $enduser_datafile | ForEach-Object {
    if ($limit -gt 0 -and $generated -ge $limit) {
        break
    }
    $partyId = $_.partyId
    $userId = $_.userId
    $ssn = $_.ssn

    $url = "https://altinn-testtools-token-generator.azurewebsites.net/api/GetPersonalToken?env=$env&userId=$userId&partyId=$partyId&pid=$ssn&ttl=3600"
    $token = Invoke-RestMethod -Uri $url -Method Get -Credential (New-Object -TypeName System.Management.Automation.PSCredential -ArgumentList $tokengenuser, (ConvertTo-SecureString -String $tokengenpasswd -AsPlainText -Force))
    #$token = Invoke-RestMethod -Uri $url -Headers @{Authorization=("Basic " + [Convert]::ToBase64String([Text.Encoding]::ASCII.GetBytes("${tokengenuser}:${tokengenpasswd}")))} -Method Get
    if (-not $?) {
        Write-Host "Error: Failed to generate personal token for: $ssn, $scopes"
        continue
    }
    "$userId,$partyId,$ssn,$token" | Out-File -FilePath $enduser_tokenfile -Append -Encoding utf8
    $status = $?
    if ($status -ne 1) {
        Write-Host "Error: Failed to write personal token to file for: $ssn $status"
    } else {
        $generated++
    }
}
