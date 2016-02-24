curl --insecure -i https://195.235.93.224:10027/NGSI10/updateContext -s -S --header 'Content-Type: application/json' --header 'Accept: application/json' --header 'Fiware-Service: sc_smart_region_andalucia' --header 'Fiware-ServicePath: /and_sr_cdm' --header 'x-auth-token: MIIC8wYJKoZIhvcNAQcCoIIC5DCCAuACAQExCTAHBgUrDgMCGjCCAUkGCSqGSIb3DQEHAaCCAToEggE2eyJ0b2tlbiI6IHsiaXNzdWVkX2F0IjogIjIwMTYtMDItMjRUMTQ6MDM6NTQuODEzNTE4WiIsICJleHRyYXMiOiB7fSwgIm1ldGhvZHMiOiBbInBhc3N3b3JkIl0sICJleHBpcmVzX2F0IjogIjIwMTYtMDItMjRUMTU6MDM6NTQuODEzNDA3WiIsICJ1c2VyIjogeyJkb21haW4iOiB7ImlkIjogIjBjZjJmMDYxMTg4YzRjODliNjgyMGViMmVmODAwY2JhIiwgIm5hbWUiOiAic2Nfc21hcnRfcmVnaW9uX2FuZGFsdWNpYSJ9LCAiaWQiOiAiZjE0MWRhYWUzMzRiNDI3NGFjMmI1NTc4MjNjNTBjNDgiLCAibmFtZSI6ICJhbmRfc3JfY2RtX2FkbWluIn19fTGCAYEwggF9AgEBMFwwVzELMAkGA1UEBhMCVVMxDjAMBgNVBAgMBVVuc2V0MQ4wDAYDVQQHDAVVbnNldDEOMAwGA1UECgwFVW5zZXQxGDAWBgNVBAMMD3d3dy5leGFtcGxlLmNvbQIBATAHBgUrDgMCGjANBgkqhkiG9w0BAQEFAASCAQAqh-y7rhFF8fVzzybJhK-r3b10mRnSufdlC3OAdfDODBCZ7DoQjBNYaSQ+yuMm1e2eOpq7Mv+xLKkCsH-eZaeEthUfz61oH-CW+6QhtmByetjGz6LlptcfhkBRJzt+8YfUjDy+VqsjKqDTwvw0q4-1+qg3yRWcBl5ujS7Xlt93r56J11WU3XNQEiFn+ZR7lES9-VtZfnvO5ekX6IJUD0uytaCBbCVdatmFBvP3Yp5SPzpai+Il+0SniQlVh726FnLtbb1JvXJvEA-p+o57Ggxo8iI7HsOVAvRJVh6gCYGx8ICcPaWLs+uMbMEm7ZQMr-x2dvCpXoAIatbLHvwFnG-D' -d '
{
    "contextElements": [
        {
            "type": "geoEntTest",
            "isPattern": "false",
            "id": "10026",
            "attributes": [
            {
                "name": "position",
                "type": "coords",
                "value": "40.2,7.1"
            }
            ]
        }
    ],
    "updateAction": "APPEND"
}'
