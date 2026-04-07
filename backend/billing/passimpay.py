import requests
from django.conf import settings

def create_passimpay_invoice(transaction_id, amount_usd):
    url = "https://api.passimpay.io/createorder" 
    
    payload = {
        "platform_id": settings.PASSIMPAY_PLATFORM_ID,
        "order_id": str(transaction_id),
        "amount": str(amount_usd),
    }

    headers = {
        "x-api-key": settings.PASSIMPAY_API_KEY,
        "Content-Type": "application/x-www-form-urlencoded"
    }

    # Делаем запрос без блоков try-except, чтобы любая ошибка летела прямо на фронтенд
    response = requests.post(url, data=payload, headers=headers)
    
    if response.status_code == 200:
        data = response.json()
        if "url" in data:
            return data["url"]
        else:
            # На случай, если ответ 200, но формат JSON другой
            raise Exception(f"Странный ответ от PassimPay: {data}")
            
    # Если статус не 200 (например, 401 или 403) — жестко выводим ответ сервера
    raise Exception(f"PassimPay HTTP {response.status_code}: {response.text}")