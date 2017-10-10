#
#  Copyright 2017 Telefónica Digital España S.L.
#  
#  This file is part of URBO PGSQL connector.
#  
#  URBO PGSQL connector is free software: you can redistribute it and/or
#  modify it under the terms of the GNU Affero General Public License as
#  published by the Free Software Foundation, either version 3 of the
#  License, or (at your option) any later version.
#  
#  URBO PGSQL connector is distributed in the hope that it will be useful,
#  but WITHOUT ANY WARRANTY; without even the implied warranty of
#  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU Affero
#  General Public License for more details.
#  
#  You should have received a copy of the GNU Affero General Public License
#  along with URBO PGSQL connector. If not, see http://www.gnu.org/licenses/.
#  
#  For those usages not covered by this license please contact with
#  iot_support at tid dot es
#
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
