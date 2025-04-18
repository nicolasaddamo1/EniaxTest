from config import GOOGLE_MAPS_API_KEY
import requests

def get_geocode(address):
    url = f"https://maps.googleapis.com/maps/api/geocode/json"
    params = {"address": address, "key": GOOGLE_MAPS_API_KEY}
    res = requests.get(url, params=params)
    return res.json()
