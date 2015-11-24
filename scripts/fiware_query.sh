
AUTHTOKEN=XXXXXXXXXXXXXXXXXXX
SUBSERVICENAME=XXXXXXXXXXXX
SERVICENAME=XXXXXXXXXXXX

curl --insecure -i https://195.235.93.224:10027/NGSI10/queryContext -s -S --header 'Content-Type: application/json' --header 'Accept: application/json' --header 'Fiware-Service: $SERVICENAME' --header 'Fiware-ServicePath: /$SUBSERVICENAME' --header 'x-auth-token: $AUTHTOKEN' -d '
  {"entities": [
    {
      "type": "test",
      "isPattern": "true",
      "id": "100*"
    }
  ]
}'
