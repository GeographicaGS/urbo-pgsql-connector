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

import psycopg2
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
                "subscriptionId": subs_id[0]
            }
            print(subs_id[0])
            payload = json.dumps(json_data)

            resp = requests.post(url_subs, headers=headers_authtk,
                                  data=payload, verify=ssl, timeout=timeout)

            if resp.ok:
                print("{0}. Deleted subscription: {1}".format(resp, subs_id[0]))
            else:
                print(resp)
        else:
            raise DeleteSubscriptionException("Error: {}".format(resp.json()))

    except Exception as err:
        print("Error: {}".format(err))

def getPgSubscr(subs_table='subscriptions', **kwargs):
    try:
        my_database = kwargs.get('database')
        my_user = kwargs.get('user')
        my_password = kwargs.get('password')
        my_host = kwargs.get('host')
        my_port = kwargs.get('port')

        conn = None
        conn = psycopg2.connect(database=my_database, user=my_user,
                password=my_password, host=my_host, port=my_port)
        cur = conn.cursor()
        cur.execute("SELECT * FROM {0};".format(subs_table))
        dt = cur.fetchall()
        cur.close()
        conn.close()
        return dt

    except Exception as err:
        print("Error: {}".format(err))

def getSubscr(pgconfig_file, pghost="localhost", pgport="5435",
                pguser="postgres", pgpwd="postgres"):

    with open(pgconfig_file, 'r') as stream:
        cfg = yaml.load(stream, Loader=Loader)
        pgconfig = cfg.get('pgsql')
        if pgport and pghost and pguser and pgpwd:
            pgconfig['port'] = pgport
            pgconfig['host'] = pghost
            pgconfig['user'] = pguser
            pgconfig['password'] = pgpwd

        return getPgSubscr(**pgconfig)

def main():
    fl_fw_auth = "fiware_auth_malaga.json"
    url_authtk = 'https://195.235.93.224:15001/v3/auth/tokens'
    auth_token, exp_date = getAuthToken(url_authtk, fl_fw_auth)
    print(auth_token)

    pgconfig_file = "../api/config.yml"
    subs = getSubscr(pgconfig_file)
    print(subs)

    url_subs = 'https://195.235.93.224:10027/v1/unsubscribeContext'
    fiw_serv = 'sc_smart_region_andalucia'
    fiw_subsserv = '/and_sr_osuna'
    deleteSubscriptions(subs, url_subs, fiw_serv, fiw_subsserv, auth_token)

if __name__ == '__main__':
    main()
