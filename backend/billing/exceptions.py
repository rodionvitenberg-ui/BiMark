class BillingError(Exception):
    """Базовый класс для всех ошибок биллинга"""
    pass

class InsufficientFunds(BillingError):
    """Недостаточно средств на балансе"""
    pass

class DuplicateTransaction(BillingError):
    """Транзакция с таким reference_id уже существует"""
    pass