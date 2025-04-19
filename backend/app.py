from flask import Flask, request, jsonify
from services.telegram_service import send_message, get_bot_info
from services.google_maps_service import get_geocode
from config import META_URL, META_APP_ID, META_APP_SECRET, REDIRECT_URI
import httpx
import asyncio

app = Flask(__name__)

@app.route('/api/telegram/send', methods=['POST'])
def telegram_send():
    data = request.json
    chat_id = data.get("chat_id")
    text = data.get("text")
    if not chat_id or not text:
        return jsonify({"error": "chat_id and text are required"})
    result = send_message(chat_id, text)
    return jsonify(result)

@app.get("/auth/facebook")
async def auth_facebook():
    return {
        "url": META_URL,
    }
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
@app.route('/api/telegram/me', methods=['GET'])
def telegram_get_me():
    result = get_bot_info()
    return jsonify(result)

@app.route('/api/maps/geocode', methods=['GET'])
def maps_geocode():
    address = request.args.get("address")
    result = get_geocode(address)
    return jsonify(result)

if __name__ == '__main__':
    app.run(debug=True)