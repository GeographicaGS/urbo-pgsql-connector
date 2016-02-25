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

import json
import requests

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


class AuthTokenException(Exception):
    pass

class PostDataException(Exception):
    pass

class OrionContextBroker(object):

    def __init__(self, fl_fw_auth, url_authtk, url_qry, url_udt, serv_name, subserv_name):
        self.__fl_fw_auth = fl_fw_auth
        self.__url_authtk = url_authtk
        self.__url_qry = url_qry
        self.__url_udt = url_udt
        self.__serv_name = serv_name
        self.__subserv_name = subserv_name

    def getAuthToken(self, ssl=False):
        try:
            headers_authtk = {
                'Content-Type': 'application/json',
            }

            with open(self.__fl_fw_auth) as fw_json_auth:
                json_data = json.load(fw_json_auth)

            payload = json.dumps(json_data)

            resp = requests.post(self.__url_authtk, headers=headers_authtk, data=payload, verify=ssl)

            if resp.ok:
                auth_token = resp.headers.get('x-subject-token')
                resp_json = resp.json().get('token')
                exp_date = resp_json.get('expires_at')
                return(auth_token, exp_date)
            else:
                raise AuthTokenException("Error: {}".format(resp.json()))

        except Exception as err:
            print("Error: {}".format(err))


    def postData(self, auth_token, json_data, proctype, ssl=False):

        if proctype == "query":
            url = self.__url_qry
        elif proctype == "update":
            url = self.__url_udt
        else:
            raise PostDataException("No defined post data method ('query', 'update')")

        headers = {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Fiware-Service': self.__serv_name,
            'Fiware-ServicePath': '/' + self.__subserv_name,
            'x-auth-token': auth_token
        }

        payload = json.dumps(json_data)

        resp = (requests.post(url, headers=headers, data=payload, verify=ssl))
        if resp.ok:
            return(resp.json())
        else:
            raise PostDataException("Error: {}".format(resp.json()))
