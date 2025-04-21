import time
import requests
from config import TELEGRAM_BOT_TOKEN

BASE_URL = f"https://api.telegram.org/bot{TELEGRAM_BOT_TOKEN}"

def send_message(chat_id: str, text: str):
    url = f"{BASE_URL}/sendMessage"
    payload = {"chat_id": chat_id, "text": text}
    res = requests.post(url, json=payload)
    print("🔁 Respuesta de Telegram:", res.json())  

    return res.json()

def get_bot_info():
    url = f"{BASE_URL}/getMe"
    res = requests.get(url)
    return res.json()

def get_updates(offset=None):
    url = f"{BASE_URL}/getUpdates"
    params = {"timeout": 100, "offset": offset}
    res = requests.get(url, params=params)
    return res.json()

def run_bot():
    print("✅ Bot corriendo...")
    last_update_id = None

    while True:
        updates = get_updates(offset=last_update_id)

        if "result" in updates:
            for update in updates["result"]:
                message = update.get("message")
                if message:
                    chat_id = message["chat"]["id"]
                    text = message.get("text", "").lower()

                    # Comandos o palabras específicas
                    if text.startswith("/start"):
                        send_message(chat_id, "¡Hola! Soy tu bot 🤖 ¿En qué puedo ayudarte?")
                    elif text == "/info":
                        info = (
                            "Soy Nicolas Addamo, el creador de este bot. "
                            "Tengo 33 años, Analista en sistemas, me recibí en el 2014. "
                            "Stack MERN Full stack, Backend NESTJS."
                        )
                        send_message(chat_id, info)
                    elif "hola" in text:
                        send_message(chat_id, "¡Hola! ¿Cómo estás?")
                    else:
                        send_message(chat_id, f"No entendí: {text}")
                # Marcar como leído
                last_update_id = update["update_id"] + 1

        time.sleep(1)

def responder_a_comando(message_text, chat_id):
    if message_text == "/info":
        info = (
            "Soy Nicolas Addamo, el creador de este bot. "
            "Tengo 33 años, Analista en sistemas, me recibí en el 2014. "
            "Stack MERN Full stack, Backend NESTJS."
        )
        requests.post(
            f"https://api.telegram.org/bot{TELEGRAM_BOT_TOKEN}/sendMessage",
            json={"chat_id": chat_id, "text": info}
        )

def revisar_mensajes():
    global LAST_UPDATE_ID

    res = requests.get(f"https://api.telegram.org/bot{TELEGRAM_BOT_TOKEN}/getUpdates")
    data = res.json()

    if not data["ok"]:
        print("Error al obtener updates")
        return

    for result in data["result"]:
        update_id = result["update_id"]
        message = result.get("message", {})
        text = message.get("text", "")
        chat_id = message.get("chat", {}).get("id", "")

        if update_id != LAST_UPDATE_ID:
            print(f"🔄 Nuevo mensaje: {text} de {chat_id}")
            responder_a_comando(text, chat_id)
            LAST_UPDATE_ID = update_id

if __name__ == "__main__":
    run_bot()
