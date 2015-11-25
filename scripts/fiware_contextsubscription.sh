


AUTHTOKEN=XXXXXXXXXXXXXXXXXXX
SUBSERVICENAME=XXXXXXXXXXXX
SERVICENAME=XXXXXXXXXXXX

curl --insecure -i https://195.235.93.224:10027/NGSI10/subscribeContext -s -S --header 'Content-Type: application/json' --header 'Accept: application/json' --header 'Fiware-Service: $SERVICENAME' --header 'Fiware-ServicePath: /$SUBSERVICENAME' --header 'x-auth-token: $AUTHTOKEN' -d '
{
    "entities": [
        {
          "type": "test",
          "isPattern": "false",
          "id": "1004"
        }
    ],
    "attributes": [
            "valor"
    ],
    "reference": "http://api-fiware-dashboard.geographica.gs:3000/tsubscription",
    "duration": "P1M",
    "notifyConditions": [
        {
            "type": "ONCHANGE",
            "condValues": [
                "valor"
            ]
        }
    ],
    "throttling": "PT5S"
}'
