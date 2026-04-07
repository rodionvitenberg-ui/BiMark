import requests
from django.conf import settings

def create_passimpay_invoice(transaction_id, amount_usd):
    """
    Стучится в API PassimPay и возвращает ссылку на оплату криптой.
    """
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

    try:
        response = requests.post(url, data=payload, headers=headers)
        
        # Если статус 200 (ОК), отдаем ссылку
        if response.status_code == 200:
            return response.json().get("url")
            
        # ЕСЛИ ОШИБКА — генерируем исключение с реальным ответом от PassimPay
        raise Exception(f"HTTP {response.status_code}: {response.text}")
        
    except Exception as e:
        # Пробрасываем ошибку выше, чтобы она попала в models.Transaction
        raise Exception(str(e))