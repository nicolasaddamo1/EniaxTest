from flask import Flask, request, jsonify
from services.telegram_service import send_message, get_bot_info
from services.google_maps_service import get_geocode
from config import META_URL, META_APP_ID, META_APP_SECRET, REDIRECT_URI, TELEGRAM_BOT_TOKEN
from flask_cors import CORS  
import requests
import os
import httpx
import asyncio
import threading
from services.telegram_service import send_message, get_bot_info, run_bot, get_updates
BASE_URL = f"https://api.telegram.org/bot{TELEGRAM_BOT_TOKEN}"

import time


app = Flask(__name__)
CORS(app)

@app.route("/api/telegram/send", methods=["POST"])
def send_telegram():
    data = request.get_json()
    chat_id = data.get("chat_id")
    message = data.get("message")

    if not chat_id or not message:
        return jsonify({"error": "Faltan datos"}), 400

    telegram_url = f"https://api.telegram.org/bot{TELEGRAM_BOT_TOKEN}/sendMessage"
    payload = {
        "chat_id": chat_id,
        "text": message
    }

    res = requests.post(telegram_url, json=payload)
    response_json = res.json()
    print("🔁 Respuesta de Telegram:", response_json)

    if response_json.get("ok"):
        return jsonify({
            "success": True,
            "bot_message": response_json["result"]  # 👈 Solo esto
        }), 200
    else:
        return jsonify({
            "success": False,
            "error": response_json
        }), 400

@app.route('/api/telegram/me', methods=['GET'])
def telegram_get_me():
    result = get_bot_info()
    return jsonify(result)

@app.route('/auth/facebook/callback', methods=['POST'])
def auth_facebook_callback():
    if not request.is_json:
        return jsonify({"error": "Request must be JSON"}), 400
    
    data = request.get_json()
    code = data.get('code')
    
    if not code:
        return jsonify({"error": "Code is required"}), 400
    
    # Usamos asyncio para manejar las llamadas async
    async def get_token_and_user():
        async with httpx.AsyncClient() as client:
            # Obtener token
            token_response = await client.get(
                "https://graph.facebook.com/v12.0/oauth/access_token",
                params={
                    "client_id": META_APP_ID,
                    "client_secret": META_APP_SECRET,
                    "redirect_uri": REDIRECT_URI,
                    "code": code
                }
            )
            
            if token_response.status_code != 200:
                return None, "Error al obtener token"
            
            access_token = token_response.json().get("access_token")
            
            # Obtener info usuario
            user_response = await client.get(
                f"https://graph.facebook.com/me?fields=id,name,email&access_token={access_token}"
            )
            
            return user_response.json(), None
    
    # Ejecutar la corutina
    user_data, error = asyncio.run(get_token_and_user())
    
    if error:
        return jsonify({"error": error}), 400
    
    return jsonify(user_data)

@app.route('/api/facebook/verify', methods=['POST'])
def verify_facebook_token():
    # Verifica que el request tenga JSON
    if not request.is_json:
        return jsonify({"error": "Request must be JSON"}), 400
    
    # Obtiene el token del cuerpo del request
    data = request.get_json()
    access_token = data.get('access_token')
    
    if not access_token:
        return jsonify({"error": "access_token is required"}), 400
    
    # Función async para verificar el token
    async def verify_token():
        async with httpx.AsyncClient() as client:
            # Verificar el token
            debug_response = await client.get(
                "https://graph.facebook.com/debug_token",
                params={
                    "input_token": access_token,
                    "access_token": f"{META_APP_ID}|{META_APP_SECRET}"
                }
            )
            
            if debug_response.status_code != 200:
                return None, {"error": "Token inválido"}
            
            debug_data = debug_response.json()
            if not debug_data.get("data", {}).get("is_valid"):
                return None, {"error": "Token no válido"}
            
            # Obtener datos del usuario
            user_response = await client.get(
                f"https://graph.facebook.com/me?fields=id,name,email&access_token={access_token}"
            )
            
            return {
                "user": user_response.json(),
                "token_info": debug_data
            }, None
    
    # Ejecutar la corutina
    try:
        result, error = asyncio.run(verify_token())
        if error:
            return jsonify(error), 400
        return jsonify(result)
    except Exception as e:
        return jsonify({"error": str(e)}), 500



if __name__ == '__main__':
    bot_thread = threading.Thread(target=run_bot, daemon=True)
    bot_thread.start()
    app.run(debug=True)