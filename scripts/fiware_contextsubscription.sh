
curl --insecure -i https://195.235.93.224:10027/NGSI10/subscribeContext -s -S --header 'Content-Type: application/json' --header 'Accept: application/json' --header 'Fiware-Service: sc_smart_region_andalucia' --header 'Fiware-ServicePath: /and_sr_cdm' --header 'x-auth-token: MIIC8wYJKoZIhvcNAQcCoIIC5DCCAuACAQExCTAHBgUrDgMCGjCCAUkGCSqGSIb3DQEHAaCCAToEggE2eyJ0b2tlbiI6IHsiaXNzdWVkX2F0IjogIjIwMTYtMDItMjRUMTI6NTg6NDguMjI3NTY1WiIsICJleHRyYXMiOiB7fSwgIm1ldGhvZHMiOiBbInBhc3N3b3JkIl0sICJleHBpcmVzX2F0IjogIjIwMTYtMDItMjRUMTM6NTg6NDguMjI3NTMzWiIsICJ1c2VyIjogeyJkb21haW4iOiB7ImlkIjogIjBjZjJmMDYxMTg4YzRjODliNjgyMGViMmVmODAwY2JhIiwgIm5hbWUiOiAic2Nfc21hcnRfcmVnaW9uX2FuZGFsdWNpYSJ9LCAiaWQiOiAiZjE0MWRhYWUzMzRiNDI3NGFjMmI1NTc4MjNjNTBjNDgiLCAibmFtZSI6ICJhbmRfc3JfY2RtX2FkbWluIn19fTGCAYEwggF9AgEBMFwwVzELMAkGA1UEBhMCVVMxDjAMBgNVBAgMBVVuc2V0MQ4wDAYDVQQHDAVVbnNldDEOMAwGA1UECgwFVW5zZXQxGDAWBgNVBAMMD3d3dy5leGFtcGxlLmNvbQIBATAHBgUrDgMCGjANBgkqhkiG9w0BAQEFAASCAQCLOJ0io05AEILda4-95seo8YWkx9ZA2n120G0cYREkVEvZEnwRZjD7rXy9W+jKEZQU4EvUUtHmAHfV08ZyHHPj7JIsQ76i5PImYSbxpte6yE9M9foqtOoyWk-Gv-6SmQP-K8FeMqVE7BX5JjaGDLhH5m6ffphatU+TojTh1wkG8ahEliZd3upZxaTz05v2edn9FGBd2j6ICtVYmG1-lBe0QV9cBgZwIlVAW0HOKNYY+6XZca2QJTAkIy4fzruM+QGs50wql-oBbpj9KXzXsBF79w1mbGAThZ6AznI9Cb6S0XmbA5xU3I0ZmFutLiJEKSottcT1KFYl+XErms758Whu' -d '
{
    "entities": [
        {
          "type": "geoEntTest",
          "isPattern": "true",
          "id": "10*"
        }
    ],
    "attributes": [
            "position","nombre_02", "nombre_01"
    ],
    "reference": "http://api-fiware-dashboard.geographica.gs:3000",
    "duration": "P1M",
    "notifyConditions": [
        {
            "type": "ONCHANGE",
            "condValues": [
                "position","nombre_02", "nombre_01"
            ]
        }
    ],
    "throttling": "PT5S"
}'
