

AUTHTOKEN=XXXXXXXXXXXXXXXXXXX
SUBSERVICENAME=XXXXXXXXXXXX
SERVICENAME=XXXXXXXXXXXX

curl --insecure -i https://195.235.93.224:10027/NGSI10/updateContext -s -S --header 'Content-Type: application/json' --header 'Accept: application/json' --header 'Fiware-Service: $SUBSERVICENAME' --header 'Fiware-ServicePath: /$SERVICENAME' --header 'x-auth-token: $AUTHTOKEN' -d '
{
    "contextElements": [
        {
            "type": "test",
            "isPattern": "false",
            "id": "1004",
            "attributes": [
            {
                "name": "nombre_02",
                "type": "test",
                "value": "valor_33333343332"
            }
            ]
        }
    ],
    "updateAction": "UPDATE"
}'
