import requests
from config import TELEGRAM_BOT_TOKEN

BASE_URL = f"https://api.telegram.org/bot{TELEGRAM_BOT_TOKEN}"

def send_message(chat_id: str, text: str):
    url = f"{BASE_URL}/sendMessage"
    payload = {"chat_id": chat_id, "text": text}
    res = requests.post(url, json=payload)
    return res.json()

def get_bot_info():
    url = f"{BASE_URL}/getMe"
    res = requests.get(url)
    return res.json()
