# -*- coding: utf-8 -*-
#
#  Author: Cayetano Benavent & Alberto Asuero, 2016.
#  www.geographica.gs
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

import os
import signal
from time import sleep
from threading import active_count
from datetime import datetime
from proclauncher import ProcLauncher


class UpdateTestProccess(ProcLauncher):

    def workerLauncher(self, title):
        try:
            self.logger.info("Starting update process...")

            auth_token, exp_date = self.ocbr.getAuthToken(ssl=False)
            # print(auth_token, exp_date)
            self.logger.info("Auth_token successfully updated!. Expires at: {}".format(exp_date))

            json_data_qry = {
                         "entities": [
                            {
                              "type": "geoEntTest",
                              "isPattern": "true",
                              "id": "10*"
                            }
                          ]
                        }

            qry = self.ocbr.postData(auth_token, json_data_qry, "query", ssl=False)
            # print(qry)
            self.logger.info("Test query successfully!")

            list_ents = ["10025", "10026", "10027", "10028", "10029"]
            for ent in list_ents:
                json_data_udt = {
                    "contextElements": [
                        {
                            "type": "geoEntTest",
                            "isPattern": "false",
                            "id": ent,
                            "attributes": [
                              {
                                  "name": "timeinstant",
                                  "type": "ISO8601",
                                  "value": datetime.utcnow().isoformat()
                              }
                            ]
                        }
                    ],
                    "updateAction": "UPDATE"
                }

                udt = self.ocbr.postData(auth_token, json_data_udt, "update", ssl=False)
                # print(udt)
                self.logger.info("CartoDB and Orion update successfully for Entity: {}!".format(ent))
                sleep(0.1)

        except Exception as err:
            self.logger.error("UpdateTestProccess error: {}".format(err))

def signal_handler(signal, frame):
    for l in launchers:
        l.stop()

if __name__ == '__main__':
    signal.signal(signal.SIGINT, signal_handler)
    signal.signal(signal.SIGTERM, signal_handler)

    launchers = [UpdateTestProccess("Test_Proccess", 15, delay=0)]

    for l in launchers:
        l.start()

    while active_count() > 1:
        sleep(0.1)
