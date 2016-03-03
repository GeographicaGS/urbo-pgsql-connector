curl localhost:1026/v1/unsubscribeContext -s -S --header 'Content-Type: application/json' \
    --header 'Accept: application/json' -d @- | python -mjson.tool) <<EOF
{
    "subscriptionId": "56d800833e6ed711727d7e6b"
}



curl -X POST --insecure https://195.235.93.224:10027/v1/unsubscribeContext --header 'Content-Type: application/json' --header 'Accept: application/json' --header 'Fiware-Service: sc_smart_region_andalucia' --header 'Fiware-ServicePath: /and_sr_cdm' --header 'x-auth-token: MIIC8wYJKoZIhvcNAQcCoIIC5DCCAuACAQExCTAHBgUrDgMCGjCCAUkGCSqGSIb3DQEHAaCCAToEggE2eyJ0b2tlbiI6IHsiaXNzdWVkX2F0IjogIjIwMTYtMDMtMDNUMDk6MjM6MzQuODg2MTA5WiIsICJleHRyYXMiOiB7fSwgIm1ldGhvZHMiOiBbInBhc3N3b3JkIl0sICJleHBpcmVzX2F0IjogIjIwMTYtMDMtMDNUMTA6MjM6MzQuODg2MDM3WiIsICJ1c2VyIjogeyJkb21haW4iOiB7ImlkIjogIjBjZjJmMDYxMTg4YzRjODliNjgyMGViMmVmODAwY2JhIiwgIm5hbWUiOiAic2Nfc21hcnRfcmVnaW9uX2FuZGFsdWNpYSJ9LCAiaWQiOiAiZjE0MWRhYWUzMzRiNDI3NGFjMmI1NTc4MjNjNTBjNDgiLCAibmFtZSI6ICJhbmRfc3JfY2RtX2FkbWluIn19fTGCAYEwggF9AgEBMFwwVzELMAkGA1UEBhMCVVMxDjAMBgNVBAgMBVVuc2V0MQ4wDAYDVQQHDAVVbnNldDEOMAwGA1UECgwFVW5zZXQxGDAWBgNVBAMMD3d3dy5leGFtcGxlLmNvbQIBATAHBgUrDgMCGjANBgkqhkiG9w0BAQEFAASCAQC6hgmk+DaWKHfv7YfNpyLZt8aFknOkt8Tf07d3kt0l7BRQeCz2VBBTtBA-xYoGcxlkL0hfvy2irsDeTZUwxdw6Tb9Gi-NuPFYrTNnVj5unQLEQKDhopVyMm+gqQ4Jo-OnMkWCGZ3Jl2H9UCdLFXKk8UWOKXsMxPZIuyiaDPY7TzbTbHM9bOh0q5yqL2-pf50EuflI9w1ws24ACC5TV61RuZL+1qCcWRIXZKpmJxgE47ljxrEtP7eG4Z9NIFjKkiL31FNoQPq1Mkr21vJgCmzkureY0NlSvplQFyPNXqHQo6G0WpNzithJC6b5+-MgkZCfpLFA2L8pOnustsYppb+Ti' -d '{
    "subscriptionId": "56d800833e6ed711727d7e6b"
}'
