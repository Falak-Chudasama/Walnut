# Server
cd server; npm run dev

# Client
cd client/walnut-client; npm run dev

# Microservice
cd services/embed-services; .\venv\Scripts\activate; python -m uvicorn app:app --reload --host 127.0.0.1 --port 3052