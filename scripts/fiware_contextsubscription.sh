


AUTHTOKEN=XXXXXXXXXXXXXXXXXXX
SUBSERVICENAME=XXXXXXXXXXXX
SERVICENAME=XXXXXXXXXXXX

curl --insecure -i https://195.235.93.224:10027/NGSI10/subscribeContext -s -S --header 'Content-Type: application/json' --header 'Accept: application/json' --header 'Fiware-Service: $SERVICENAME' --header 'Fiware-ServicePath: /$SUBSERVICENAME' --header 'x-auth-token: $AUTHTOKEN' -d '
{
    "entities": [
        {
          "type": "test",
          "isPattern": "true",
          "id": "10*"
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
