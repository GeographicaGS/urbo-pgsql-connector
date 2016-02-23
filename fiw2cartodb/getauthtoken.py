# -*- coding: utf-8 -*-
#
#  Author: Cayetano Benavent, 2016.
#  cayetano.benavent@geographica.gs
#
#  This program is free software; you can redistribute it and/or modify
#  it under the terms of the GNU General Public License as published by
#  the Free Software Foundation; either version 2 of the License, or
#  (at your option) any later version.
#
#  This program is distributed in the hope that it will be useful,
#  but WITHOUT ANY WARRANTY; without even the implied warranty of
#  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
#  GNU General Public License for more details.
#
#  You should have received a copy of the GNU General Public License
#  along with this program; if not, write to the Free Software
#  Foundation, Inc., 51 Franklin Street, Fifth Floor, Boston,
#  MA 02110-1301, USA.
#

import requests
import json


def getAuthToken(url_authtk, fl_fw_auth, ssl=False):
    try:
        headers_authtk = {
            'Content-Type': 'application/json',
        }

        with open(fl_fw_auth) as fw_json_auth:
            json_data = json.load(fw_json_auth)

        payload = json.dumps(json_data)

        resp = requests.post(url_authtk, headers=headers_authtk, data=payload, verify=ssl)

        if resp.ok:
            return(resp.headers.get('x-subject-token'))
        else:
            print(resp.json())

    except Exception as err:
        print("Error: {}".format(err))


def getData(url_qry, auth_token, serv_name, subserv_name, json_data, ssl=False):

    headers_qry = {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Fiware-Service': serv_name,
        'Fiware-ServicePath': '/' + subserv_name,
        'x-auth-token': auth_token
    }

    payload = json.dumps(json_data)

    resp = requests.post(url_qry, headers=headers_qry, data=payload, verify=ssl)

    if resp.ok:
        return(resp.json())
    else:
        print(resp.json())

if __name__ == '__main__':

    fl_fw_auth = "fiware_auth.json"
    url_authtk = 'https://195.235.93.224:15001/v3/auth/tokens'
    auth_token = getAuthToken(url_authtk, fl_fw_auth)
    print(auth_token)

    url_qry = 'https://195.235.93.224:10027/NGSI10/queryContext'
    serv_name = 'sc_smart_region_andalucia'
    subserv_name = 'and_sr_cdm'
    json_data = {
                 "entities": [
                    {
                      "type": "geoEntTest",
                      "isPattern": "true",
                      "id": "10*"
                    }
                  ]
                }
    qry = getData(url_qry, auth_token, serv_name, subserv_name, json_data, ssl=False)
    print(qry)

    
