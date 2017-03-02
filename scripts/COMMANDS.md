# Commands

## Prepare environment

1. Set environment variables
```
source env.config
```

2. Get Auth token
```
./fiware_get_auth_token.sh | grep 'X-Subject-Token'
```

3. Exporth auth_token from previous step
```
export AUTHTOKEN=XXXX
```

## Execute queries
Request
```
curl -v --insecure -i https://195.235.93.224:10027/v1/queryContext -s -S --header "Content-Type: application/json" --header "Accept: application/json" --header "Fiware-Service: $SERVICENAME" --header "Fiware-ServicePath: /$SUBSERVICENAME" --header "x-auth-token: $AUTHTOKEN" -d '
  {"entities": [
    {
      "type": "test",
      "isPattern": "true",
      "id": "10*"
    }
  ]
}'
```

Subscription
```
curl --insecure -i https://195.235.93.224:10027/v1/subscribeContext -s -S --header 'Content-Type: application/json' --header 'Accept: application/json' --header 'Fiware-Service: $SERVICENAME' --header 'Fiware-ServicePath: /$SUBSERVICENAME' --header 'x-auth-token: $AUTHTOKEN' -d '
{
    "entities": [
        {
          "type": "test",
          "isPattern": "true",
          "id": "100*"
        }
    ],
    "attributes": [
            "nombre_02", "nombre_01"
    ],
    "reference": "http://api-fiware-dashboard.geographica.gs:3000/tsubscription",
    "duration": "P1M",
    "notifyConditions": [
        {
            "type": "ONCHANGE",
            "condValues": [
                "nombre_02", "nombre_01"
            ]
        }
    ],
    "throttling": "PT5S"
}'
```
