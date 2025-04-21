from flask import Flask, request, jsonify
from services.telegram_service import send_message, get_bot_info
from services.google_maps_service import get_geocode
from config import META_URL, META_APP_ID, META_APP_SECRET, REDIRECT_URI, TELEGRAM_BOT_TOKEN, TWITTER_API_KEY, TWITTER_API_SECRET, TWITTER_ACCESS_TOKEN, TWITTER_ACCESS_TOKEN_SECRET
from flask_cors import CORS  
import requests
import os
import httpx
from dotenv import load_dotenv
import asyncio
import threading
from services.telegram_service import send_message, get_bot_info, run_bot, get_updates
import tweepy
import time
import logging

BASE_URL = f"https://api.telegram.org/bot{TELEGRAM_BOT_TOKEN}"
auth = tweepy.OAuth1UserHandler(
    TWITTER_API_KEY, 
    TWITTER_API_SECRET,
    TWITTER_ACCESS_TOKEN,
    TWITTER_ACCESS_TOKEN_SECRET
)

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

load_dotenv()

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})


class MockTwitterAPI:
    def user_timeline(self, screen_name=None, count=10, tweet_mode=None):
        logger.info(f"Obteniendo timeline de usuario: {screen_name}")
        return [
            MockTweet(
                id=1001,
                text=f"Este es un tweet de prueba de {screen_name} #1",
                created_at="2025-04-20T12:00:00Z",
                user=MockUser(name=f"{screen_name} User", screen_name=screen_name),
                retweet_count=5,
                favorite_count=10
            ),
            MockTweet(
                id=1002,
                text=f"Otro tweet interesante de {screen_name} #2",
                created_at="2025-04-20T11:30:00Z",
                user=MockUser(name=f"{screen_name} User", screen_name=screen_name),
                retweet_count=12,
                favorite_count=24
            ),
            MockTweet(
                id=1003,
                text=f"Contenido de prueba de {screen_name} #3",
                created_at="2025-04-20T11:00:00Z",
                user=MockUser(name=f"{screen_name} User", screen_name=screen_name),
                retweet_count=8,
                favorite_count=17
            )
        ]
    
    def update_status(self, text):
        logger.info(f"Publicando tweet: {text}")
        return MockTweet(
            id=2001,
            text=text,
            created_at="2025-04-21T10:00:00Z",
            user=MockUser(name="Mi Usuario", screen_name="mi_usuario"),
            retweet_count=0,
            favorite_count=0
        )
    
    def search_tweets(self, q=None, count=10, tweet_mode=None):
        hashtag = q.replace("#", "")
        logger.info(f"Buscando tweets con hashtag: {hashtag}")
        return [
            MockTweet(
                id=3001,
                text=f"Tweet relacionado con #{hashtag} de usuario1",
                created_at="2025-04-20T09:00:00Z",
                user=MockUser(name="Usuario Demo 1", screen_name="usuario1"),
                retweet_count=3,
                favorite_count=7
            ),
            MockTweet(
                id=3002,
                text=f"Otro tweet sobre #{hashtag} de usuario2",
                created_at="2025-04-20T08:30:00Z",
                user=MockUser(name="Usuario Demo 2", screen_name="usuario2"),
                retweet_count=9,
                favorite_count=15
            )
        ]
    
    def get_place_trends(self, id=1):
        logger.info(f"Obteniendo tendencias para WOEID: {id}")
        return [{
            "trends": [
                {"name": "#Python", "url": "http://example.com/Python", "promoted_content": None, "query": "%23Python", "tweet_volume": 12345},
                {"name": "#React", "url": "http://example.com/React", "promoted_content": None, "query": "%23React", "tweet_volume": 54321},
                {"name": "#NextJS", "url": "http://example.com/NextJS", "promoted_content": None, "query": "%23NextJS", "tweet_volume": 6789},
                {"name": "#Flask", "url": "http://example.com/Flask", "promoted_content": None, "query": "%23Flask", "tweet_volume": 4567},
                {"name": "#JavaScript", "url": "http://example.com/JavaScript", "promoted_content": None, "query": "%23JavaScript", "tweet_volume": 98765},
                {"name": "#APIIntegration", "url": "http://example.com/APIIntegration", "promoted_content": None, "query": "%23APIIntegration", "tweet_volume": 3456},
                {"name": "#TechJobs", "url": "http://example.com/TechJobs", "promoted_content": None, "query": "%23TechJobs", "tweet_volume": 7890},
                {"name": "#WebDevelopment", "url": "http://example.com/WebDevelopment", "promoted_content": None, "query": "%23WebDevelopment", "tweet_volume": 45678},
                {"name": "#Frontend", "url": "http://example.com/Frontend", "promoted_content": None, "query": "%23Frontend", "tweet_volume": 34567},
                {"name": "#Backend", "url": "http://example.com/Backend", "promoted_content": None, "query": "%23Backend", "tweet_volume": 23456}
            ]
        }]

class MockUser:
    def __init__(self, name, screen_name):
        self.name = name
        self.screen_name = screen_name

class MockTweet:
    def __init__(self, id, text, created_at, user, retweet_count, favorite_count):
        self.id = id
        self.text = text
        self.full_text = text  
        self.created_at = created_at
        self.user = user
        self.retweet_count = retweet_count
        self.favorite_count = favorite_count

api = MockTwitterAPI()

def tweet_to_dict(tweet):
    return {
        "id": str(tweet.id),
        "text": tweet.full_text if hasattr(tweet, 'full_text') else tweet.text,
        "created_at": str(tweet.created_at),
        "user_name": tweet.user.name,
        "user_screen_name": tweet.user.screen_name,
        "retweet_count": tweet.retweet_count,
        "favorite_count": tweet.favorite_count
    }
@app.route('/user_timeline/<username>')
def get_user_timeline(username):
    """Obtener tweets de un usuario específico."""
    try:
        count = request.args.get('count', default=10, type=int)
        tweets = api.user_timeline(screen_name=username, count=count, tweet_mode="extended")
        return jsonify([tweet_to_dict(tweet) for tweet in tweets])
    except tweepy.TweepyException as e:
        return jsonify({"error": str(e)}), 400

@app.route('/tweet', methods=['POST'])
def create_tweet():
    try:
        data = request.get_json()
        if not data or 'text' not in data:
            return jsonify({"error": "Se requiere el texto del tweet"}), 400
        
        new_tweet = api.update_status(data['text'])
        return jsonify(tweet_to_dict(new_tweet))
    except tweepy.TweepyException as e:
        return jsonify({"error": str(e)}), 400

@app.route('/search/<hashtag>')
def search_tweets(hashtag):
    try:
        count = request.args.get('count', default=10, type=int)
        tweets = api.search_tweets(q=f"#{hashtag}", count=count, tweet_mode="extended")
        return jsonify([tweet_to_dict(tweet) for tweet in tweets])
    except tweepy.TweepyException as e:
        return jsonify({"error": str(e)}), 400

@app.route('/trends/<int:woeid>')
def get_trends(woeid=1):
    """
    Obtiene las tendencias actuales de Twitter para un WOEID específico.
    WOEID (Where On Earth ID): 
    1 = Mundial, 23424950 = España, 23424977 = USA, etc.
    """
    try:
        # Obtener tendencias usando la API real
        trends = api.get_place_trends(id=woeid)
        
        # Procesar los datos para devolverlos en formato JSON
        trends_data = []
        for trend in trends[0]["trends"]:
            trend_info = {
                "name": trend["name"],
                "url": trend["url"],
                "tweet_volume": trend.get("tweet_volume", "No disponible"),
                "query": trend["query"]
            }
            trends_data.append(trend_info)
        
        return jsonify(trends_data)
    
    except tweepy.TweepyException as e:
        logger.error(f"Error al obtener tendencias: {str(e)}")
        return jsonify({"error": str(e)}), 400

@app.route('/trends/available')
def get_available_trend_locations():
    """Obtiene ubicaciones disponibles para tendencias"""
    try:
        # Nota: Esta función puede no estar disponible en todas las versiones de Tweepy
        available_locations = api.available_trends()
        simplified_locations = []
        
        for loc in available_locations:
            simplified_locations.append({
                "name": loc["name"],
                "woeid": loc["woeid"],
                "country": loc.get("country", "")
            })
            
        return jsonify(simplified_locations)
    
    except tweepy.TweepyException as e:
        return jsonify({"error": str(e)}), 400

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