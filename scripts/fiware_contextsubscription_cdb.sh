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



# AUTHTOKEN=XXXXXXXXXXXXXXXXXXX
# SUBSERVICENAME=XXXXXXXXXXXX
# SERVICENAME=XXXXXXXXXXXX

curl --insecure -i https://195.235.93.224:10027/NGSI10/subscribeContext -s -S --header 'Content-Type: application/json' --header 'Accept: application/json' --header 'Fiware-Service: sc_smart_region_andalucia' --header 'Fiware-ServicePath: /and_sr_cdm' --header 'x-auth-token: $AUTHTOKEN' -d '
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
    "reference": "http://api-fiware-dashboard.geographica.gs:3000/",
    "duration": "P1M",
    "notifyConditions": [
        {
            "type": "ONCHANGE",
            "condValues": [
                "nombre_02", "nombre_01"
            ]
        }
    ],
    "throttling": "PT1S"
}'
