from flask import Flask, request, jsonify
from services.telegram_service import send_message
from services.google_maps_service import get_geocode

app = Flask(__name__)

@app.route('/api/telegram/send', methods=['POST'])
def telegram_send():
    data = request.json
    chat_id = data.get("chat_id")
    text = data.get("text")
    result = send_message(chat_id, text)
    return jsonify(result)

@app.route('/api/maps/geocode', methods=['GET'])
def maps_geocode():
    address = request.args.get("address")
    result = get_geocode(address)
    return jsonify(result)

if __name__ == '__main__':
    app.run(debug=True)
