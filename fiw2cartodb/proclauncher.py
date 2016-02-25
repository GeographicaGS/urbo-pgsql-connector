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

import logging
from threading import Thread,Event,active_count
from multiprocessing import Process
from time import sleep,time
from orioncontextbroker import OrionContextBroker
from orioncontextbrokerconfig import ocbrconfig


class Logger(object):

    def __init__(self, level=logging.INFO):
        logfmt = "[%(asctime)s - %(levelname)s] - %(message)s"
        dtfmt = "%Y-%m-%d %I:%M:%S"
        logging.basicConfig(level=level, format=logfmt, datefmt=dtfmt)

    def get(self):
        return logging.getLogger()


class StoppableThread(Thread):
    """Thread class with a stop() method. The thread itself has to check
    regularly for the stopped() condition."""

    def __init__(self):
        super(StoppableThread, self).__init__()
        self._stop = Event()
        self.daemon = True

    def stop(self):
        self._stop.set()

    def stopped(self):
        return self._stop.isSet()


class ProcLauncher(StoppableThread):

    def __init__(self, name,intervaltime,delay=0,verbose=True):
        if not verbose:
            lg = Logger(level=logging.ERROR)
        else:
            lg = Logger()
        self.logger = lg.get()

        self.ocbr = self.__getCtxBrk()

        StoppableThread.__init__(self)
        self.name = name
        self.intervaltime = intervaltime
        self.delay = delay

    def __getCtxBrk(self):
        fl_fw_auth = ocbrconfig["fl_fw_auth"]
        url_authtk = ocbrconfig["url_authtk"]
        url_qry = ocbrconfig["url_qry"]
        url_udt = ocbrconfig["url_udt"]
        serv_name = ocbrconfig["serv_name"]
        subserv_name = ocbrconfig["subserv_name"]

        return(OrionContextBroker(fl_fw_auth, url_authtk, url_qry, url_udt, serv_name, subserv_name))

    def run(self):
        if self.delay>0:
            self.__logger.info("[%s] Execution delay of %ds" % (self.name,self.delay))
            sleep(self.delay)

        self.logger.info("[%s] Starting" % self.name)

        last_exec = None

        while not self.stopped():
            if not last_exec or (time() - last_exec) >= self.intervaltime:
                last_exec = time()
                p = Process(target=self.workerLauncher, args=(self.name,))
                p.start()
                p.join()

            sleep(1)

        self.logger.info("[%s] Exiting  " % self.name)

    def workerLauncher(self,title=''):
        self.logger.info("Work %s launched" % title)
        sleep(10)
        self.logger.info("Work %s completed" % title)
