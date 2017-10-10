# -*- coding: utf-8 -*-
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

import requests
import yaml
import json

try:
    from yaml import CLoader as Loader
except ImportError:
    from yaml import Loader

try:
    """
    Remove InsecureRequestWarning for unverified HTTPS requests.
    For Requests library version < 2.4 an error raise in this import.
    """
    from requests.packages.urllib3.exceptions import InsecureRequestWarning
    requests.packages.urllib3.disable_warnings(InsecureRequestWarning)
except ImportError as err:
    # raise ImportError("{}\nYou need to upgrade Requests Library".format(err))
    pass


class GetAuthTokenException(Exception):
    pass

class DeleteSubscriptionException(Exception):
    pass

def getAuthToken(url_authtk, fl_fw_auth, timeout=10, ssl=False):
    try:
        headers_authtk = {'Content-Type': 'application/json'}

        with open(fl_fw_auth) as fw_json_auth:
            json_data = json.load(fw_json_auth)

        payload = json.dumps(json_data)

        resp = requests.post(url_authtk, headers=headers_authtk,
                              data=payload, verify=ssl, timeout=timeout)

        if resp.ok:
            auth_token = resp.headers.get('x-subject-token')
            resp_json = resp.json().get('token')
            exp_date = resp_json.get('expires_at')
            return(auth_token, exp_date)
        else:
            raise GetAuthTokenException("Error: {}".format(resp.json()))

    except Exception as err:
        print("Error: {}".format(err))

def deleteSubscriptions(subs, url_subs, fiw_serv, fiw_subsserv, authtoken, timeout=10, ssl=False):
    try:
        headers_authtk = {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Fiware-Service': fiw_serv,
            'Fiware-ServicePath': fiw_subsserv,
            'x-auth-token': authtoken
        }

        for subs_id in subs:
            json_data = {
                "subscriptionId": subs_id
            }


            payload = json.dumps(json_data)

            resp = requests.post(url_subs, headers=headers_authtk,
                                  data=payload, verify=ssl, timeout=timeout)

            if resp.ok:
                #print resp.json()
                print("{0}. Deleted subscription: {1}".format(resp, subs_id))
            else:
                print(resp)
                raise DeleteSubscriptionException("Error: {}".format(resp.json()))


    except Exception as err:
        print("Error: {}".format(err))


def main():
    fl_fw_auth = "fiware_auth.json"
    url_authtk = 'https://195.235.93.224:15001/v3/auth/tokens'
    auth_token, exp_date = getAuthToken(url_authtk, fl_fw_auth)
    print(auth_token)

    url_subs = 'https://195.235.93.224:10027/v1/unsubscribeContext'
    fiw_serv = 'sc_smart_region_andalucia'
    fiw_subsserv = '/and_sr_torrox'
    subs = ['580f43b9fdc8301538a65ab4']

    deleteSubscriptions(subs, url_subs, fiw_serv, fiw_subsserv, auth_token)

if __name__ == '__main__':
    main()
