
AUTHTOKEN=XXXXXXXXXXXXXXXXXXX

curl --insecure -i https://195.235.93.224:10027/NGSI10/queryContext -s -S --header 'Content-Type: application/json' --header 'Accept: application/json' --header 'Fiware-Service: sc_smart_region_andalucia' --header 'Fiware-ServicePath: /and_sr_cdm' --header 'x-auth-token: $AUTHTOKEN' -d '
  {"entities": [
    {
      "type": "test",
      "isPattern": "true",
      "id": "100*"
    }
  ]
}'
