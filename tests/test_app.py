import unittest
import os
import sqlite3
from unittest.mock import patch
import sys
import os
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
from src.app import ChatbotEngine

class TestChatbotEngine(unittest.TestCase):

    def setUp(self):
        # Configurar um banco de dados temporário para testes
        self.db_path = 'test_chatbot.db'
        if os.path.exists(self.db_path):
            os.remove(self.db_path)
        self.chatbot = ChatbotEngine()
        self.chatbot.db_path = self.db_path # Usar o db de teste
        self.chatbot.init_database()

    def tearDown(self):
        # Remover o banco de dados temporário após os testes
        if os.path.exists(self.db_path):
            os.remove(self.db_path)

    def test_init_database(self):
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        cursor.execute("SELECT name FROM sqlite_master WHERE type=\'table\' AND name=\'conversations\'")
        self.assertIsNotNone(cursor.fetchone())
        conn.close()

    def test_analyze_sentiment(self):
        self.assertGreater(self.chatbot.analyze_sentiment("I love this!"), 0)
        self.assertLess(self.chatbot.analyze_sentiment("I hate this!"), 0)
        self.assertEqual(self.chatbot.analyze_sentiment("This is neutral."), 0)

    def test_detect_intent(self):
        self.assertEqual(self.chatbot.detect_intent("Hello there!"), "greeting")
        self.assertEqual(self.chatbot.detect_intent("Goodbye for now."), "goodbye")
        self.assertEqual(self.chatbot.detect_intent("What is the weather like?"), "default")

    @patch('src.app.random.choice', return_value="Test response")
    def test_generate_response(self, mock_random_choice):
        response = self.chatbot.generate_response("Hi", "test_user", "test_session")
        self.assertIn("response", response)
        self.assertEqual(response["response"], "Test response")
        self.assertEqual(response["intent"], "greeting")
        self.assertIn("sentiment", response)
        self.assertIn("confidence", response)
        self.assertIn("timestamp", response)

        # Verificar se a conversa foi armazenada
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        cursor.execute("SELECT message, response FROM conversations WHERE user_id = ?", ("test_user",))
        stored_conversation = cursor.fetchone()
        self.assertIsNotNone(stored_conversation)
        self.assertEqual(stored_conversation[0], "Hi")
        self.assertEqual(stored_conversation[1], "Test response")
        conn.close()

    def test_store_conversation(self):
        self.chatbot.store_conversation("user1", "session1", "Test message", "Test response", 0.5)
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        cursor.execute("SELECT message, response, sentiment FROM conversations WHERE user_id = ?", ("user1",))
        stored_conversation = cursor.fetchone()
        self.assertIsNotNone(stored_conversation)
        self.assertEqual(stored_conversation[0], "Test message")
        self.assertEqual(stored_conversation[1], "Test response")
        self.assertEqual(stored_conversation[2], 0.5)
        conn.close()

if __name__ == '__main__':
    unittest.main()

