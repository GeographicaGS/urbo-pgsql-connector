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
./scripts/simulateorionresponse.sh
./scripts/fiware_append_cdb.sh
./scripts/fiware_contextsubscription.sh
./scripts/unsubscribe.sh
./scripts/fiware_update_cdb.sh
./scripts/fiware_update.sh
./scripts/fiware_get_auth_token.sh
./scripts/fiware_contextsubscription_cdb.sh
