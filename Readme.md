# Eniax Technical Test

This repository was created to store the technical test for the **Eniax** company.

## 🧠 Technologies Used

- **Backend:** Python with Flask (for a fast API setup)
- **Frontend:** TypeScript with the Next.js framework

## APIs Used

-Send message to user/users/groups
-Get information of a bot 
-Twitter trends
-Login with facebook
-Maps of google maps
-Street view image of googlemaps.

# How to start:

I will keep deployed the frontend and backend for about a week:
## Frontend: https://apt-searches-ph-firm.trycloudflare.com/

## Backend: https://war-prophet-logos-twiki.trycloudflare.com

Also you can start with cd /frontend

and then:
´´´bash 

npm i

´´´
Meanwhile you can set the .env file, wich is mandatory.
META_APP_ID=facebook_developer_app_id
NEXT_PUBLIC_FACEBOOK_APP_ID=facebook_developer_app_test_id
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=google_Api_key
NEXT_PUBLIC_GOOGLE_MAPS_API_SECRET=google_Api_key_secret

then 

´´´bash 

npm run dev

´´´
The same for backend, but as I used python it's a little different.
Once you do cd /backend, start with

´´´bash 
pip install -r requirements.txt
´´´

Meanwhile you need .env file for the backend 
META_URL='f"https://www.facebook.com/v12.0/dialog/oauth?client_id={META_APP_ID}&redirect_uri={REDIRECT_URI}&state=123456&scope=public_profile,email"'
TELEGRAM_BOT_TOKEN= Telegram_token
META_APP_ID=facebook_developer_app_id
META_APP_SECRET=facebook_developer_app_secret
REDIRECT_URI='http://localhost:5000/auth/facebook/callback'

TWITTER_API_KEY=your_x_token
TWITTER_API_SECRET=your_x_secret
TWITTER_ACCESS_TOKEN=your_app_x_token
TWITTER_ACCESS_TOKEN_SECRET=your_app_x_token_secret

and finish with:

´´´bash 
python app.py
´´´

