curl -X POST http://localhost:3000/subscriptions/dev_agua --header 'Content-Type: application/json' --header 'Accept: application/json' -d '
{
    "subscriptionId": "56d9ad2ae06ac88adfde83eb",
    "originator": "localhost",
    "contextResponses": [
        {
            "contextElement": {
                "attributes": [
                    {
                        "name": "value",
                        "type": "string",
                        "value": "1.75"
                    },
                    {
                        "name": "timeinstant",
                        "type": "ISO8601",
                        "value": "2016-03-04T16:09:33.28"
                    },
                    {
                        "name": "position",
                        "type": "coords",
                        "value": "37.09,-4.45"
                    }
                ],
                "type": "water_dev",
                "isPattern": "false",
                "id": "dispositivo_k01"
            },
            "statusCode": {
                "code": "200",
                "reasonPhrase": "OK"
            }
        }
    ]
}'
