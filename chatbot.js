/**
 * AI Chatbot Framework - Advanced JavaScript
 * Author: Gabriel Demetrios Lafis
 * Advanced chatbot interface with real-time messaging and AI integration
 */

class ChatbotFramework {
    constructor() {
        this.currentChatId = null;
        this.chats = new Map();
        this.settings = {
            personality: 'friendly',
            responseSpeed: 3,
            enableSentiment: true,
            enableTyping: true,
            enableSound: true,
            maxTokens: 150,
            modelType: 'gpt-3.5',
            temperature: 0.7
        };
        this.analytics = {
            messageCount: 0,
            sessionStart: Date.now(),
            sentimentHistory: [],
            responseTimeHistory: []
        };
        this.isTyping = false;
        this.websocket = null;
        
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.setupWebSocket();
        this.loadSettings();
        this.createNewChat();
        this.startAnalyticsTimer();
        this.setupKeyboardShortcuts();
        this.initializeSpeechRecognition();
    }

    setupEventListeners() {
        // Message input and sending
        const messageInput = document.getElementById('messageInput');
        const sendBtn = document.getElementById('sendBtn');
        
        messageInput.addEventListener('input', (e) => this.handleInputChange(e));
        messageInput.addEventListener('keydown', (e) => this.handleKeyDown(e));
        sendBtn.addEventListener('click', () => this.sendMessage());

        // Character count
        messageInput.addEventListener('input', () => {
            const charCount = document.getElementById('charCount');
            charCount.textContent = `${messageInput.value.length}/2000`;
        });

        // Feature buttons
        document.getElementById('voiceBtn').addEventListener('click', () => this.toggleVoiceInput());
        document.getElementById('emojiBtn').addEventListener('click', () => this.showEmojiPicker());
        document.getElementById('attachBtn').addEventListener('click', () => this.showFileModal());

        // Header buttons
        document.getElementById('newChatBtn').addEventListener('click', () => this.createNewChat());
        document.getElementById('settingsBtn').addEventListener('click', () => this.showSettingsModal());

        // Chat actions
        document.getElementById('exportChatBtn').addEventListener('click', () => this.exportChat());
        document.getElementById('clearChatBtn').addEventListener('click', () => this.clearCurrentChat());
        document.getElementById('clearHistoryBtn').addEventListener('click', () => this.clearAllChats());

        // Tab navigation
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.switchTab(e.target.dataset.tab));
        });

        // Settings
        document.getElementById('saveSettingsBtn').addEventListener('click', () => this.saveSettings());
        document.getElementById('responseSpeed').addEventListener('input', (e) => {
            const speedLabels = ['Very Slow', 'Slow', 'Normal', 'Fast', 'Very Fast'];
            document.getElementById('speedValue').textContent = speedLabels[e.target.value - 1];
        });

        // Modal controls
        document.getElementById('closeSettingsModal').addEventListener('click', () => this.hideModal('settingsModal'));
        document.getElementById('closeFileModal').addEventListener('click', () => this.hideModal('fileModal'));
        document.getElementById('cancelSettings').addEventListener('click', () => this.hideModal('settingsModal'));
        document.getElementById('applySettings').addEventListener('click', () => this.applyAdvancedSettings());

        // Temperature slider
        document.getElementById('temperature').addEventListener('input', (e) => {
            document.getElementById('tempValue').textContent = e.target.value;
        });

        // File upload
        const fileInput = document.getElementById('fileInput');
        const uploadArea = document.getElementById('uploadArea');
        
        fileInput.addEventListener('change', (e) => this.handleFileUpload(e));
        uploadArea.addEventListener('click', () => fileInput.click());
        uploadArea.addEventListener('dragover', (e) => this.handleDragOver(e));
        uploadArea.addEventListener('drop', (e) => this.handleFileDrop(e));
    }

    setupWebSocket() {
        // Simulate WebSocket connection for real-time features
        console.log('WebSocket connection established');
        
        // Simulate periodic updates
        setInterval(() => {
            this.updateOnlineStatus();
        }, 30000);
    }

    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey || e.metaKey) {
                switch (e.key) {
                    case 'k':
                        e.preventDefault();
                        this.clearCurrentChat();
                        break;
                    case 'n':
                        e.preventDefault();
                        this.createNewChat();
                        break;
                    case '/':
                        e.preventDefault();
                        document.getElementById('messageInput').focus();
                        break;
                }
            }
        });
    }

    initializeSpeechRecognition() {
        if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            this.speechRecognition = new SpeechRecognition();
            this.speechRecognition.continuous = false;
            this.speechRecognition.interimResults = false;
            this.speechRecognition.lang = 'en-US';

            this.speechRecognition.onresult = (event) => {
                const transcript = event.results[0][0].transcript;
                document.getElementById('messageInput').value = transcript;
                this.sendMessage();
            };

            this.speechRecognition.onerror = (event) => {
                console.error('Speech recognition error:', event.error);
                this.showNotification('Speech recognition failed', 'error');
            };
        }
    }

    handleInputChange(e) {
        const input = e.target;
        
        // Auto-resize textarea
        input.style.height = 'auto';
        input.style.height = Math.min(input.scrollHeight, 150) + 'px';
        
        // Show typing indicator to other users (simulated)
        if (input.value.length > 0 && !this.isTyping) {
            this.isTyping = true;
            this.showTypingIndicator();
        } else if (input.value.length === 0 && this.isTyping) {
            this.isTyping = false;
            this.hideTypingIndicator();
        }
    }

    handleKeyDown(e) {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            this.sendMessage();
        }
    }

    async sendMessage() {
        const messageInput = document.getElementById('messageInput');
        const message = messageInput.value.trim();
        
        if (!message) return;

        // Add user message to chat
        this.addMessage('user', message);
        messageInput.value = '';
        messageInput.style.height = 'auto';
        
        // Update analytics
        this.analytics.messageCount++;
        this.updateAnalytics();
        
        // Show typing indicator
        this.showBotTyping();
        
        // Simulate AI processing delay
        const delay = this.getResponseDelay();
        
        setTimeout(async () => {
            const response = await this.generateAIResponse(message);
            this.hideBotTyping();
            this.addMessage('bot', response);
            
            // Analyze sentiment
            if (this.settings.enableSentiment) {
                this.analyzeSentiment(message);
            }
            
            // Play notification sound
            if (this.settings.enableSound) {
                this.playNotificationSound();
            }
            
            // Update analytics
            this.analytics.responseTimeHistory.push(delay);
            this.updateAnalytics();
            
        }, delay);
    }

    addMessage(sender, content, timestamp = new Date()) {
        const messagesContainer = document.getElementById('chatMessages');
        const messageElement = this.createMessageElement(sender, content, timestamp);
        
        // Remove welcome message if it exists
        const welcomeMessage = messagesContainer.querySelector('.welcome-message');
        if (welcomeMessage && this.analytics.messageCount > 0) {
            welcomeMessage.remove();
        }
        
        messagesContainer.appendChild(messageElement);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
        
        // Store message in current chat
        if (this.currentChatId) {
            const chat = this.chats.get(this.currentChatId);
            if (chat) {
                chat.messages.push({ sender, content, timestamp });
                this.updateChatPreview(this.currentChatId);
            }
        }
    }

    createMessageElement(sender, content, timestamp) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `${sender}-message`;
        
        const avatar = document.createElement('div');
        avatar.className = 'message-avatar';
        avatar.innerHTML = sender === 'user' ? '<i class="fas fa-user"></i>' : '<i class="fas fa-robot"></i>';
        
        const messageContent = document.createElement('div');
        messageContent.className = 'message-content';
        
        const bubble = document.createElement('div');
        bubble.className = 'message-bubble';
        
        const text = document.createElement('p');
        text.textContent = content;
        bubble.appendChild(text);
        
        // Add features for bot messages
        if (sender === 'bot') {
            const features = this.extractMessageFeatures(content);
            if (features.length > 0) {
                const featuresDiv = document.createElement('div');
                featuresDiv.className = 'message-features';
                features.forEach(feature => {
                    const tag = document.createElement('span');
                    tag.className = 'feature-tag';
                    tag.textContent = feature;
                    featuresDiv.appendChild(tag);
                });
                bubble.appendChild(featuresDiv);
            }
        }
        
        const timeDiv = document.createElement('div');
        timeDiv.className = 'message-time';
        timeDiv.textContent = this.formatTime(timestamp);
        
        messageContent.appendChild(bubble);
        messageContent.appendChild(timeDiv);
        
        messageDiv.appendChild(avatar);
        messageDiv.appendChild(messageContent);
        
        return messageDiv;
    }

    extractMessageFeatures(content) {
        const features = [];
        
        if (content.includes('?')) features.push('Question Answering');
        if (content.match(/\b(analyze|analysis)\b/i)) features.push('Analysis');
        if (content.match(/\b(recommend|suggestion)\b/i)) features.push('Recommendations');
        if (content.match(/\b(code|programming)\b/i)) features.push('Code Assistance');
        if (content.length > 200) features.push('Detailed Response');
        
        return features;
    }

    async generateAIResponse(message) {
        // Simulate AI response generation based on settings
        const responses = this.getResponseTemplates();
        const personality = this.settings.personality;
        
        // Simple keyword-based response selection
        let response = responses[personality].default;
        
        if (message.toLowerCase().includes('hello') || message.toLowerCase().includes('hi')) {
            response = responses[personality].greeting;
        } else if (message.toLowerCase().includes('help')) {
            response = responses[personality].help;
        } else if (message.toLowerCase().includes('code')) {
            response = responses[personality].code;
        } else if (message.toLowerCase().includes('thank')) {
            response = responses[personality].thanks;
        }
        
        // Add some randomization
        const variations = responses[personality].variations || [];
        if (variations.length > 0 && Math.random() > 0.7) {
            response = variations[Math.floor(Math.random() * variations.length)];
        }
        
        return response;
    }

    getResponseTemplates() {
        return {
            friendly: {
                greeting: "Hello there! 😊 I'm excited to help you today. What can I assist you with?",
                help: "I'd be happy to help! I can assist with various tasks like answering questions, providing explanations, helping with code, and much more. What specific area would you like help with?",
                code: "I love helping with code! Whether you need debugging assistance, code reviews, or learning new programming concepts, I'm here to help. What programming challenge are you working on?",
                thanks: "You're very welcome! 😊 I'm always here to help whenever you need assistance. Is there anything else I can do for you?",
                default: "That's an interesting point! Let me think about that and provide you with a helpful response. Based on what you've shared, I'd suggest...",
                variations: [
                    "Great question! Let me break this down for you...",
                    "I understand what you're looking for. Here's my take on it...",
                    "That's a fascinating topic! From my perspective..."
                ]
            },
            professional: {
                greeting: "Good day. I am ready to assist you with your inquiries. How may I be of service?",
                help: "I am equipped to provide assistance across multiple domains. Please specify the nature of your request for optimal support.",
                code: "I can provide comprehensive programming assistance including code analysis, optimization, and best practices. What is your specific technical requirement?",
                thanks: "You are welcome. I am available for further assistance as needed.",
                default: "I have analyzed your request. Based on the information provided, I recommend the following approach...",
                variations: [
                    "After careful consideration, I suggest...",
                    "The optimal solution would be...",
                    "Based on best practices, I recommend..."
                ]
            },
            casual: {
                greeting: "Hey! What's up? Ready to tackle some problems together? 🚀",
                help: "Sure thing! I'm pretty good at helping out with all sorts of stuff. What do you need a hand with?",
                code: "Oh, coding stuff! Cool! I'm pretty handy with that. What language are we working with today?",
                thanks: "No worries at all! Happy to help anytime! 👍",
                default: "Hmm, interesting! So here's what I'm thinking...",
                variations: [
                    "Oh, that's easy! Here's the deal...",
                    "I got you covered! Check this out...",
                    "Alright, let's figure this out together..."
                ]
            },
            technical: {
                greeting: "System initialized. Ready for technical consultation. Please specify your requirements.",
                help: "Technical support module activated. I can assist with system analysis, troubleshooting, and implementation guidance.",
                code: "Code analysis module ready. Please provide your code snippet or technical specifications for review.",
                thanks: "Acknowledgment received. System remains available for additional technical queries.",
                default: "Processing request... Analysis complete. Technical recommendation follows...",
                variations: [
                    "System analysis indicates...",
                    "Technical evaluation suggests...",
                    "Diagnostic results show..."
                ]
            }
        };
    }

    getResponseDelay() {
        const baseDelay = 1000;
        const speedMultiplier = (6 - this.settings.responseSpeed) * 0.5;
        return baseDelay * speedMultiplier;
    }

    showBotTyping() {
        if (!this.settings.enableTyping) return;
        
        const typingIndicator = document.getElementById('typingIndicator');
        typingIndicator.style.display = 'flex';
    }

    hideBotTyping() {
        const typingIndicator = document.getElementById('typingIndicator');
        typingIndicator.style.display = 'none';
    }

    analyzeSentiment(message) {
        // Simple sentiment analysis
        const positiveWords = ['good', 'great', 'excellent', 'amazing', 'wonderful', 'fantastic', 'love', 'like', 'happy', 'pleased'];
        const negativeWords = ['bad', 'terrible', 'awful', 'hate', 'dislike', 'angry', 'frustrated', 'disappointed', 'sad'];
        
        const words = message.toLowerCase().split(/\s+/);
        let score = 0;
        
        words.forEach(word => {
            if (positiveWords.includes(word)) score += 1;
            if (negativeWords.includes(word)) score -= 1;
        });
        
        let sentiment = 'Neutral';
        if (score > 0) sentiment = 'Positive';
        if (score < 0) sentiment = 'Negative';
        
        this.analytics.sentimentHistory.push({ timestamp: Date.now(), sentiment, score });
        
        // Update sentiment display
        document.getElementById('sentimentScore').textContent = sentiment;
        
        return sentiment;
    }

    createNewChat() {
        const chatId = 'chat_' + Date.now();
        const chat = {
            id: chatId,
            title: 'New Conversation',
            messages: [],
            createdAt: new Date(),
            lastActivity: new Date()
        };
        
        this.chats.set(chatId, chat);
        this.currentChatId = chatId;
        
        // Clear current messages
        const messagesContainer = document.getElementById('chatMessages');
        messagesContainer.innerHTML = `
            <div class="welcome-message">
                <div class="bot-message">
                    <div class="message-avatar">
                        <i class="fas fa-robot"></i>
                    </div>
                    <div class="message-content">
                        <div class="message-bubble">
                            <p>Hello! I'm your AI assistant. How can I help you today?</p>
                            <div class="message-features">
                                <span class="feature-tag">Natural Language Processing</span>
                                <span class="feature-tag">Sentiment Analysis</span>
                                <span class="feature-tag">Context Awareness</span>
                            </div>
                        </div>
                        <div class="message-time">Just now</div>
                    </div>
                </div>
            </div>
        `;
        
        this.updateChatList();
        this.resetAnalytics();
    }

    updateChatList() {
        const chatList = document.getElementById('chatList');
        chatList.innerHTML = '';
        
        Array.from(this.chats.values())
            .sort((a, b) => b.lastActivity - a.lastActivity)
            .forEach(chat => {
                const chatElement = this.createChatListItem(chat);
                chatList.appendChild(chatElement);
            });
    }

    createChatListItem(chat) {
        const chatDiv = document.createElement('div');
        chatDiv.className = 'chat-item';
        if (chat.id === this.currentChatId) {
            chatDiv.classList.add('active');
        }
        
        const lastMessage = chat.messages[chat.messages.length - 1];
        const preview = lastMessage ? lastMessage.content.substring(0, 50) + '...' : 'No messages yet';
        
        chatDiv.innerHTML = `
            <div class="chat-title">${chat.title}</div>
            <div class="chat-preview">${preview}</div>
            <div class="chat-time">${this.formatTime(chat.lastActivity)}</div>
        `;
        
        chatDiv.addEventListener('click', () => this.switchToChat(chat.id));
        
        return chatDiv;
    }

    switchToChat(chatId) {
        this.currentChatId = chatId;
        const chat = this.chats.get(chatId);
        
        if (chat) {
            // Load chat messages
            const messagesContainer = document.getElementById('chatMessages');
            messagesContainer.innerHTML = '';
            
            chat.messages.forEach(msg => {
                const messageElement = this.createMessageElement(msg.sender, msg.content, msg.timestamp);
                messagesContainer.appendChild(messageElement);
            });
            
            if (chat.messages.length === 0) {
                messagesContainer.innerHTML = `
                    <div class="welcome-message">
                        <div class="bot-message">
                            <div class="message-avatar">
                                <i class="fas fa-robot"></i>
                            </div>
                            <div class="message-content">
                                <div class="message-bubble">
                                    <p>Hello! I'm your AI assistant. How can I help you today?</p>
                                </div>
                                <div class="message-time">Just now</div>
                            </div>
                        </div>
                    </div>
                `;
            }
            
            messagesContainer.scrollTop = messagesContainer.scrollHeight;
            this.updateChatList();
        }
    }

    updateChatPreview(chatId) {
        const chat = this.chats.get(chatId);
        if (chat && chat.messages.length > 0) {
            const lastMessage = chat.messages[chat.messages.length - 1];
            chat.title = lastMessage.content.substring(0, 30) + (lastMessage.content.length > 30 ? '...' : '');
            chat.lastActivity = new Date();
            this.updateChatList();
        }
    }

    clearCurrentChat() {
        if (this.currentChatId) {
            const chat = this.chats.get(this.currentChatId);
            if (chat) {
                chat.messages = [];
                this.switchToChat(this.currentChatId);
                this.resetAnalytics();
            }
        }
    }

    clearAllChats() {
        if (confirm('Are you sure you want to clear all chat history?')) {
            this.chats.clear();
            this.createNewChat();
        }
    }

    exportChat() {
        if (!this.currentChatId) return;
        
        const chat = this.chats.get(this.currentChatId);
        if (!chat) return;
        
        const exportData = {
            title: chat.title,
            createdAt: chat.createdAt,
            messages: chat.messages,
            analytics: this.analytics
        };
        
        const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `chat_export_${chat.id}.json`;
        a.click();
        URL.revokeObjectURL(url);
        
        this.showNotification('Chat exported successfully', 'success');
    }

    toggleVoiceInput() {
        if (this.speechRecognition) {
            const voiceBtn = document.getElementById('voiceBtn');
            
            if (voiceBtn.classList.contains('active')) {
                this.speechRecognition.stop();
                voiceBtn.classList.remove('active');
            } else {
                this.speechRecognition.start();
                voiceBtn.classList.add('active');
                this.showNotification('Listening... Speak now', 'info');
            }
        } else {
            this.showNotification('Speech recognition not supported', 'error');
        }
    }

    showEmojiPicker() {
        // Simple emoji insertion
        const emojis = ['😊', '😂', '🤔', '👍', '❤️', '🎉', '🚀', '💡', '🔥', '✨'];
        const messageInput = document.getElementById('messageInput');
        const randomEmoji = emojis[Math.floor(Math.random() * emojis.length)];
        messageInput.value += randomEmoji;
        messageInput.focus();
    }

    showFileModal() {
        document.getElementById('fileModal').style.display = 'flex';
    }

    hideModal(modalId) {
        document.getElementById(modalId).style.display = 'none';
    }

    showSettingsModal() {
        document.getElementById('settingsModal').style.display = 'flex';
    }

    handleFileUpload(e) {
        const files = Array.from(e.target.files);
        this.processFiles(files);
    }

    handleDragOver(e) {
        e.preventDefault();
        e.stopPropagation();
    }

    handleFileDrop(e) {
        e.preventDefault();
        e.stopPropagation();
        
        const files = Array.from(e.dataTransfer.files);
        this.processFiles(files);
    }

    processFiles(files) {
        const fileList = document.getElementById('fileList');
        fileList.innerHTML = '';
        
        files.forEach(file => {
            const fileItem = document.createElement('div');
            fileItem.className = 'file-item';
            fileItem.innerHTML = `
                <i class="fas fa-file"></i>
                <span>${file.name}</span>
                <span>${this.formatFileSize(file.size)}</span>
            `;
            fileList.appendChild(fileItem);
        });
        
        this.showNotification(`${files.length} file(s) ready to upload`, 'success');
    }

    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    switchTab(tabName) {
        // Remove active class from all tabs and contents
        document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
        document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
        
        // Add active class to selected tab and content
        document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');
        document.getElementById(tabName).classList.add('active');
        
        // Update content based on tab
        if (tabName === 'analytics') {
            this.updateAnalytics();
        }
    }

    updateAnalytics() {
        // Update message count
        document.getElementById('messageCount').textContent = this.analytics.messageCount;
        
        // Update session duration
        const duration = Math.floor((Date.now() - this.analytics.sessionStart) / 60000);
        document.getElementById('sessionDuration').textContent = `${duration}m`;
        
        // Update average response time
        if (this.analytics.responseTimeHistory.length > 0) {
            const avgTime = this.analytics.responseTimeHistory.reduce((a, b) => a + b, 0) / this.analytics.responseTimeHistory.length;
            document.getElementById('avgResponseTime').textContent = `${(avgTime / 1000).toFixed(1)}s`;
        }
        
        // Update sentiment chart
        this.updateSentimentChart();
        
        // Update insights
        this.updateInsights();
    }

    updateSentimentChart() {
        const canvas = document.getElementById('sentimentChart');
        const ctx = canvas.getContext('2d');
        
        canvas.width = 300;
        canvas.height = 150;
        
        // Clear canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        if (this.analytics.sentimentHistory.length === 0) {
            ctx.fillStyle = '#666';
            ctx.font = '14px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('No sentiment data yet', canvas.width / 2, canvas.height / 2);
            return;
        }
        
        // Draw sentiment trend
        const data = this.analytics.sentimentHistory.slice(-10); // Last 10 points
        const width = canvas.width - 40;
        const height = canvas.height - 40;
        const stepX = width / (data.length - 1 || 1);
        
        ctx.strokeStyle = '#667eea';
        ctx.lineWidth = 2;
        ctx.beginPath();
        
        data.forEach((point, index) => {
            const x = 20 + index * stepX;
            const y = 20 + height / 2 - (point.score * height / 4);
            
            if (index === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
        });
        
        ctx.stroke();
    }

    updateInsights() {
        const insightList = document.getElementById('insightList');
        const insights = this.generateInsights();
        
        insightList.innerHTML = insights.map(insight => `
            <div class="insight-item">
                <i class="fas fa-lightbulb"></i>
                <span>${insight}</span>
            </div>
        `).join('');
    }

    generateInsights() {
        const insights = [];
        
        if (this.analytics.messageCount > 10) {
            insights.push('Active conversation detected');
        }
        
        if (this.analytics.sentimentHistory.length > 0) {
            const recentSentiment = this.analytics.sentimentHistory.slice(-3);
            const avgSentiment = recentSentiment.reduce((a, b) => a + b.score, 0) / recentSentiment.length;
            
            if (avgSentiment > 0) {
                insights.push('Conversation tone is positive');
            } else if (avgSentiment < 0) {
                insights.push('Consider adjusting response style');
            }
        }
        
        const sessionDuration = (Date.now() - this.analytics.sessionStart) / 60000;
        if (sessionDuration > 30) {
            insights.push('Extended session - user is engaged');
        }
        
        if (insights.length === 0) {
            insights.push('Continue chatting to generate insights');
        }
        
        return insights;
    }

    saveSettings() {
        // Get settings from form
        this.settings.personality = document.getElementById('botPersonality').value;
        this.settings.responseSpeed = parseInt(document.getElementById('responseSpeed').value);
        this.settings.enableSentiment = document.getElementById('enableSentiment').checked;
        this.settings.enableTyping = document.getElementById('enableTyping').checked;
        this.settings.enableSound = document.getElementById('enableSound').checked;
        this.settings.maxTokens = parseInt(document.getElementById('maxTokens').value);
        
        // Save to localStorage
        localStorage.setItem('chatbotSettings', JSON.stringify(this.settings));
        
        this.showNotification('Settings saved successfully', 'success');
    }

    loadSettings() {
        const saved = localStorage.getItem('chatbotSettings');
        if (saved) {
            this.settings = { ...this.settings, ...JSON.parse(saved) };
            
            // Apply settings to form
            document.getElementById('botPersonality').value = this.settings.personality;
            document.getElementById('responseSpeed').value = this.settings.responseSpeed;
            document.getElementById('enableSentiment').checked = this.settings.enableSentiment;
            document.getElementById('enableTyping').checked = this.settings.enableTyping;
            document.getElementById('enableSound').checked = this.settings.enableSound;
            document.getElementById('maxTokens').value = this.settings.maxTokens;
        }
    }

    applyAdvancedSettings() {
        this.settings.modelType = document.getElementById('modelType').value;
        this.settings.temperature = parseFloat(document.getElementById('temperature').value);
        
        this.hideModal('settingsModal');
        this.showNotification('Advanced settings applied', 'success');
    }

    resetAnalytics() {
        this.analytics = {
            messageCount: 0,
            sessionStart: Date.now(),
            sentimentHistory: [],
            responseTimeHistory: []
        };
        this.updateAnalytics();
    }

    startAnalyticsTimer() {
        setInterval(() => {
            this.updateAnalytics();
        }, 30000); // Update every 30 seconds
    }

    updateOnlineStatus() {
        const status = document.getElementById('botStatus');
        status.textContent = 'Online';
        status.style.color = 'var(--success-color)';
    }

    playNotificationSound() {
        // Create a simple notification sound
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.value = 800;
        oscillator.type = 'sine';
        
        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
        
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.5);
    }

    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 15px 20px;
            background: ${type === 'success' ? 'var(--success-color)' : 
                        type === 'error' ? 'var(--danger-color)' : 'var(--info-color)'};
            color: white;
            border-radius: var(--radius-md);
            box-shadow: var(--shadow-lg);
            z-index: 1001;
            animation: slideInRight 0.3s ease;
        `;
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.animation = 'slideOutRight 0.3s ease';
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }

    formatTime(date) {
        return new Intl.DateTimeFormat('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
        }).format(new Date(date));
    }

    showTypingIndicator() {
        // Simulate showing typing indicator to other users
        console.log('User is typing...');
    }

    hideTypingIndicator() {
        // Simulate hiding typing indicator
        console.log('User stopped typing');
    }
}

// Initialize the chatbot framework when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.chatbot = new ChatbotFramework();
    console.log('AI Chatbot Framework initialized by Gabriel Demetrios Lafis');
});

// Add CSS animations
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    
    @keyframes slideOutRight {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }
`;
document.head.appendChild(style);

