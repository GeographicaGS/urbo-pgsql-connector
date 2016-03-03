
import requests


s = '56d5c9143e6ed711727d7d5a,56d5c9c0e06ac88adfde82c0,56d5ca313e6ed711727d7d5b,56d5ca35e06ac88adfde82c1,56d5ca3f3e6ed711727d7d5c,56d5cabee06ac88adfde82c2,56d5cacc3e6ed711727d7d5d,56d5caebe06ac88adfde82c3,56d5caf23e6ed711727d7d5e,56d5cb38e06ac88adfde82c4,56d5cb723e6ed711727d7d5f,56d5cbd7e06ac88adfde82c5,56d5cc323e6ed711727d7d61,56d5cc7ce06ac88adfde82c7,56d5cd4b3e6ed711727d7d62,56d5cdc5e06ac88adfde82c8,56d5cdece06ac88adfde82c9,56d5ce34e06ac88adfde82ca,56d6c1fd3e6ed711727d7d63,56d6c283e06ac88adfde82cc,56d6cdd1e06ac88adfde82cd,56d6d946e06ac88adfde82ce,56d6d9523e6ed711727d7d65,56d6d95ae06ac88adfde82cf,56d6d9bf3e6ed711727d7d66,56d6d9c3e06ac88adfde82d0,56d6da2b3e6ed711727d7d67,56d6da37e06ac88adfde82d1,56d6e079e06ac88adfde82d2,56d6fa3b3e6ed711727d7d69,56d6fd28e06ac88adfde82d5,56d6fdb73e6ed711727d7d6a,56d6fe49e06ac88adfde82d6,56d6fe723e6ed711727d7d6b,56d6ff30e06ac88adfde82d7,56d6ff3d3e6ed711727d7d6c,56d6ff4ae06ac88adfde82d8,56d6ff4e3e6ed711727d7d6d,56d6ff50e06ac88adfde82d9,56d6ff543e6ed711727d7d6e,56d6ff93e06ac88adfde82da,56d6ffbd3e6ed711727d7d6f,56d6ffdde06ac88adfde82db,56d6ffe43e6ed711727d7d70,56d6fff9e06ac88adfde82dc,56d700173e6ed711727d7d71,56d7001ae06ac88adfde82dd,56d7001d3e6ed711727d7d72,56d70035e06ac88adfde82de,56d700413e6ed711727d7d73,56d70053e06ac88adfde82df,56d700563e6ed711727d7d74,56d70067e06ac88adfde82e0,56d700713e6ed711727d7d75,56d70074e06ac88adfde82e1,56d700853e6ed711727d7d76,56d7009ee06ac88adfde82e2,56d700a03e6ed711727d7d77,56d700a8e06ac88adfde82e3,56d700aa3e6ed711727d7d78,56d700bde06ac88adfde82e4,56d700c83e6ed711727d7d79,56d700cbe06ac88adfde82e5,56d700ce3e6ed711727d7d7a,56d700d0e06ac88adfde82e6,56d700da3e6ed711727d7d7b,56d700ea3e6ed711727d7d7c,56d700f4e06ac88adfde82e7,56d701113e6ed711727d7d7d,56d70120e06ac88adfde82e8,56d7012e3e6ed711727d7d7e,56d7013fe06ac88adfde82e9,56d7014d3e6ed711727d7d7f,56d705953e6ed711727d7d80,56d706a43e6ed711727d7d81,56d707473e6ed711727d7d82,56d70f0e3e6ed711727d7d83,56d70fea3e6ed711727d7d84,56d712943e6ed711727d7d85,56d715613e6ed711727d7d86,56d715fae06ac88adfde82ea,56d716c93e6ed711727d7d87,56d7173be06ac88adfde82eb,56d717663e6ed711727d7d88,56d718abe06ac88adfde82ec,56d720fe3e6ed711727d7d89,56d736fae06ac88adfde82ed,56d738073e6ed711727d7d8a,56d73816e06ac88adfde82ee,56d747d1e06ac88adfde82ef,56d749633e6ed711727d7d8b,56d74971e06ac88adfde82f0,56d7499b3e6ed711727d7d8c,56d74a01e06ac88adfde82f1,56d74a0b3e6ed711727d7d8d,56d74a2de06ac88adfde82f2,56d74a4d3e6ed711727d7d8e,56d74a5ae06ac88adfde82f3,56d74b1d3e6ed711727d7d8f,56d74b86e06ac88adfde82f4'
s.split(',')


def getAuthToken(timeout=10, ssl=False):
        try:
            headers_authtk = {
                'Content-Type': 'application/json',
            }

            with open('fiware_auth.') as fw_json_auth:
                json_data = json.load(fw_json_auth)

            payload = json.dumps(json_data)

            resp = requests.post(self.__url_authtk, headers=headers_authtk, data=payload, verify=ssl, timeout=timeout)

            if resp.ok:
                auth_token = resp.headers.get('x-subject-token')
                resp_json = resp.json().get('token')
                exp_date = resp_json.get('expires_at')
                return(auth_token, exp_date)
            else:
                raise GetAuthTokenException("Error: {}".format(resp.json()))

        except Exception as err:
            print("Error: {}".format(err))
