import requests
import hmac
import hashlib
import urllib.parse
from django.conf import settings

def create_passimpay_invoice(transaction_id, amount_usd):
    url = "https://api.passimpay.io/createorder" 
    
    # 1. Формируем данные (Порядок ВАЖЕН для правильного хэша)
    payload = {
        "platform_id": str(settings.PASSIMPAY_PLATFORM_ID),
        "order_id": str(transaction_id),
        "amount": str(amount_usd),
    }

    # 2. Собираем строку запроса для подписи (как делает PHP http_build_query)
    query_string = urllib.parse.urlencode(payload)

    # 3. Генерируем HMAC-SHA256 хэш, используя твой ключ как Secret
    secret_key = settings.PASSIMPAY_API_KEY.encode('utf-8')
    sign_hash = hmac.new(secret_key, query_string.encode('utf-8'), hashlib.sha256).hexdigest()

    # 4. Вкладываем хэш в итоговые данные для отправки!
    payload['hash'] = sign_hash

    headers = {
        "Content-Type": "application/x-www-form-urlencoded"
    }

    response = requests.post(url, data=payload, headers=headers)
    
    if response.status_code == 200:
        data = response.json()
        if "url" in data:
            return data["url"]
        else:
            raise Exception(f"PassimPay вернул 200, но без ссылки: {data}")
            
    raise Exception(f"PassimPay HTTP {response.status_code}: {response.text}")