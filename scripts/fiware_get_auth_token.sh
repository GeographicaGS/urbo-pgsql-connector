#!/bin/bash

curl --insecure "https://195.235.93.224:15001/v3/auth/tokens" -s -i -H "Content-Type: application/json" --data @auth_fiware.json
