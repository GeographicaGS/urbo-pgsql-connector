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
curl --insecure -i https://195.235.93.224:10027/NGSI10/updateContextSubscription -s -S --header 'Content-Type: application/json' --header 'Accept: application/json' --header 'Fiware-Service: sc_smart_region_andalucia' --header 'Fiware-ServicePath: /and_sr_cdm' --header 'x-auth-token: MIIC8wYJKoZIhvcNAQcCoIIC5DCCAuACAQExCTAHBgUrDgMCGjCCAUkGCSqGSIb3DQEHAaCCAToEggE2eyJ0b2tlbiI6IHsiaXNzdWVkX2F0IjogIjIwMTYtMDMtMDJUMTA6MzQ6NTUuNTUyNzMwWiIsICJleHRyYXMiOiB7fSwgIm1ldGhvZHMiOiBbInBhc3N3b3JkIl0sICJleHBpcmVzX2F0IjogIjIwMTYtMDMtMDJUMTE6MzQ6NTUuNTUyNjgxWiIsICJ1c2VyIjogeyJkb21haW4iOiB7ImlkIjogIjBjZjJmMDYxMTg4YzRjODliNjgyMGViMmVmODAwY2JhIiwgIm5hbWUiOiAic2Nfc21hcnRfcmVnaW9uX2FuZGFsdWNpYSJ9LCAiaWQiOiAiZjE0MWRhYWUzMzRiNDI3NGFjMmI1NTc4MjNjNTBjNDgiLCAibmFtZSI6ICJhbmRfc3JfY2RtX2FkbWluIn19fTGCAYEwggF9AgEBMFwwVzELMAkGA1UEBhMCVVMxDjAMBgNVBAgMBVVuc2V0MQ4wDAYDVQQHDAVVbnNldDEOMAwGA1UECgwFVW5zZXQxGDAWBgNVBAMMD3d3dy5leGFtcGxlLmNvbQIBATAHBgUrDgMCGjANBgkqhkiG9w0BAQEFAASCAQAy1cPYPVS0e9hPfk7AIDjlY7tURaeghCisHKawcATXEu8zXIpsEYkx9QG3GfLQLZcby7FDpPn4gvtt+Sj97z75I9dsWEmZcSWWF0XfeIjxKMIFaRVjkO7nm3ce1P6s3OC5oN3JAQfUeUriqnuJ7eaAJ+u-XKxhfpe5jMN+zpsjuvQ-RbRkdW48MJkaUuEgUTduM-VsotQL5W4HoJSv2oe99CCSVqgAJZuwVYkCxppDRru7Hlsj-WLvp+ZMSHv5-1T3BSS52CAgJVYHWmPGCkplj1sYEqHH0Yz3K+f47ACYFxzgfpnYEJkTp062R7FVm5ezPxD7T1bd0JByCblDZHMl' -d '{
    "subscriptionId": "56d6ce173e6ed711727d7d64",
    "duration": "P2M"
}'
