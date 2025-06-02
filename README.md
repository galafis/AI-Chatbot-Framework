# AI Chatbot Framework

## English

### Overview
Advanced AI Chatbot Framework with comprehensive natural language processing, sentiment analysis, and real-time messaging capabilities. Features a modern web interface built with HTML5, CSS3, and JavaScript for seamless chatbot interactions and analytics.

### Author
**Gabriel Demetrios Lafis**
- Email: gabrieldemetrios@gmail.com
- LinkedIn: [Gabriel Demetrios Lafis](https://www.linkedin.com/in/gabriel-demetrios-lafis-62197711b)
- GitHub: [galafis](https://github.com/galafis)

### Technologies Used
- **Backend**: Python, Flask, SQLite, NLTK, TextBlob
- **Frontend**: HTML5, CSS3, JavaScript (ES6+), WebSocket API
- **Natural Language Processing**: NLTK, TextBlob, spaCy
- **Machine Learning**: scikit-learn, TensorFlow (optional)
- **Real-time Communication**: WebSocket, Server-Sent Events
- **Web Technologies**: Speech Recognition API, File API, Canvas API
- **Styling**: CSS Grid, Flexbox, CSS Animations, Custom Properties
- **Data Storage**: SQLite, LocalStorage, IndexedDB

### Features

#### Core Chatbot Capabilities
- **Natural Language Understanding**: Advanced text processing and intent recognition
- **Sentiment Analysis**: Real-time emotion detection and mood tracking
- **Context Awareness**: Conversation history and context maintenance
- **Multi-personality Support**: Friendly, Professional, Casual, Technical modes
- **Response Customization**: Adjustable response speed and creativity levels

#### Advanced AI Features
- **Multiple AI Models**: GPT-3.5, GPT-4, Claude, Custom model support
- **Temperature Control**: Creativity and randomness adjustment (0.0 - 1.0)
- **Token Management**: Configurable response length limits
- **Conversation Analytics**: Message count, response time, sentiment tracking
- **Learning Capabilities**: Adaptive responses based on user interactions

#### Web Interface
- **Modern Chat UI**: WhatsApp-style interface with message bubbles
- **Real-time Messaging**: Instant message delivery with typing indicators
- **Voice Input**: Speech-to-text integration for hands-free interaction
- **File Sharing**: Drag & drop file upload with multiple format support
- **Emoji Support**: Integrated emoji picker and reactions
- **Export Options**: JSON, CSV, HTML report generation

#### Analytics Dashboard
- **Conversation Metrics**: Message count, session duration, response times
- **Sentiment Tracking**: Real-time sentiment analysis with trend charts
- **Performance Monitoring**: Response time analytics and system metrics
- **User Insights**: Conversation patterns and engagement analysis
- **Visual Charts**: Interactive charts using Canvas API

#### Customization Features
- **Theme Support**: Light/dark mode with custom color schemes
- **Personality Settings**: Adjustable bot personality and response style
- **Notification Controls**: Sound notifications and visual alerts
- **Keyboard Shortcuts**: Productivity shortcuts for power users
- **Multi-language Support**: Internationalization ready

### Installation

```bash
# Clone the repository
git clone https://github.com/galafis/AI-Chatbot-Framework.git
cd AI-Chatbot-Framework

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Initialize database
python init_db.py

# Run the application
python app.py
```

### Web Interface Usage

1. **Start the Application**
   ```bash
   python app.py
   # Open http://localhost:5000 in your browser
   ```

2. **Basic Chat Interaction**
   - Type messages in the input field
   - Press Enter or click Send button
   - Use Shift+Enter for new lines
   - View conversation history in sidebar

3. **Voice Input**
   - Click microphone button to start voice input
   - Speak clearly and wait for transcription
   - Voice input automatically sends message

4. **File Sharing**
   - Click paperclip icon or drag files to chat
   - Supported formats: TXT, PDF, DOC, DOCX, images
   - Files are processed and analyzed by AI

5. **Settings Configuration**
   - Access settings via gear icon
   - Adjust bot personality and response speed
   - Configure notifications and features
   - Save settings for future sessions

6. **Analytics Monitoring**
   - View real-time conversation metrics
   - Monitor sentiment trends
   - Export analytics data
   - Generate comprehensive reports

### API Endpoints

```python
# Send Message
POST /api/chat
{
    "message": "Hello, how are you?",
    "chat_id": "chat_123",
    "settings": {
        "personality": "friendly",
        "temperature": 0.7
    }
}

# Get Chat History
GET /api/chat/{chat_id}/history

# Analyze Sentiment
POST /api/sentiment
{
    "text": "I'm feeling great today!"
}

# Export Chat
GET /api/chat/{chat_id}/export?format=json
```

### Configuration

```python
# config.py
CHATBOT_CONFIG = {
    'default_personality': 'friendly',
    'max_response_length': 500,
    'enable_sentiment_analysis': True,
    'enable_voice_input': True,
    'supported_languages': ['en', 'pt', 'es', 'fr']
}

AI_MODELS = {
    'gpt-3.5': {
        'api_key': 'your_openai_key',
        'max_tokens': 150,
        'temperature': 0.7
    },
    'custom': {
        'model_path': 'models/custom_chatbot.pkl',
        'tokenizer_path': 'models/tokenizer.pkl'
    }
}
```

### Keyboard Shortcuts
- **Ctrl+K**: Clear current chat
- **Ctrl+N**: Start new chat
- **Ctrl+/**: Focus message input
- **Ctrl+E**: Export current chat
- **Ctrl+S**: Save settings
- **Enter**: Send message
- **Shift+Enter**: New line

### Performance Features
- **Real-time Processing**: Sub-second response times
- **Concurrent Users**: Support for multiple simultaneous chats
- **Memory Optimization**: Efficient conversation history management
- **Caching**: Intelligent response caching for common queries
- **Scalability**: Horizontal scaling support with load balancing

---

## Português

### Visão Geral
Framework Avançado de Chatbot IA com processamento abrangente de linguagem natural, análise de sentimentos e capacidades de mensagens em tempo real. Apresenta uma interface web moderna construída com HTML5, CSS3 e JavaScript para interações perfeitas com chatbot e análises.

### Autor
**Gabriel Demetrios Lafis**
- Email: gabrieldemetrios@gmail.com
- LinkedIn: [Gabriel Demetrios Lafis](https://www.linkedin.com/in/gabriel-demetrios-lafis-62197711b)
- GitHub: [galafis](https://github.com/galafis)

### Tecnologias Utilizadas
- **Backend**: Python, Flask, SQLite, NLTK, TextBlob
- **Frontend**: HTML5, CSS3, JavaScript (ES6+), WebSocket API
- **Processamento de Linguagem Natural**: NLTK, TextBlob, spaCy
- **Aprendizado de Máquina**: scikit-learn, TensorFlow (opcional)
- **Comunicação em Tempo Real**: WebSocket, Server-Sent Events
- **Tecnologias Web**: Speech Recognition API, File API, Canvas API
- **Estilização**: CSS Grid, Flexbox, Animações CSS, Propriedades Customizadas
- **Armazenamento de Dados**: SQLite, LocalStorage, IndexedDB

### Funcionalidades

#### Capacidades Principais do Chatbot
- **Compreensão de Linguagem Natural**: Processamento avançado de texto e reconhecimento de intenções
- **Análise de Sentimentos**: Detecção de emoções em tempo real e rastreamento de humor
- **Consciência de Contexto**: Histórico de conversas e manutenção de contexto
- **Suporte Multi-personalidade**: Modos Amigável, Profissional, Casual, Técnico
- **Personalização de Respostas**: Velocidade de resposta e níveis de criatividade ajustáveis

#### Recursos Avançados de IA
- **Múltiplos Modelos de IA**: Suporte para GPT-3.5, GPT-4, Claude, modelos customizados
- **Controle de Temperatura**: Ajuste de criatividade e aleatoriedade (0.0 - 1.0)
- **Gerenciamento de Tokens**: Limites configuráveis de comprimento de resposta
- **Análises de Conversação**: Contagem de mensagens, tempo de resposta, rastreamento de sentimentos
- **Capacidades de Aprendizado**: Respostas adaptativas baseadas em interações do usuário

#### Interface Web
- **UI de Chat Moderna**: Interface estilo WhatsApp com bolhas de mensagem
- **Mensagens em Tempo Real**: Entrega instantânea de mensagens com indicadores de digitação
- **Entrada de Voz**: Integração de fala para texto para interação mãos-livres
- **Compartilhamento de Arquivos**: Upload de arquivos arrastar e soltar com suporte a múltiplos formatos
- **Suporte a Emoji**: Seletor de emoji integrado e reações
- **Opções de Exportação**: Geração de relatórios JSON, CSV, HTML

### Instalação

```bash
# Clonar o repositório
git clone https://github.com/galafis/AI-Chatbot-Framework.git
cd AI-Chatbot-Framework

# Criar ambiente virtual
python -m venv venv
source venv/bin/activate  # No Windows: venv\Scripts\activate

# Instalar dependências
pip install -r requirements.txt

# Inicializar banco de dados
python init_db.py

# Executar a aplicação
python app.py
```

### Uso da Interface Web

1. **Iniciar a Aplicação**
   ```bash
   python app.py
   # Abrir http://localhost:5000 no navegador
   ```

2. **Interação Básica de Chat**
   - Digite mensagens no campo de entrada
   - Pressione Enter ou clique no botão Enviar
   - Use Shift+Enter para novas linhas
   - Visualize o histórico de conversas na barra lateral

### Atalhos de Teclado
- **Ctrl+K**: Limpar chat atual
- **Ctrl+N**: Iniciar novo chat
- **Ctrl+/**: Focar entrada de mensagem
- **Ctrl+E**: Exportar chat atual
- **Ctrl+S**: Salvar configurações
- **Enter**: Enviar mensagem
- **Shift+Enter**: Nova linha

### Recursos de Performance
- **Processamento em Tempo Real**: Tempos de resposta sub-segundo
- **Usuários Concorrentes**: Suporte para múltiplos chats simultâneos
- **Otimização de Memória**: Gerenciamento eficiente do histórico de conversas
- **Cache**: Cache inteligente de respostas para consultas comuns
- **Escalabilidade**: Suporte a escalonamento horizontal com balanceamento de carga

### Licença
MIT License

### Contribuições
Contribuições são bem-vindas! Por favor, abra uma issue ou envie um pull request.

### Contato
Para dúvidas ou suporte, entre em contato através do email ou LinkedIn mencionados acima.

