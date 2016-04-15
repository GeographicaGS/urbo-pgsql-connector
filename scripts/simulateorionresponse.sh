curl -X POST http://localhost:3000/subscriptions/osuna_contadores --header 'Content-Type: application/json' --header 'Accept: application/json' -d '
{
    "subscriptionId": "5710ac18c6085dbaf482790a",
    "originator": "localhost",
    "contextResponses": [
        {
            "contextElement": {
                "attributes": [
                    {
                        "name": "position",
                        "type": "string",
                        "value": "37.2422, -5.1093"
                    },
                    {
                        "name": "TimeInstant",
                        "type": "ISO8601",
                        "value": "2016-03-04T16:09:33.28"
                    },
                    {
                        "name": "l",
                        "type": "string",
                        "value": "500"
                    }
                ],
                "type": "watering.sosteco.watermetering",
                "isPattern": "false",
                "id": "watering.sosteco.watermetering:sac"
            },
            "statusCode": {
                "code": "200",
                "reasonPhrase": "OK"
            }
        }
    ]
}'
