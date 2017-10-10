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

def deleteSubscriptions(subs, url_subs, fiw_serv, fiw_subsserv, authtoken,
                        pgconfig, timeout=10, ssl=False):
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
                raise DeleteSubscriptionException("Error: {}".format(resp.json()))

        subtables = [tb for tk,tb in subs]
        deletePgSubscr(subtables, **pgconfig)

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
        print("Error selecting subscriptions: {}".format(err))

def deletePgSubscr(subtables, subs_table='subscriptions', **kwargs):
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
        print(subtables)
        for tb in subtables:
            # cur.execute("DROP TABLE {0};".format(tb))
            cur.execute("DELETE FROM {0} WHERE id_name='{1}';".format(subs_table, tb))


        conn.commit()
        cur.close()
        conn.close()

    except Exception as err:
        print("Error removing tables: {}".format(err))

def getConfig(pgconfig_file, pghost="localhost", pgport="5432",
                pguser="postgres", pgpwd="postgres"):

    with open(pgconfig_file, 'r') as stream:
        cfg = yaml.load(stream, Loader=Loader)
        pgconfig = cfg.get('pgsql')
        if pgport and pghost and pguser and pgpwd:
            pgconfig['port'] = pgport
            pgconfig['host'] = pghost
            pgconfig['user'] = pguser
            pgconfig['password'] = pgpwd

        return pgconfig

def main():
    fl_fw_auth = "fiware_auth.json"
    url_authtk = 'https://195.235.93.224:15001/v3/auth/tokens'
    auth_token, exp_date = getAuthToken(url_authtk, fl_fw_auth)
    print(auth_token)

    pgconfig_file = "../api/config.yml"
    pgconfig = getConfig(pgconfig_file)
    subs = getPgSubscr(**pgconfig)
    print(subs)
    print(pgconfig)

    url_subs = 'https://195.235.93.224:10027/v1/unsubscribeContext'
    fiw_serv = 'sc_smart_region_andalucia'
    fiw_subsserv = '/and_sr_osuna'
    deleteSubscriptions(subs, url_subs, fiw_serv, fiw_subsserv, auth_token, pgconfig)

if __name__ == '__main__':
    main()
