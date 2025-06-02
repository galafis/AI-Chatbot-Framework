#!/usr/bin/env python3
"""
AI Chatbot Framework
Advanced AI chatbot framework with natural language understanding
Built by Gabriel Demetrios Lafis
"""

from flask import Flask, request, jsonify, render_template_string
from flask_socketio import SocketIO, emit
import nltk
import json
import sqlite3
import re
from datetime import datetime
from textblob import TextBlob
import random

app = Flask(__name__)
app.config['SECRET_KEY'] = 'chatbot-secret-key'
socketio = SocketIO(app, cors_allowed_origins="*")

# Initialize NLTK
try:
    nltk.data.find('tokenizers/punkt')
except LookupError:
    nltk.download('punkt')

class ChatbotEngine:
    def __init__(self):
        self.init_database()
        self.responses = {
            'greeting': [
                "Hello! How can I help you today?",
                "Hi there! What can I do for you?",
                "Greetings! How may I assist you?"
            ],
            'goodbye': [
                "Goodbye! Have a great day!",
                "See you later!",
                "Take care!"
            ],
            'default': [
                "I understand. Can you tell me more?",
                "That's interesting. What else would you like to know?",
                "I'm here to help. Could you be more specific?"
            ]
        }
    
    def init_database(self):
        conn = sqlite3.connect('chatbot.db')
        cursor = conn.cursor()
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS conversations (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id TEXT,
                session_id TEXT,
                message TEXT,
                response TEXT,
                sentiment REAL,
                timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        ''')
        conn.commit()
        conn.close()
    
    def analyze_sentiment(self, text):
        blob = TextBlob(text)
        return blob.sentiment.polarity
    
    def detect_intent(self, message):
        message_lower = message.lower()
        
        greetings = ['hello', 'hi', 'hey', 'good morning', 'good afternoon']
        goodbyes = ['bye', 'goodbye', 'see you', 'farewell']
        
        if any(greeting in message_lower for greeting in greetings):
            return 'greeting'
        elif any(goodbye in message_lower for goodbye in goodbyes):
            return 'goodbye'
        else:
            return 'default'
    
    def generate_response(self, message, user_id, session_id):
        intent = self.detect_intent(message)
        sentiment = self.analyze_sentiment(message)
        
        response = random.choice(self.responses[intent])
        
        # Store conversation
        self.store_conversation(user_id, session_id, message, response, sentiment)
        
        return {
            'response': response,
            'intent': intent,
            'sentiment': sentiment,
            'confidence': 0.85,
            'timestamp': datetime.now().isoformat()
        }
    
    def store_conversation(self, user_id, session_id, message, response, sentiment):
        conn = sqlite3.connect('chatbot.db')
        cursor = conn.cursor()
        cursor.execute('''
            INSERT INTO conversations (user_id, session_id, message, response, sentiment)
            VALUES (?, ?, ?, ?, ?)
        ''', (user_id, session_id, message, response, sentiment))
        conn.commit()
        conn.close()

chatbot = ChatbotEngine()

@app.route('/')
def index():
    return render_template_string('''
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>AI Chatbot Framework</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); min-height: 100vh; display: flex; align-items: center; justify-content: center; }
        .chat-container { background: white; border-radius: 20px; box-shadow: 0 20px 40px rgba(0,0,0,0.1); width: 400px; height: 600px; display: flex; flex-direction: column; overflow: hidden; }
        .chat-header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; text-align: center; }
        .chat-messages { flex: 1; padding: 20px; overflow-y: auto; }
        .message { margin-bottom: 15px; }
        .user-message { text-align: right; }
        .bot-message { text-align: left; }
        .message-bubble { display: inline-block; padding: 10px 15px; border-radius: 15px; max-width: 80%; }
        .user-bubble { background: #667eea; color: white; }
        .bot-bubble { background: #f1f1f1; color: #333; }
        .chat-input { display: flex; padding: 20px; border-top: 1px solid #eee; }
        .chat-input input { flex: 1; padding: 10px; border: 1px solid #ddd; border-radius: 20px; outline: none; }
        .chat-input button { margin-left: 10px; padding: 10px 20px; background: #667eea; color: white; border: none; border-radius: 20px; cursor: pointer; }
    </style>
</head>
<body>
    <div class="chat-container">
        <div class="chat-header">
            <h2>🤖 AI Chatbot</h2>
            <p>Powered by Gabriel Demetrios Lafis</p>
        </div>
        <div class="chat-messages" id="messages">
            <div class="message bot-message">
                <div class="message-bubble bot-bubble">
                    Hello! I'm your AI assistant. How can I help you today?
                </div>
            </div>
        </div>
        <div class="chat-input">
            <input type="text" id="messageInput" placeholder="Type your message..." onkeypress="handleKeyPress(event)">
            <button onclick="sendMessage()">Send</button>
        </div>
    </div>

    <script src="https://cdnjs.cloudflare.com/ajax/libs/socket.io/4.0.1/socket.io.js"></script>
    <script>
        const socket = io();
        const messagesDiv = document.getElementById('messages');
        const messageInput = document.getElementById('messageInput');

        function addMessage(message, isUser) {
            const messageDiv = document.createElement('div');
            messageDiv.className = `message ${isUser ? 'user-message' : 'bot-message'}`;
            messageDiv.innerHTML = `<div class="message-bubble ${isUser ? 'user-bubble' : 'bot-bubble'}">${message}</div>`;
            messagesDiv.appendChild(messageDiv);
            messagesDiv.scrollTop = messagesDiv.scrollHeight;
        }

        function sendMessage() {
            const message = messageInput.value.trim();
            if (message) {
                addMessage(message, true);
                socket.emit('chat_message', {
                    message: message,
                    user_id: 'demo_user',
                    session_id: 'demo_session'
                });
                messageInput.value = '';
            }
        }

        function handleKeyPress(event) {
            if (event.key === 'Enter') {
                sendMessage();
            }
        }

        socket.on('bot_response', function(data) {
            addMessage(data.response, false);
        });
    </script>
</body>
</html>
    ''')

@app.route('/api/chat', methods=['POST'])
def chat_api():
    data = request.get_json()
    message = data.get('message', '')
    user_id = data.get('user_id', 'anonymous')
    session_id = data.get('session_id', 'default')
    
    if not message:
        return jsonify({'error': 'Message is required'}), 400
    
    response = chatbot.generate_response(message, user_id, session_id)
    return jsonify(response)

@app.route('/api/conversations/<user_id>')
def get_conversations(user_id):
    conn = sqlite3.connect('chatbot.db')
    cursor = conn.cursor()
    cursor.execute('''
        SELECT message, response, sentiment, timestamp 
        FROM conversations 
        WHERE user_id = ? 
        ORDER BY timestamp DESC 
        LIMIT 50
    ''', (user_id,))
    
    conversations = []
    for row in cursor.fetchall():
        conversations.append({
            'message': row[0],
            'response': row[1],
            'sentiment': row[2],
            'timestamp': row[3]
        })
    
    conn.close()
    return jsonify(conversations)

@app.route('/api/analytics')
def get_analytics():
    conn = sqlite3.connect('chatbot.db')
    cursor = conn.cursor()
    
    # Total conversations
    cursor.execute('SELECT COUNT(*) FROM conversations')
    total_conversations = cursor.fetchone()[0]
    
    # Average sentiment
    cursor.execute('SELECT AVG(sentiment) FROM conversations')
    avg_sentiment = cursor.fetchone()[0] or 0
    
    # Conversations today
    cursor.execute('''
        SELECT COUNT(*) FROM conversations 
        WHERE date(timestamp) = date('now')
    ''')
    conversations_today = cursor.fetchone()[0]
    
    conn.close()
    
    return jsonify({
        'total_conversations': total_conversations,
        'average_sentiment': round(avg_sentiment, 3),
        'conversations_today': conversations_today,
        'status': 'active'
    })

@socketio.on('chat_message')
def handle_chat_message(data):
    message = data.get('message', '')
    user_id = data.get('user_id', 'anonymous')
    session_id = data.get('session_id', 'default')
    
    response = chatbot.generate_response(message, user_id, session_id)
    emit('bot_response', response)

if __name__ == '__main__':
    socketio.run(app, debug=True, host='0.0.0.0', port=5000)

