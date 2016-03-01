
curl --insecure -i https://195.235.93.224:10027/NGSI10/subscribeContext -s -S --header 'Content-Type: application/json' --header 'Accept: application/json' --header 'Fiware-Service: sc_smart_region_andalucia' --header 'Fiware-ServicePath: /and_sr_cdm' --header 'x-auth-token: MIIC8wYJKoZIhvcNAQcCoIIC5DCCAuACAQExCTAHBgUrDgMCGjCCAUkGCSqGSIb3DQEHAaCCAToEggE2eyJ0b2tlbiI6IHsiaXNzdWVkX2F0IjogIjIwMTYtMDItMjVUMTc6MjE6MjUuNjI2MDQ2WiIsICJleHRyYXMiOiB7fSwgIm1ldGhvZHMiOiBbInBhc3N3b3JkIl0sICJleHBpcmVzX2F0IjogIjIwMTYtMDItMjVUMTg6MjE6MjUuNjI1OTc0WiIsICJ1c2VyIjogeyJkb21haW4iOiB7ImlkIjogIjBjZjJmMDYxMTg4YzRjODliNjgyMGViMmVmODAwY2JhIiwgIm5hbWUiOiAic2Nfc21hcnRfcmVnaW9uX2FuZGFsdWNpYSJ9LCAiaWQiOiAiZjE0MWRhYWUzMzRiNDI3NGFjMmI1NTc4MjNjNTBjNDgiLCAibmFtZSI6ICJhbmRfc3JfY2RtX2FkbWluIn19fTGCAYEwggF9AgEBMFwwVzELMAkGA1UEBhMCVVMxDjAMBgNVBAgMBVVuc2V0MQ4wDAYDVQQHDAVVbnNldDEOMAwGA1UECgwFVW5zZXQxGDAWBgNVBAMMD3d3dy5leGFtcGxlLmNvbQIBATAHBgUrDgMCGjANBgkqhkiG9w0BAQEFAASCAQBZE0Ov7cedLQV3LlN4yzIGnAX2r4OFyW05JQL-OBWPtRYUq4Sv6HzCEuf0lRZ8+jEUpyFm9mi9kgTWJtw6vrQQwbsGIjhCGnhiMMsfJeOGucAwT+JQhs+RTtrt0YYW3V-2jrqWbQRQtQgrq0blU6cgTRnmJya4pOzQGnBmYfw4wC8HYX+rK3lEEEYYYR+7wqzsqSYfNCIvzjIFRhjUWpifsBZ94C-IdXQXc+z9gWDKTiZ-0cJwPqS9C-nwB4m23bchUs0G3GjPLp71y2LpSjTBqcfHPEBv3zIO13c2vUA+8o0dehOAqBhjZ7+CnEdUKd1CQI1-9DmIl0Y3z7-NpcUl' -d '
{
    "entities": [
        {
          "type": "geoEntTest",
          "isPattern": "true",
          "id": "10*"
        }
    ],
    "attributes": [
            "position","timeinstant","valor_01", "valor_02"
    ],
    "reference": "http://api-fiware-dashboard.geographica.gs:3000",
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
