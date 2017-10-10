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
