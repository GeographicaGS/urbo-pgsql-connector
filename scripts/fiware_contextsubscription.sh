
curl --insecure -i https://195.235.93.224:10027/NGSI10/subscribeContext -s -S --header 'Content-Type: application/json' --header 'Accept: application/json' --header 'Fiware-Service: sc_smart_region_andalucia' --header 'Fiware-ServicePath: /and_sr_cdm' --header 'x-auth-token: MIIC8wYJKoZIhvcNAQcCoIIC5DCCAuACAQExCTAHBgUrDgMCGjCCAUkGCSqGSIb3DQEHAaCCAToEggE2eyJ0b2tlbiI6IHsiaXNzdWVkX2F0IjogIjIwMTYtMDMtMDNUMTA6MTk6MjQuNDU2MjEwWiIsICJleHRyYXMiOiB7fSwgIm1ldGhvZHMiOiBbInBhc3N3b3JkIl0sICJleHBpcmVzX2F0IjogIjIwMTYtMDMtMDNUMTE6MTk6MjQuNDU2MTU1WiIsICJ1c2VyIjogeyJkb21haW4iOiB7ImlkIjogIjBjZjJmMDYxMTg4YzRjODliNjgyMGViMmVmODAwY2JhIiwgIm5hbWUiOiAic2Nfc21hcnRfcmVnaW9uX2FuZGFsdWNpYSJ9LCAiaWQiOiAiZjE0MWRhYWUzMzRiNDI3NGFjMmI1NTc4MjNjNTBjNDgiLCAibmFtZSI6ICJhbmRfc3JfY2RtX2FkbWluIn19fTGCAYEwggF9AgEBMFwwVzELMAkGA1UEBhMCVVMxDjAMBgNVBAgMBVVuc2V0MQ4wDAYDVQQHDAVVbnNldDEOMAwGA1UECgwFVW5zZXQxGDAWBgNVBAMMD3d3dy5leGFtcGxlLmNvbQIBATAHBgUrDgMCGjANBgkqhkiG9w0BAQEFAASCAQAbKmoBKinU-BLljNVl3pvXkmKBS5aSmmMnY19ejgM5SyyhU15bk3Ra9ppmzWPq87EUzHVpl3FHN50t8t68YQiCYmEqiL2exFY9TFoZkZZnpPmUYUAnfXwjuJNApTI1ulqOOYJQ9NgmcF9aLUXfh+RJmbivYNigUi+CMQD0ck7m3PTy5DApOzwM94uQ3LTESQue3ca1RnwCOYCXlKHyqtGSCiKYFOZaeo4zRZxwPWv1oNAFsO42DZ9K-gXbAvGm4rXSmRdpEm+dkQUZFO1K8zdre6wRxGc-nfKf0pWciIjcknTfZ+pkWKVYBAiBkOYRJP096tYsPxyopTG291kY6aHK' -d '
{
    "entities": [
        {
          "type": "geoEntTest",
          "isPattern": "true",
          "id": ".*"
        }
    ],
    "attributes": [
            "position","timeinstant","valor_01", "valor_02"
    ],
    "reference": "http://api-fiware-dashboard.geographica.gs:3000/tsubscription",
    "duration": "P1M",
    "notifyConditions": [
        {
            "type": "ONCHANGE",
            "condValues": [
                "position","timeinstant","valor_01", "valor_02"
            ]
        }
    ],
    "throttling": "PT0S"
}'
