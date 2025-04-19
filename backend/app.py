from flask import Flask, request, jsonify
from fastapi  import  FastAPI, HTTPException, Request
from services.telegram_service import send_message, get_bot_info
from services.google_maps_service import get_geocode
from config import META_URL, META_APP_ID, META_APP_SECRET
import httpx
from pydantic import BaseModel

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
@app.post("/auth/facebook/callback")
async def auth_facebook_callback(request: AuthRequest):
    code = request.code
    
    # Intercambia el código por un token de acceso
    async with httpx.AsyncClient() as client:
        response = await client.get(
            "https://graph.facebook.com/v12.0/oauth/access_token",
            params={
                "client_id": META_APP_ID,
                "client_secret": META_APP_SECRET,
                "redirect_uri": REDIRECT_URI,
                "code": code
            }
        )
    
    if response.status_code != 200:
        raise HTTPException(status_code=400, detail="Error al obtener token")
    
    access_token = response.json().get("access_token")
    
    # Obtén información del usuario
    user_response = await client.get(
        f"https://graph.facebook.com/me?fields=id,name,email&access_token={access_token}"
    )
    
    return user_response.json()
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