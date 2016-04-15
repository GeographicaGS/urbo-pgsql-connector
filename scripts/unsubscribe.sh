curl localhost:1026/v1/unsubscribeContext -s -S --header 'Content-Type: application/json' \
    --header 'Accept: application/json' -d @- | python -mjson.tool) <<EOF
{
    "subscriptionId": "56d800833e6ed711727d7e6b"
}



curl -X POST --insecure https://195.235.93.224:10027/v1/unsubscribeContext --header 'Content-Type: application/json' --header 'Accept: application/json' --header 'Fiware-Service: sc_smart_region_andalucia' --header 'Fiware-ServicePath: /and_sr_osuna' --header 'x-auth-token: 95dc89aa08bb43e5ab0d77a6e7479a23' -d '{
    "subscriptionId": "5710c3cac6085dbaf4827917"
}'
