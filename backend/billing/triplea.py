import requests
from django.conf import settings

def get_triplea_access_token():
    base_url = "https://api.triple-a.io" if settings.TRIPLEA_MODE == 'live' else "https://api.sandbox.triple-a.io"
    url = f"{base_url}/api/v2/oauth/token"
    
    payload = {
        "client_id": settings.TRIPLEA_CLIENT_ID,
        "client_secret": settings.TRIPLEA_CLIENT_SECRET,
        "grant_type": "client_credentials"
    }
    
    response = requests.post(url, data=payload)
    response.raise_for_status()
    return response.json()['access_token']

def create_triplea_payment(amount, reference_id):
    token = get_triplea_access_token()
    base_url = "https://api.triple-a.io" if settings.TRIPLEA_MODE == 'live' else "https://api.sandbox.triple-a.io"
    url = f"{base_url}/api/v2/payment"
    
    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json"
    }
    
    payload = {
        "type": "triplea",
        "merchant_key": settings.TRIPLEA_MERCHANT_KEY,
        "order_currency": "USD",
        "order_amount": str(amount),
        "notify_url": f"{settings.FRONTEND_URL}/api/webhooks/triplea/", # Наш хук
        "notify_secret": settings.TRIPLEA_WEBHOOK_SECRET, # Защита от фейковых хуков
        "notify_txs": True,
        "payment_reference": str(reference_id) # ID нашей транзакции
    }
    
    response = requests.post(url, json=payload, headers=headers)
    response.raise_for_status()
    return response.json()