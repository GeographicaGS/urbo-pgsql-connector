curl --insecure -i https://195.235.93.224:10027/NGSI10/updateContext -s -S --header 'Content-Type: application/json' --header 'Accept: application/json' --header 'Fiware-Service: sc_smart_region_andalucia' --header 'Fiware-ServicePath: /and_sr_cdm' --header 'x-auth-token: MIIEJwYJKoZIhvcNAQcCoIIEGDCCBBQCAQExCTAHBgUrDgMCGjCCAn0GCSqGSIb3DQEHAaCCAm4EggJqeyJ0b2tlbiI6IHsibWV0aG9kcyI6IFsidG9rZW4iLCAicGFzc3dvcmQiXSwgInJvbGVzIjogW3siaWQiOiAiMTBhMTMxOTQxMTI2NGJkZDk4MGY5NzZiNWRlN2IzYTQiLCAibmFtZSI6ICIwY2YyZjA2MTE4OGM0Yzg5YjY4MjBlYjJlZjgwMGNiYSNTdWJTZXJ2aWNlQWRtaW4ifV0sICJleHBpcmVzX2F0IjogIjIwMTYtMDItMjRUMTc6Mjk6MTkuNTI0MDk5WiIsICJwcm9qZWN0IjogeyJkb21haW4iOiB7ImlkIjogIjBjZjJmMDYxMTg4YzRjODliNjgyMGViMmVmODAwY2JhIiwgIm5hbWUiOiAic2Nfc21hcnRfcmVnaW9uX2FuZGFsdWNpYSJ9LCAiaWQiOiAiODA1NjczMjYzM2IyNDMwNjk3ZWVlM2UxYmZiOWNmYzkiLCAibmFtZSI6ICIvYW5kX3NyX2NkbSJ9LCAiY2F0YWxvZyI6IFtdLCAiZXh0cmFzIjoge30sICJ1c2VyIjogeyJkb21haW4iOiB7ImlkIjogIjBjZjJmMDYxMTg4YzRjODliNjgyMGViMmVmODAwY2JhIiwgIm5hbWUiOiAic2Nfc21hcnRfcmVnaW9uX2FuZGFsdWNpYSJ9LCAiaWQiOiAiZjE0MWRhYWUzMzRiNDI3NGFjMmI1NTc4MjNjNTBjNDgiLCAibmFtZSI6ICJhbmRfc3JfY2RtX2FkbWluIn0sICJpc3N1ZWRfYXQiOiAiMjAxNi0wMi0yNFQxNzoxMjo1Ni40NTE3MThaIn19MYIBgTCCAX0CAQEwXDBXMQswCQYDVQQGEwJVUzEOMAwGA1UECAwFVW5zZXQxDjAMBgNVBAcMBVVuc2V0MQ4wDAYDVQQKDAVVbnNldDEYMBYGA1UEAwwPd3d3LmV4YW1wbGUuY29tAgEBMAcGBSsOAwIaMA0GCSqGSIb3DQEBAQUABIIBALMHh7V4KXTHeDmVIS03RB3sN-1UPTKDV+IdmzdW7pljqxWlQdxjAjl0VLoLKT8QJxIlmkmNfv-0jvorgv9SvOZDSuVhag1kn8MFpFtwuD7-3ezyaiNCLQ+xIc6B72qi5ZJWbI0hAaLAN3zIxX9-hKomBnjg5Jx48T6MWBJoP4SG0GHwHHEcdiXiIZLHjGPETzHy1xqw2SyqStuNguThihSIbJY50fYz7+7KdVSUWZUhoBvE+x-43yV7Ytyogo9YiHHWb0p+b8jTmBD+e-fbhEOuZa4RwKCZB32HMinQbs2S2Rqema8yUETaWw7P85jakc2O8ygWSzStfz5LQ1kAUHQ=' -d '
{
    "contextElements": [
        {
            "type": "geoEntTest",
            "isPattern": "false",
            "id": "10027",
            "attributes": [
              {
                  "name": "position",
                  "type": "coords",
                  "value": "39.5,-8.2"
              },
              {
                  "name": "timeinstant",
                  "type": "ISO8601",
                  "value": "2016-02-24T16:45:01.117150"
              }
            ]
        }
    ],
    "updateAction": "UPDATE"
}'
