import requests
from django.conf import settings
from requests.auth import HTTPBasicAuth

def get_paypal_access_token():
    url = "https://api-m.sandbox.paypal.com/v1/oauth2/token" if settings.PAYPAL_MODE == 'sandbox' else "https://api-m.paypal.com/v1/oauth2/token"
    response = requests.post(
        url,
        auth=HTTPBasicAuth(settings.PAYPAL_CLIENT_ID, settings.PAYPAL_CLIENT_SECRET),
        data={"grant_type": "client_credentials"}
    )
    response.raise_for_status()
    return response.json()['access_token']

def create_paypal_order(amount, currency="USD"):
    token = get_paypal_access_token()
    url = "https://api-m.sandbox.paypal.com/v2/checkout/orders" if settings.PAYPAL_MODE == 'sandbox' else "https://api-m.paypal.com/v2/checkout/orders"
    
    headers = {
        "Content-Type": "application/json",
        "Authorization": f"Bearer {token}"
    }
    
    payload = {
        "intent": "CAPTURE",
        "purchase_units": [{
            "amount": {
                "currency_code": currency,
                "value": str(amount)
            }
        }]
    }
    
    response = requests.post(url, json=payload, headers=headers)
    response.raise_for_status()
    return response.json()

def capture_paypal_order(order_id):
    token = get_paypal_access_token()
    url = f"https://api-m.sandbox.paypal.com/v2/checkout/orders/{order_id}/capture" if settings.PAYPAL_MODE == 'sandbox' else f"https://api-m.paypal.com/v2/checkout/orders/{order_id}/capture"
    
    headers = {
        "Content-Type": "application/json",
        "Authorization": f"Bearer {token}"
    }
    
    response = requests.post(url, headers=headers)
    response.raise_for_status()
    return response.json()