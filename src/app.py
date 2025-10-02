#!/usr/bin/env python3
"""
AI Chatbot Framework
Advanced AI chatbot framework with natural language understanding
Built by Gabriel Demetrios Lafis
"""

from flask import Flask, request, jsonify, render_template
from flask_socketio import SocketIO, emit
import nltk
import json
import sqlite3
import re
from datetime import datetime
from textblob import TextBlob
import random
import os
import sys

# Adicionar o diretório config ao sys.path para importar config.py
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "config")))
import config

app = Flask(__name__, static_folder='.', static_url_path='')
app.config["SECRET_KEY"] = config.APP_CONFIG["secret_key"] if "secret_key" in config.APP_CONFIG else 'chatbot-secret-key'
socketio = SocketIO(app, cors_allowed_origins="*")

# Initialize NLTK
try:
    nltk.data.find("tokenizers/punkt")
except LookupError:
    nltk.download("punkt")

class ChatbotEngine:
    def __init__(self):
        self.init_database()
        self.responses = {
            "greeting": [
                "Hello! How can I help you today?",
                "Hi there! What can I do for you?",
                "Greetings! How may I assist you?",
            ],
            "goodbye": [
                "Goodbye! Have a great day!",
                "See you later!",
                "Take care!",
            ],
            "default": [
                "I understand. Can you tell me more?",
                "That's interesting. What else would you like to know?",
                "I'm here to help. Could you be more specific?",
            ],
        }

    def init_database(self):
        db_path = getattr(self, "db_path", "chatbot.db")
        conn = sqlite3.connect(db_path)

        cursor = conn.cursor()
        cursor.execute(
            """
            CREATE TABLE IF NOT EXISTS conversations (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id TEXT,
                session_id TEXT,
                message TEXT,
                response TEXT,
                sentiment REAL,
                timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        """
        )
        conn.commit()
        conn.close()

    def analyze_sentiment(self, text):
        blob = TextBlob(text)
        return blob.sentiment.polarity

    def detect_intent(self, message):
        message_lower = message.lower()

        greetings = ["hello", "hi", "hey", "good morning", "good afternoon"]
        goodbyes = ["bye", "goodbye", "see you", "farewell"]

        if any(greeting in message_lower for greeting in greetings):
            return "greeting"
        elif any(goodbye in message_lower for goodbye in goodbyes):
            return "goodbye"
        else:
            return "default"

    def generate_response(self, message, user_id, session_id):
        intent = self.detect_intent(message)
        sentiment = self.analyze_sentiment(message)

        response = random.choice(self.responses[intent])

        # Store conversation
        self.store_conversation(user_id, session_id, message, response, sentiment)

        return {
            "response": response,
            "intent": intent,
            "sentiment": sentiment,
            "confidence": 0.85,
            "timestamp": datetime.now().isoformat(),
        }

    def store_conversation(self, user_id, session_id, message, response, sentiment):
        db_path = getattr(self, "db_path", "chatbot.db")
        conn = sqlite3.connect(db_path)


        cursor = conn.cursor()
        cursor.execute(
            """
            INSERT INTO conversations (user_id, session_id, message, response, sentiment)
            VALUES (?, ?, ?, ?, ?)
        """,
            (user_id, session_id, message, response, sentiment),
        )
        conn.commit()
        conn.close()

chatbot = ChatbotEngine()

@app.route("/")
def index():
    return render_template("index.html")

@app.route("/api/chat", methods=["POST"])
def chat_api():
    data = request.get_json()
    message = data.get("message", "")
    user_id = data.get("user_id", "anonymous")
    session_id = data.get("session_id", "default")

    if not message:
        return jsonify({"error": "Message is required"}), 400

    response = chatbot.generate_response(message, user_id, session_id)
    return jsonify(response)

@app.route("/api/conversations/<user_id>")
def get_conversations(user_id):
    db_path = getattr(chatbot, "db_path", "chatbot.db")
    conn = sqlite3.connect(db_path)

    cursor = conn.cursor()
    cursor.execute(
        """
        SELECT message, response, sentiment, timestamp
        FROM conversations
        WHERE user_id = ?
        ORDER BY timestamp DESC
        LIMIT 50
    """,
        (user_id,),
    )

    conversations = []
    for row in cursor.fetchall():
        conversations.append(
            {
                "message": row[0],
                "response": row[1],
                "sentiment": row[2],
                "timestamp": row[3],
            }
        )

    conn.close()
    return jsonify(conversations)

@app.route("/api/analytics")
def get_analytics():
    db_path = getattr(chatbot, "db_path", "chatbot.db")
    conn = sqlite3.connect(db_path)

    cursor = conn.cursor()

    # Total conversations
    cursor.execute("SELECT COUNT(*) FROM conversations")
    total_conversations = cursor.fetchone()[0]

    # Average sentiment
    cursor.execute("SELECT AVG(sentiment) FROM conversations")
    avg_sentiment = cursor.fetchone()[0] or 0

    # Conversations today
    cursor.execute(
        """
        SELECT COUNT(*) FROM conversations
        WHERE date(timestamp) = date('now')
    """
    )
    conversations_today = cursor.fetchone()[0]

    conn.close()

    return jsonify(
        {
            "total_conversations": total_conversations,
            "average_sentiment": round(avg_sentiment, 3),
            "conversations_today": conversations_today,
            "status": "active",
        }
    )

@socketio.on("chat_message")
def handle_chat_message(data):
    message = data.get("message", "")
    user_id = data.get("user_id", "anonymous")
    session_id = data.get("session_id", "default")

    response = chatbot.generate_response(message, user_id, session_id)
    emit("bot_response", response)

if __name__ == "__main__":
    socketio.run(app, debug=config.APP_CONFIG["debug"], host=config.APP_CONFIG["host"], port=config.APP_CONFIG["port"])

