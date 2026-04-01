# billing/passimpay.py
import requests
from django.conf import settings

def create_passimpay_invoice(transaction_id, amount_usd):
    """
    Стучится в API PassimPay и возвращает ссылку на оплату криптой.
    """
    url = "https://api.passimpay.io/createorder" 
    
    payload = {
        "platform_id": settings.PASSIMPAY_PLATFORM_ID,
        "order_id": str(transaction_id), # Наш ID транзакции со статусом PENDING
        "amount": str(amount_usd),
    }

    headers = {
        "x-api-key": settings.PASSIMPAY_API_KEY, # Используем API Key для авторизации запроса
        "Content-Type": "application/x-www-form-urlencoded"
    }

    try:
        response = requests.post(url, data=payload, headers=headers)
        if response.status_code == 200:
            return response.json().get("url") # Ссылка на страницу оплаты PassimPay
    except Exception as e:
        print(f"PassimPay API Error: {e}")
    
    return None