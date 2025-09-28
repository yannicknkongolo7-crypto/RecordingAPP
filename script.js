// AI Transcription Service
class AITranscriptionService {
    constructor() {
        this.apiKeys = {
            openai: null, // Users would need to add their API keys
            google: null,
            azure: null
        };
        this.currentProvider = 'mock';
        this.currentLanguage = 'en';
        this.allTranscriptions = []; // Store all transcriptions for search
    }

    // Set API configuration
    setApiKey(provider, apiKey) {
        if (this.apiKeys.hasOwnProperty(provider)) {
            this.apiKeys[provider] = apiKey;
        }
    }

    setProvider(provider) {
        this.currentProvider = provider;
    }

    setLanguage(language) {
        this.currentLanguage = language;
    }

    // Main transcription method
    async transcribe(audioBlob, options = {}) {
        const provider = options.provider || this.currentProvider;
        const language = options.language || this.currentLanguage;

        console.log(`Transcribing with ${provider} in ${language}`);

        switch (provider) {
            case 'openai':
                return await this.transcribeWithOpenAI(audioBlob, language);
            case 'google':
                return await this.transcribeWithGoogle(audioBlob, language);
            case 'azure':
                return await this.transcribeWithAzure(audioBlob, language);
            default:
                return await this.transcribeWithMock(audioBlob, language);
        }
    }

    // OpenAI Whisper API Integration
    async transcribeWithOpenAI(audioBlob, language) {
        if (!this.apiKeys.openai) {
            throw new Error('OpenAI API key not configured');
        }

        // Convert blob to the format required by OpenAI
        const formData = new FormData();
        formData.append('file', audioBlob, 'audio.webm');
        formData.append('model', 'whisper-1');
        formData.append('language', language);
        formData.append('response_format', 'verbose_json');

        try {
            const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${this.apiKeys.openai}`
                },
                body: formData
            });

            if (!response.ok) {
                throw new Error(`OpenAI API error: ${response.status}`);
            }

            const result = await response.json();
            return this.formatTranscriptionResult(result, 'openai', language);
        } catch (error) {
            console.error('OpenAI transcription error:', error);
            throw error;
        }
    }

    // Google Speech-to-Text API Integration
    async transcribeWithGoogle(audioBlob, language) {
        if (!this.apiKeys.google) {
            throw new Error('Google Cloud API key not configured');
        }

        // Convert audio blob to base64 for Google API
        const base64Audio = await this.blobToBase64(audioBlob);

        const requestBody = {
            config: {
                encoding: 'WEBM_OPUS',
                sampleRateHertz: 48000,
                languageCode: this.mapLanguageCodeForGoogle(language),
                enableWordTimeOffsets: true,
                enableAutomaticPunctuation: true
            },
            audio: {
                content: base64Audio.split(',')[1] // Remove data:audio prefix
            }
        };

        try {
            const response = await fetch(`https://speech.googleapis.com/v1/speech:recognize?key=${this.apiKeys.google}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(requestBody)
            });

            if (!response.ok) {
                throw new Error(`Google Speech API error: ${response.status}`);
            }

            const result = await response.json();
            return this.formatTranscriptionResult(result, 'google', language);
        } catch (error) {
            console.error('Google transcription error:', error);
            throw error;
        }
    }

    // Azure Speech Services Integration
    async transcribeWithAzure(audioBlob, language) {
        if (!this.apiKeys.azure) {
            throw new Error('Azure Speech API key not configured');
        }

        // Azure Speech requires specific headers and format
        const arrayBuffer = await audioBlob.arrayBuffer();

        try {
            const response = await fetch(`https://YOUR_REGION.stt.speech.microsoft.com/speech/recognition/conversation/cognitiveservices/v1?language=${language}`, {
                method: 'POST',
                headers: {
                    'Ocp-Apim-Subscription-Key': this.apiKeys.azure,
                    'Content-Type': 'audio/webm; codecs=opus',
                    'Accept': 'application/json'
                },
                body: arrayBuffer
            });

            if (!response.ok) {
                throw new Error(`Azure Speech API error: ${response.status}`);
            }

            const result = await response.json();
            return this.formatTranscriptionResult(result, 'azure', language);
        } catch (error) {
            console.error('Azure transcription error:', error);
            throw error;
        }
    }

    // Mock transcription for demo purposes
    async transcribeWithMock(audioBlob, language) {
        // Simulate processing time
        await new Promise(resolve => setTimeout(resolve, 2000 + Math.random() * 3000));

        const mockTranscripts = {
            en: [
                "Hello, this is a sample transcription of your recorded audio using advanced AI technology. The system has successfully processed your speech and converted it into accurate text with high confidence levels.",
                "Welcome to the enhanced video recording application with AI-powered transcription capabilities. This feature demonstrates real-time speech recognition and natural language processing.",
                "This is an example of multi-language AI transcription functionality. Your recorded content has been analyzed and converted to searchable text with timestamp synchronization for caption generation."
            ],
            es: [
                "Hola, esta es una transcripción de muestra de su audio grabado utilizando tecnología de inteligencia artificial avanzada. El sistema ha procesado exitosamente su discurso y lo ha convertido en texto preciso.",
                "Bienvenido a la aplicación mejorada de grabación de video con capacidades de transcripción impulsadas por IA. Esta característica demuestra reconocimiento de voz en tiempo real.",
                "Este es un ejemplo de funcionalidad de transcripción de IA multiidioma. Su contenido grabado ha sido analizado y convertido a texto con sincronización de marcas de tiempo."
            ],
            fr: [
                "Bonjour, ceci est un exemple de transcription de votre audio enregistré utilisant une technologie d'intelligence artificielle avancée. Le système a traité avec succès votre discours.",
                "Bienvenue dans l'application améliorée d'enregistrement vidéo avec des capacités de transcription alimentées par l'IA. Cette fonctionnalité démontre la reconnaissance vocale en temps réel.",
                "Ceci est un exemple de fonctionnalité de transcription IA multilingue. Votre contenu enregistré a été analysé et converti en texte recherchable."
            ],
            de: [
                "Hallo, dies ist eine Beispieltranskription Ihres aufgenommenen Audios mit fortschrittlicher KI-Technologie. Das System hat Ihre Sprache erfolgreich verarbeitet und in genauen Text umgewandelt.",
                "Willkommen in der verbesserten Videoaufnahme-Anwendung mit KI-gestützten Transkriptionsfunktionen. Diese Funktion demonstriert Echtzeit-Spracherkennung.",
                "Dies ist ein Beispiel für mehrsprachige KI-Transkriptionsfunktionalität. Ihr aufgenommener Inhalt wurde analysiert und in durchsuchbaren Text konvertiert."
            ]
        };

        const transcripts = mockTranscripts[language] || mockTranscripts['en'];
        const randomIndex = Math.floor(Math.random() * transcripts.length);
        
        return {
            text: transcripts[randomIndex],
            confidence: 0.85 + Math.random() * 0.14, // 85-99% confidence
            provider: 'mock',
            language: language,
            segments: this.generateMockSegments(transcripts[randomIndex]),
            duration: Math.floor(Math.random() * 180) + 30 // 30-210 seconds
        };
    }

    // Generate mock segments with timestamps for caption generation
    generateMockSegments(text) {
        const words = text.split(' ');
        const segments = [];
        let currentTime = 0;
        
        for (let i = 0; i < words.length; i += 5) {
            const segmentWords = words.slice(i, i + 5).join(' ');
            const duration = segmentWords.length * 0.1 + Math.random() * 2; // Variable duration
            
            segments.push({
                start: currentTime,
                end: currentTime + duration,
                text: segmentWords
            });
            
            currentTime += duration + 0.5; // Add pause between segments
        }
        
        return segments;
    }

    // Format transcription results from different providers
    formatTranscriptionResult(result, provider, language) {
        let formattedResult = {
            provider: provider,
            language: language,
            confidence: 0.9,
            text: '',
            segments: []
        };

        switch (provider) {
            case 'openai':
                formattedResult.text = result.text;
                formattedResult.confidence = result.confidence || 0.9;
                if (result.segments) {
                    formattedResult.segments = result.segments.map(seg => ({
                        start: seg.start,
                        end: seg.end,
                        text: seg.text
                    }));
                }
                break;
                
            case 'google':
                if (result.results && result.results[0]) {
                    const alternative = result.results[0].alternatives[0];
                    formattedResult.text = alternative.transcript;
                    formattedResult.confidence = alternative.confidence || 0.9;
                    
                    if (alternative.words) {
                        formattedResult.segments = this.groupWordsIntoSegments(alternative.words);
                    }
                }
                break;
                
            case 'azure':
                formattedResult.text = result.DisplayText || result.RecognitionStatus;
                formattedResult.confidence = result.Confidence || 0.9;
                break;
        }

        // Store for search functionality
        this.allTranscriptions.push({
            id: Date.now(),
            ...formattedResult,
            timestamp: new Date()
        });

        return formattedResult;
    }

    // Helper methods
    async blobToBase64(blob) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.onerror = reject;
            reader.readAsDataURL(blob);
        });
    }

    mapLanguageCodeForGoogle(language) {
        const mapping = {
            'en': 'en-US',
            'es': 'es-ES',
            'fr': 'fr-FR',
            'de': 'de-DE',
            'it': 'it-IT',
            'pt': 'pt-BR',
            'zh': 'zh-CN',
            'ja': 'ja-JP',
            'ko': 'ko-KR',
            'ar': 'ar-SA'
        };
        return mapping[language] || 'en-US';
    }

    groupWordsIntoSegments(words, maxSegmentLength = 10) {
        const segments = [];
        let currentSegment = [];
        let currentStart = null;

        for (const word of words) {
            if (currentSegment.length === 0) {
                currentStart = parseFloat(word.startTime.replace('s', ''));
            }

            currentSegment.push(word.word);

            if (currentSegment.length >= maxSegmentLength) {
                const endTime = parseFloat(word.endTime.replace('s', ''));
                segments.push({
                    start: currentStart,
                    end: endTime,
                    text: currentSegment.join(' ')
                });
                currentSegment = [];
            }
        }

        // Add remaining words
        if (currentSegment.length > 0) {
            const lastWord = words[words.length - 1];
            const endTime = parseFloat(lastWord.endTime.replace('s', ''));
            segments.push({
                start: currentStart,
                end: endTime,
                text: currentSegment.join(' ')
            });
        }

        return segments;
    }

    // Search through all transcriptions
    searchTranscriptions(query) {
        if (!query.trim()) return [];

        const results = [];
        const searchTerms = query.toLowerCase().split(/\s+/);

        for (const transcription of this.allTranscriptions) {
            const text = transcription.text.toLowerCase();
            let relevanceScore = 0;
            const matches = [];

            for (const term of searchTerms) {
                const regex = new RegExp(term, 'gi');
                const termMatches = text.match(regex);
                if (termMatches) {
                    relevanceScore += termMatches.length;
                    matches.push(...termMatches);
                }
            }

            if (relevanceScore > 0) {
                results.push({
                    ...transcription,
                    relevanceScore,
                    matches,
                    highlightedText: this.highlightMatches(transcription.text, searchTerms)
                });
            }
        }

        // Sort by relevance score
        return results.sort((a, b) => b.relevanceScore - a.relevanceScore);
    }

    highlightMatches(text, searchTerms) {
        let highlighted = text;
        for (const term of searchTerms) {
            const regex = new RegExp(`(${term})`, 'gi');
            highlighted = highlighted.replace(regex, '<span class="search-highlight">$1</span>');
        }
        return highlighted;
    }

    // Generate SRT caption file
    generateSRT(segments) {
        let srt = '';
        for (let i = 0; i < segments.length; i++) {
            const segment = segments[i];
            const startTime = this.formatSRTTime(segment.start);
            const endTime = this.formatSRTTime(segment.end);
            
            srt += `${i + 1}\n`;
            srt += `${startTime} --> ${endTime}\n`;
            srt += `${segment.text}\n\n`;
        }
        return srt;
    }

    // Generate VTT caption file
    generateVTT(segments) {
        let vtt = 'WEBVTT\n\n';
        for (const segment of segments) {
            const startTime = this.formatVTTTime(segment.start);
            const endTime = this.formatVTTTime(segment.end);
            
            vtt += `${startTime} --> ${endTime}\n`;
            vtt += `${segment.text}\n\n`;
        }
        return vtt;
    }

    formatSRTTime(seconds) {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = Math.floor(seconds % 60);
        const milliseconds = Math.floor((seconds % 1) * 1000);
        
        return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')},${milliseconds.toString().padStart(3, '0')}`;
    }

    formatVTTTime(seconds) {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = (seconds % 60).toFixed(3);
        
        return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.padStart(6, '0')}`;
    }
}

// Authentication Manager
class AuthManager {
    constructor() {
        this.currentUser = null;
        this.isGuest = false;
        this.initializeAuth();
    }

    initializeAuth() {
        // Check for existing session
        const savedUser = localStorage.getItem('nk_corp_user');
        const isGuest = localStorage.getItem('nk_corp_guest') === 'true';
        
        if (savedUser) {
            this.currentUser = JSON.parse(savedUser);
            this.showMainApp();
        } else if (isGuest) {
            this.isGuest = true;
            this.showMainApp();
        } else {
            this.showLoginPortal();
        }
        
        this.bindAuthEvents();
    }

    bindAuthEvents() {
        // Form switching
        document.getElementById('showRegister').addEventListener('click', (e) => {
            e.preventDefault();
            this.switchToRegister();
        });
        
        document.getElementById('showLogin').addEventListener('click', (e) => {
            e.preventDefault();
            this.switchToLogin();
        });
        
        // Form submissions
        document.getElementById('loginFormElement').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleLogin(e);
        });
        
        document.getElementById('registerFormElement').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleRegister(e);
        });
        
        // Guest access
        document.getElementById('guestBtn').addEventListener('click', () => {
            this.handleGuestAccess();
        });
        
        // Logout
        document.getElementById('logoutBtn').addEventListener('click', () => {
            this.handleLogout();
        });
    }

    switchToRegister() {
        document.getElementById('loginForm').classList.remove('active');
        document.getElementById('registerForm').classList.add('active');
    }

    switchToLogin() {
        document.getElementById('registerForm').classList.remove('active');
        document.getElementById('loginForm').classList.add('active');
    }

    async handleLogin(event) {
        const formData = new FormData(event.target);
        const email = formData.get('loginEmail') || document.getElementById('loginEmail').value;
        const password = formData.get('loginPassword') || document.getElementById('loginPassword').value;
        
        if (!email || !password) {
            this.showAuthError('Please fill in all fields');
            return;
        }

        // Simulate login (in real app, this would call an API)
        try {
            const user = this.authenticateUser(email, password);
            if (user) {
                this.currentUser = user;
                this.saveUserSession(user);
                this.showSuccess('Welcome back, ' + user.name + '!');
                setTimeout(() => this.showMainApp(), 1000);
            } else {
                this.showAuthError('Invalid email or password');
            }
        } catch (error) {
            this.showAuthError('Login failed. Please try again.');
        }
    }

    async handleRegister(event) {
        const formData = new FormData(event.target);
        const name = formData.get('registerName') || document.getElementById('registerName').value;
        const email = formData.get('registerEmail') || document.getElementById('registerEmail').value;
        const password = formData.get('registerPassword') || document.getElementById('registerPassword').value;
        
        if (!name || !email || !password) {
            this.showAuthError('Please fill in all fields');
            return;
        }

        if (password.length < 6) {
            this.showAuthError('Password must be at least 6 characters');
            return;
        }

        try {
            const user = this.registerUser(name, email, password);
            this.currentUser = user;
            this.saveUserSession(user);
            this.showSuccess('Account created successfully! Welcome, ' + user.name + '!');
            setTimeout(() => this.showMainApp(), 1000);
        } catch (error) {
            this.showAuthError('Registration failed. Email might already be in use.');
        }
    }

    handleGuestAccess() {
        this.isGuest = true;
        localStorage.setItem('nk_corp_guest', 'true');
        this.showSuccess('Welcome, Guest User!');
        setTimeout(() => this.showMainApp(), 1000);
    }

    handleLogout() {
        if (confirm('Are you sure you want to logout?')) {
            localStorage.removeItem('nk_corp_user');
            localStorage.removeItem('nk_corp_guest');
            this.currentUser = null;
            this.isGuest = false;
            location.reload(); // Refresh to reset app state
        }
    }

    authenticateUser(email, password) {
        // Simulate authentication (in real app, this would validate against a database)
        const users = JSON.parse(localStorage.getItem('nk_corp_users') || '[]');
        const user = users.find(u => u.email === email && u.password === password);
        return user || null;
    }

    registerUser(name, email, password) {
        // Check if user already exists
        const users = JSON.parse(localStorage.getItem('nk_corp_users') || '[]');
        if (users.find(u => u.email === email)) {
            throw new Error('User already exists');
        }

        // Create new user
        const user = {
            id: Date.now(),
            name: name,
            email: email,
            password: password, // In real app, this would be hashed
            createdAt: new Date().toISOString(),
            type: 'premium'
        };

        users.push(user);
        localStorage.setItem('nk_corp_users', JSON.stringify(users));
        return user;
    }

    saveUserSession(user) {
        const sessionUser = { ...user };
        delete sessionUser.password; // Don't store password in session
        localStorage.setItem('nk_corp_user', JSON.stringify(sessionUser));
    }

    showLoginPortal() {
        document.getElementById('loginPortal').style.display = 'flex';
        document.getElementById('mainApp').style.display = 'none';
        this.setupScrollHint();
    }

    setupScrollHint() {
        const portal = document.getElementById('loginPortal');
        const scrollHint = document.getElementById('scrollHint');
        
        if (!portal || !scrollHint) return;

        // Show hint if content overflows viewport
        const checkScrollNeeded = () => {
            const isScrollable = portal.scrollHeight > portal.clientHeight;
            const isNearBottom = (portal.scrollTop + portal.clientHeight) >= (portal.scrollHeight - 50);
            
            if (isScrollable && !isNearBottom) {
                scrollHint.classList.add('show');
            } else {
                scrollHint.classList.remove('show');
            }
        };

        // Check on load and resize
        checkScrollNeeded();
        window.addEventListener('resize', checkScrollNeeded);
        
        // Hide hint when user scrolls
        portal.addEventListener('scroll', () => {
            const scrolled = portal.scrollTop > 50;
            if (scrolled) {
                scrollHint.classList.remove('show');
            } else {
                checkScrollNeeded();
            }
        });

        // Auto-hide hint after 5 seconds
        setTimeout(() => {
            scrollHint.classList.remove('show');
        }, 5000);

        // Keyboard navigation for login portal
        this.setupKeyboardNavigation(portal);
    }

    setupKeyboardNavigation(portal) {
        document.addEventListener('keydown', (e) => {
            // Only if login portal is visible
            if (portal.style.display !== 'flex') return;

            switch(e.key) {
                case 'ArrowDown':
                case 'PageDown':
                    e.preventDefault();
                    portal.scrollBy({ top: 100, behavior: 'smooth' });
                    break;
                case 'ArrowUp':
                case 'PageUp':
                    e.preventDefault();
                    portal.scrollBy({ top: -100, behavior: 'smooth' });
                    break;
                case 'Home':
                    e.preventDefault();
                    portal.scrollTo({ top: 0, behavior: 'smooth' });
                    break;
                case 'End':
                    e.preventDefault();
                    portal.scrollTo({ top: portal.scrollHeight, behavior: 'smooth' });
                    break;
            }
        });

        // Enhanced touch gestures for mobile
        this.setupTouchGestures(portal);
    }

    setupTouchGestures(portal) {
        let startY = 0;
        let startTime = 0;

        portal.addEventListener('touchstart', (e) => {
            startY = e.touches[0].clientY;
            startTime = Date.now();
        }, { passive: true });

        portal.addEventListener('touchend', (e) => {
            const endY = e.changedTouches[0].clientY;
            const deltaY = startY - endY;
            const deltaTime = Date.now() - startTime;

            // Detect swipe gestures (minimum distance and speed)
            if (Math.abs(deltaY) > 50 && deltaTime < 300) {
                if (deltaY > 0) {
                    // Swipe up - scroll down faster
                    portal.scrollBy({ top: 200, behavior: 'smooth' });
                } else {
                    // Swipe down - scroll up faster  
                    portal.scrollBy({ top: -200, behavior: 'smooth' });
                }
            }
        }, { passive: true });
    }

    showMainApp() {
        document.getElementById('loginPortal').style.display = 'none';
        document.getElementById('mainApp').style.display = 'block';
        this.updateUserBar();
        
        // Initialize the recorder when main app is shown
        if (window.initializeRecorder) {
            window.initializeRecorder();
        }
    }

    updateUserBar() {
        const userName = document.getElementById('userName');
        const userType = document.getElementById('userType');
        
        if (this.isGuest) {
            userName.textContent = 'Guest User';
            userType.textContent = 'GUEST';
            userType.className = 'user-type guest';
        } else if (this.currentUser) {
            userName.textContent = this.currentUser.name;
            userType.textContent = this.currentUser.type.toUpperCase();
            userType.className = 'user-type premium';
        }
    }

    showAuthError(message) {
        this.showNotification(message, 'error');
    }

    showSuccess(message) {
        this.showNotification(message, 'success');
    }

    showNotification(message, type = 'error') {
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${type === 'error' ? '#ff4757' : '#2ed573'};
            color: white;
            padding: 15px 20px;
            border-radius: 10px;
            z-index: 3000;
            max-width: 300px;
            box-shadow: 0 5px 15px rgba(0,0,0,0.2);
            animation: slideInRight 0.3s ease;
        `;
        notification.textContent = message;
        document.body.appendChild(notification);

        setTimeout(() => {
            notification.style.animation = 'slideOutRight 0.3s ease';
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }

    getUserType() {
        if (this.isGuest) return 'guest';
        if (this.currentUser) return 'premium';
        return 'anonymous';
    }

    canAccessFeature(feature) {
        const userType = this.getUserType();
        
        // Define feature access levels
        const featureAccess = {
            'recording': ['guest', 'premium'],
            'upload': ['premium'],
            'download': ['guest', 'premium'],
            'cloud_save': ['premium'],
            'hd_recording': ['premium']
        };
        
        return featureAccess[feature]?.includes(userType) || false;
    }
}

class VideoAudioRecorder {
    constructor(authManager) {
        this.mediaRecorder = null;
        this.stream = null;
        this.recordedChunks = [];
        this.recordings = [];
        this.isRecording = false;
        this.recordingStartTime = null;
        this.timerInterval = null;
        this.recordType = 'video'; // 'video' or 'audio'
        this.authManager = authManager;
        this.currentRecordingForTranscription = null;
        this.currentTranscriptionResult = null;
        
        // Initialize AI transcription service
        this.aiService = new AITranscriptionService();
        
        this.initializeElements();
        this.bindEvents();
        this.loadSavedRecordings();
        this.setupWatermark();
    }

    initializeElements() {
        // Get DOM elements - New UI structure
        this.startBtn = document.getElementById('startBtn');
        this.stopBtn = document.getElementById('stopBtn');
        this.resetBtn = document.getElementById('resetBtn');
        this.preview = document.getElementById('preview');
        this.timer = document.getElementById('timer');
        this.recordingsList = document.getElementById('recordingsList');
        this.recordingsSection = document.getElementById('recordingsSection');
        this.audioVisualizer = document.getElementById('audioVisualizer');
        
        // Recording mode buttons
        this.videoModeBtn = document.getElementById('videoMode');
        this.audioModeBtn = document.getElementById('audioMode');
        
        // Status elements
        this.statusText = document.querySelector('.status-text');
        
        // Transcription elements
        this.transcribeBtn = document.getElementById('transcribeBtn');
        this.transcriptionStatus = document.getElementById('transcriptionStatus');
        this.transcriptionOutput = document.getElementById('transcriptionOutput');
        this.transcriptText = document.getElementById('transcriptText');
        this.aiProviderSelect = document.getElementById('aiProvider');
        this.languageSelect = document.getElementById('languageSelect');
        this.confidenceBadge = document.getElementById('confidenceBadge');
        this.providerBadge = document.getElementById('providerBadge');
        this.languageBadge = document.getElementById('languageBadge');
        
        // Search elements
        this.transcriptionSearch = document.getElementById('transcriptionSearch');
        this.searchInput = document.getElementById('searchTranscriptions');
        this.searchResults = document.getElementById('searchResults');
        
        // Action buttons
        this.copyTranscriptBtn = document.getElementById('copyTranscriptBtn');
        this.downloadTranscriptBtn = document.getElementById('downloadTranscriptBtn');
        this.generateCaptionsBtn = document.getElementById('generateCaptionsBtn');
        this.downloadSRTBtn = document.getElementById('downloadSRTBtn');
        this.downloadVTTBtn = document.getElementById('downloadVTTBtn');
        
        // Upload elements (if they exist)
        this.uploadArea = document.getElementById('uploadArea');
        this.fileInput = document.getElementById('fileInput');
        
        // Current filter state
        this.currentFilter = 'all';
    }

    bindEvents() {
        // Button events
        this.startBtn?.addEventListener('click', () => this.startRecording());
        this.stopBtn?.addEventListener('click', () => this.stopRecording());
        this.resetBtn?.addEventListener('click', () => this.reset());

        // Recording mode toggle
        this.videoModeBtn?.addEventListener('click', () => this.setRecordingMode('video'));
        this.audioModeBtn?.addEventListener('click', () => this.setRecordingMode('audio'));

        // Transcription events
        this.transcribeBtn?.addEventListener('click', () => this.handleTranscription());
        this.aiProviderSelect?.addEventListener('change', (e) => {
            this.aiService.setProvider(e.target.value);
            this.updateProviderInfo();
        });
        this.languageSelect?.addEventListener('change', (e) => {
            this.aiService.setLanguage(e.target.value);
            this.updateLanguageInfo();
        });

        // Search functionality
        this.searchInput?.addEventListener('input', (e) => this.handleSearchInput(e));
        this.searchInput?.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.searchTranscriptions();
        });

        // Action button events
        this.copyTranscriptBtn?.addEventListener('click', () => this.copyTranscript());
        this.downloadTranscriptBtn?.addEventListener('click', () => this.exportTranscript());
        this.generateCaptionsBtn?.addEventListener('click', () => this.generateCaptions());
        this.downloadSRTBtn?.addEventListener('click', () => this.downloadSRT());
        this.downloadVTTBtn?.addEventListener('click', () => this.downloadVTT());

        // File upload events (if elements exist)
        if (this.fileInput) {
            this.fileInput.addEventListener('change', (e) => this.handleFileSelect(e));
        }
        
        if (this.uploadArea) {
            this.uploadArea.addEventListener('click', () => {
                if (this.authManager.canAccessFeature('upload')) {
                    this.fileInput.click();
                } else {
                    this.showError('File upload is only available for registered users. Please create an account or sign in.');
                }
            });
            
            // Drag and drop events
            this.uploadArea.addEventListener('dragover', (e) => this.handleDragOver(e));
            this.uploadArea.addEventListener('dragleave', (e) => this.handleDragLeave(e));
            this.uploadArea.addEventListener('drop', (e) => this.handleDrop(e));
        }
        
        // Update upload area based on user permissions
        this.updateUploadAreaAccess();

        // Initialize preview
        this.updatePreview();
        
        // Show search bar once there are transcriptions
        this.updateSearchVisibility();
    }

    setRecordingMode(mode) {
        this.recordType = mode;
        
        // Update button states
        if (this.videoModeBtn && this.audioModeBtn) {
            this.videoModeBtn.classList.toggle('active', mode === 'video');
            this.audioModeBtn.classList.toggle('active', mode === 'audio');
        }
        
        this.updatePreview();
    }

    async updatePreview() {
        try {
            // Stop existing stream
            if (this.stream) {
                this.stream.getTracks().forEach(track => track.stop());
            }

            if (this.recordType === 'video') {
                // Show video preview, hide audio visualizer
                if (this.preview) {
                    this.preview.style.display = 'block';
                }
                if (this.audioVisualizer) {
                    this.audioVisualizer.classList.remove('active');
                }
                
                // Get video + audio stream
                this.stream = await navigator.mediaDevices.getUserMedia({
                    video: { width: 1280, height: 720 },
                    audio: true
                });
                if (this.preview) {
                    this.preview.srcObject = this.stream;
                }
            } else {
                // Hide video preview, show audio visualizer
                if (this.preview) {
                    this.preview.style.display = 'none';
                }
                if (this.audioVisualizer) {
                    this.audioVisualizer.classList.add('active');
                }
                
                // Get audio only stream
                this.stream = await navigator.mediaDevices.getUserMedia({
                    audio: true
                });
                
                // Setup audio visualization
                this.setupAudioVisualization();
            }

            this.updateStatus('Ready to record');
        } catch (error) {
            console.error('Error accessing media devices:', error);
            this.updateStatus('Error: Could not access camera/microphone');
            this.showError('Please allow camera and microphone access to use this app.');
        }
    }

    setupAudioVisualization() {
        if (!this.stream || !this.audioVisualizer) return;

        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const source = audioContext.createMediaStreamSource(this.stream);
        const analyser = audioContext.createAnalyser();
        
        analyser.fftSize = 256;
        const bufferLength = analyser.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);
        
        source.connect(analyser);
        
        const bars = this.audioVisualizer.querySelectorAll('.wave-bar');
        
        const animate = () => {
            if (this.recordType === 'audio') {
                requestAnimationFrame(animate);
                
                analyser.getByteFrequencyData(dataArray);
                
                bars.forEach((bar, index) => {
                    const value = dataArray[index * 4] || 0;
                    const height = Math.max(8, (value / 255) * 80);
                    bar.style.height = `${height}px`;
                });
            }
        };
        
        animate();
    }

    // AI Transcription Methods
    async handleTranscription() {
        if (!this.currentRecordingForTranscription) {
            this.showError('No recording available for transcription. Please record something first.');
            return;
        }

        try {
            const selectedProvider = this.aiProviderSelect?.value || 'mock';
            const selectedLanguage = this.languageSelect?.value || 'en';
            
            this.showTranscriptionStatus('🔄', `Processing with ${this.getProviderName(selectedProvider)}...`, 'loading');
            this.transcribeBtn.disabled = true;
            this.transcribeBtn.innerHTML = '<span>⏳</span> Processing...';

            // Get the audio blob for transcription
            const audioBlob = this.extractAudioFromRecording(this.currentRecordingForTranscription);
            
            // Use the AI service to transcribe
            const result = await this.aiService.transcribe(audioBlob, {
                provider: selectedProvider,
                language: selectedLanguage
            });
            
            this.currentTranscriptionResult = result;
            this.showTranscriptionResult(result);
            this.updateSearchVisibility();
            
        } catch (error) {
            console.error('Transcription error:', error);
            this.showTranscriptionStatus('❌', `Transcription failed: ${error.message}`, 'error');
        } finally {
            this.transcribeBtn.disabled = false;
            this.transcribeBtn.innerHTML = '<span>✨</span> Transcribe';
        }
    }

    extractAudioFromRecording(recording) {
        // For video recordings, we would need to extract audio
        // For now, we'll work with the blob directly
        return recording.blob;
    }

    getProviderName(provider) {
        const names = {
            'openai': 'OpenAI Whisper',
            'google': 'Google Speech',
            'azure': 'Azure Speech',
            'mock': 'Demo Mode'
        };
        return names[provider] || provider;
    }

    getLanguageName(code) {
        const names = {
            'en': 'English',
            'es': 'Spanish',
            'fr': 'French',
            'de': 'German',
            'it': 'Italian',
            'pt': 'Portuguese',
            'zh': 'Chinese',
            'ja': 'Japanese',
            'ko': 'Korean',
            'ar': 'Arabic'
        };
        return names[code] || code;
    }

    showTranscriptionStatus(icon, message, type = 'info') {
        if (!this.transcriptionStatus || !this.transcriptionOutput) return;

        this.transcriptionStatus.style.display = 'flex';
        this.transcriptionOutput.style.display = 'none';

        this.transcriptionStatus.innerHTML = `
            <div class="status-icon">${icon}</div>
            <p>${message}</p>
        `;

        // Add loading animation for processing state
        if (type === 'loading') {
            const statusIcon = this.transcriptionStatus.querySelector('.status-icon');
            statusIcon.style.animation = 'spin 1s linear infinite';
            
            // Add CSS for spin animation if it doesn't exist
            if (!document.querySelector('#spin-animation')) {
                const style = document.createElement('style');
                style.id = 'spin-animation';
                style.textContent = `
                    @keyframes spin {
                        from { transform: rotate(0deg); }
                        to { transform: rotate(360deg); }
                    }
                `;
                document.head.appendChild(style);
            }
        }
    }

    showTranscriptionResult(result) {
        if (!this.transcriptionOutput || !this.transcriptText) return;

        this.transcriptionStatus.style.display = 'none';
        this.transcriptionOutput.style.display = 'flex';

        // Update badges
        const confidencePercentage = Math.round(result.confidence * 100);
        
        if (this.confidenceBadge) {
            this.confidenceBadge.textContent = `${confidencePercentage}%`;
            
            // Color code confidence levels
            if (confidencePercentage >= 90) {
                this.confidenceBadge.style.background = 'var(--accent-green)';
            } else if (confidencePercentage >= 75) {
                this.confidenceBadge.style.background = 'var(--accent-blue)';
            } else {
                this.confidenceBadge.style.background = 'var(--accent-red)';
            }
        }

        if (this.providerBadge) {
            this.providerBadge.textContent = this.getProviderName(result.provider);
        }

        if (this.languageBadge) {
            this.languageBadge.textContent = this.getLanguageName(result.language);
        }

        this.transcriptText.textContent = result.text;

        this.showSuccess(`Transcription completed with ${confidencePercentage}% confidence!`);
    }

    // Search functionality
    handleSearchInput(event) {
        const query = event.target.value.trim();
        if (query.length < 3) {
            this.clearSearchResults();
            return;
        }
        
        // Debounce search
        clearTimeout(this.searchTimeout);
        this.searchTimeout = setTimeout(() => {
            this.searchTranscriptions(query);
        }, 300);
    }

    searchTranscriptions(query = null) {
        const searchQuery = query || this.searchInput?.value?.trim();
        if (!searchQuery) return;

        const results = this.aiService.searchTranscriptions(searchQuery);
        this.displaySearchResults(results, searchQuery);
    }

    displaySearchResults(results, query) {
        if (!this.searchResults) return;

        this.searchResults.innerHTML = '';
        
        if (results.length === 0) {
            this.searchResults.innerHTML = `
                <div class="search-result-item">
                    <div class="search-result-text">No matches found for "${query}"</div>
                </div>
            `;
            return;
        }

        results.slice(0, 5).forEach(result => { // Show top 5 results
            const item = document.createElement('div');
            item.className = 'search-result-item';
            item.innerHTML = `
                <div class="search-result-text">${result.highlightedText}</div>
                <div class="search-result-meta">
                    ${result.timestamp.toLocaleDateString()} • 
                    ${this.getProviderName(result.provider)} • 
                    ${this.getLanguageName(result.language)} • 
                    Score: ${result.relevanceScore}
                </div>
            `;
            
            item.addEventListener('click', () => {
                this.selectTranscriptionResult(result);
            });
            
            this.searchResults.appendChild(item);
        });
    }

    selectTranscriptionResult(result) {
        // Display the selected transcription result
        this.currentTranscriptionResult = result;
        this.showTranscriptionResult(result);
        this.searchInput.value = '';
        this.clearSearchResults();
    }

    clearSearchResults() {
        if (this.searchResults) {
            this.searchResults.innerHTML = '';
        }
    }

    updateSearchVisibility() {
        if (this.transcriptionSearch) {
            const hasTranscriptions = this.aiService.allTranscriptions.length > 0;
            this.transcriptionSearch.style.display = hasTranscriptions ? 'block' : 'none';
        }
    }

    // Caption generation methods
    generateCaptions() {
        if (!this.currentTranscriptionResult || !this.currentTranscriptionResult.segments) {
            this.showError('No transcription with timing data available for caption generation.');
            return;
        }

        // Show options for caption generation
        const modal = this.createCaptionModal();
        document.body.appendChild(modal);
    }

    createCaptionModal() {
        const modal = document.createElement('div');
        modal.className = 'caption-modal';
        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.8);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 2000;
        `;

        modal.innerHTML = `
            <div class="modal-content" style="
                background: var(--card-black);
                border: 1px solid var(--border-gray);
                border-radius: var(--border-radius-lg);
                padding: 30px;
                max-width: 500px;
                width: 90%;
            ">
                <h3 style="color: var(--text-white); margin-bottom: 20px;">Generate Captions</h3>
                <p style="color: var(--text-gray); margin-bottom: 25px;">
                    Choose the caption format for your video:
                </p>
                <div style="display: flex; gap: 15px; flex-wrap: wrap;">
                    <button class="btn-caption" onclick="recorder.downloadSRT(); this.closest('.caption-modal').remove();">
                        📄 Download SRT
                    </button>
                    <button class="btn-caption" onclick="recorder.downloadVTT(); this.closest('.caption-modal').remove();">
                        📺 Download VTT
                    </button>
                    <button class="btn-caption" onclick="recorder.previewCaptions(); this.closest('.caption-modal').remove();">
                        👁️ Preview
                    </button>
                </div>
                <button onclick="this.closest('.caption-modal').remove();" style="
                    background: var(--border-gray);
                    color: var(--text-white);
                    border: none;
                    padding: 10px 20px;
                    border-radius: 8px;
                    margin-top: 20px;
                    width: 100%;
                    cursor: pointer;
                ">Close</button>
            </div>
        `;

        // Add styles for caption buttons
        const style = document.createElement('style');
        style.textContent = `
            .btn-caption {
                background: var(--accent-blue);
                color: var(--primary-black);
                border: none;
                padding: 12px 20px;
                border-radius: 8px;
                font-weight: 600;
                cursor: pointer;
                transition: all 0.3s ease;
            }
            .btn-caption:hover {
                background: var(--accent-green);
                transform: translateY(-1px);
            }
        `;
        document.head.appendChild(style);

        return modal;
    }

    downloadSRT() {
        if (!this.currentTranscriptionResult?.segments) {
            this.showError('No transcription segments available for SRT generation.');
            return;
        }

        const srtContent = this.aiService.generateSRT(this.currentTranscriptionResult.segments);
        this.downloadFile(srtContent, 'captions.srt', 'text/plain');
        this.showSuccess('SRT caption file downloaded!');
    }

    downloadVTT() {
        if (!this.currentTranscriptionResult?.segments) {
            this.showError('No transcription segments available for VTT generation.');
            return;
        }

        const vttContent = this.aiService.generateVTT(this.currentTranscriptionResult.segments);
        this.downloadFile(vttContent, 'captions.vtt', 'text/vtt');
        this.showSuccess('VTT caption file downloaded!');
    }

    previewCaptions() {
        if (!this.currentTranscriptionResult?.segments) {
            this.showError('No transcription segments available for preview.');
            return;
        }

        // Create preview modal
        const modal = document.createElement('div');
        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.9);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 2000;
        `;

        const previewContent = this.currentTranscriptionResult.segments.map((segment, index) => 
            `${index + 1}. [${this.formatTime(segment.start)} - ${this.formatTime(segment.end)}] ${segment.text}`
        ).join('\n\n');

        modal.innerHTML = `
            <div style="
                background: var(--card-black);
                border: 1px solid var(--border-gray);
                border-radius: var(--border-radius-lg);
                padding: 30px;
                max-width: 80%;
                max-height: 80%;
                overflow-y: auto;
            ">
                <h3 style="color: var(--text-white); margin-bottom: 20px;">Caption Preview</h3>
                <pre style="
                    background: var(--primary-black);
                    color: var(--text-white);
                    padding: 20px;
                    border-radius: 8px;
                    white-space: pre-wrap;
                    font-family: monospace;
                    line-height: 1.6;
                ">${previewContent}</pre>
                <button onclick="this.closest('div').parentElement.remove();" style="
                    background: var(--accent-red);
                    color: var(--primary-black);
                    border: none;
                    padding: 12px 24px;
                    border-radius: 8px;
                    margin-top: 20px;
                    cursor: pointer;
                    font-weight: 600;
                ">Close Preview</button>
            </div>
        `;

        document.body.appendChild(modal);
    }

    formatTime(seconds) {
        const minutes = Math.floor(seconds / 60);
        const secs = (seconds % 60).toFixed(1);
        return `${minutes}:${secs.padStart(4, '0')}`;
    }

    downloadFile(content, filename, mimeType) {
        const blob = new Blob([content], { type: mimeType });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        link.click();
        URL.revokeObjectURL(url);
    }

    updateProviderInfo() {
        const provider = this.aiProviderSelect?.value;
        if (this.providerBadge && provider) {
            this.providerBadge.textContent = this.getProviderName(provider);
        }
    }

    updateLanguageInfo() {
        const language = this.languageSelect?.value;
        if (this.languageBadge && language) {
            this.languageBadge.textContent = this.getLanguageName(language);
        }
    }

    copyTranscript(text) {
        if (navigator.clipboard) {
            navigator.clipboard.writeText(text).then(() => {
                this.showSuccess('Transcript copied to clipboard!');
            }).catch(() => {
                this.fallbackCopyTextToClipboard(text);
            });
        } else {
            this.fallbackCopyTextToClipboard(text);
        }
    }

    fallbackCopyTextToClipboard(text) {
        const textArea = document.createElement('textarea');
        textArea.value = text;
        textArea.style.top = '0';
        textArea.style.left = '0';
        textArea.style.position = 'fixed';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        
        try {
            document.execCommand('copy');
            this.showSuccess('Transcript copied to clipboard!');
        } catch (err) {
            this.showError('Failed to copy transcript');
        }
        
        document.body.removeChild(textArea);
    }

    exportTranscript(result) {
        const content = `Transcript Export
Generated on: ${new Date().toLocaleString()}
Recording Type: ${result.recordingType.toUpperCase()}
Duration: ${result.duration}
Confidence: ${Math.round(result.confidence * 100)}%

Transcript:
${result.text}

---
Generated by NK Corp Video Recorder
Product of NK Corp - Yannick Nkongolo`;

        const blob = new Blob([content], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `transcript_${new Date().toISOString().slice(0,19).replace(/:/g, '-')}.txt`;
        link.click();
        URL.revokeObjectURL(url);
        
        this.showSuccess('Transcript exported successfully!');
    }

    async startRecording() {
        try {
            if (!this.stream) {
                await this.updatePreview();
            }

            // Configure MediaRecorder options based on record type
            const options = this.recordType === 'video' 
                ? { mimeType: 'video/webm;codecs=vp9' }
                : { mimeType: 'audio/webm;codecs=opus' };

            // Fallback to default if codec not supported
            if (!MediaRecorder.isTypeSupported(options.mimeType)) {
                options.mimeType = this.recordType === 'video' ? 'video/webm' : 'audio/webm';
            }

            this.mediaRecorder = new MediaRecorder(this.stream, options);
            this.recordedChunks = [];

            this.mediaRecorder.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    this.recordedChunks.push(event.data);
                }
            };

            this.mediaRecorder.onstop = () => {
                this.saveRecording();
            };

            this.mediaRecorder.onerror = (event) => {
                console.error('MediaRecorder error:', event.error);
                this.updateStatus('Recording error occurred');
            };

            // Start recording
            this.mediaRecorder.start(100); // Collect data every 100ms
            this.isRecording = true;
            this.recordingStartTime = Date.now();
            
            // Show watermark during recording
            this.showWatermark();
            
            // Update UI
            this.startBtn.disabled = true;
            this.stopBtn.disabled = false;
            this.startBtn.classList.add('recording');
            this.updateStatus('Recording...', true);
            this.startTimer();

        } catch (error) {
            console.error('Error starting recording:', error);
            this.updateStatus('Error starting recording');
            this.showError('Failed to start recording. Please try again.');
        }
    }

    stopRecording() {
        if (this.mediaRecorder && this.isRecording) {
            this.mediaRecorder.stop();
            this.isRecording = false;
            
            // Hide watermark when recording stops
            this.hideWatermark();
            
            // Update UI
            this.startBtn.disabled = false;
            this.stopBtn.disabled = true;
            this.startBtn.classList.remove('recording');
            this.updateStatus('Processing recording...');
            this.stopTimer();
        }
    }

    saveRecording() {
        if (this.recordedChunks.length === 0) {
            this.updateStatus('No recording data to save');
            return;
        }

        const blob = new Blob(this.recordedChunks, {
            type: this.recordType === 'video' ? 'video/webm' : 'audio/webm'
        });

        const recording = {
            id: Date.now(),
            type: this.recordType,
            blob: blob,
            url: URL.createObjectURL(blob),
            timestamp: new Date(),
            duration: this.getRecordingDuration(),
            size: this.formatFileSize(blob.size),
            source: 'recorded',
            name: `${this.recordType}_recording_${new Date().toISOString().slice(0,19).replace(/:/g, '-')}`
        };

        this.recordings.unshift(recording); // Add to beginning of array
        this.updateRecordingsList();
        this.saveRecordingsToStorage();
        
        // Set this recording as available for transcription
        this.currentRecordingForTranscription = recording;
        this.enableTranscription();
        
        this.updateStatus(`${this.recordType === 'video' ? 'Video' : 'Audio'} recording saved!`);
        
        // Clear recorded chunks
        this.recordedChunks = [];
    }

    enableTranscription() {
        if (this.transcribeBtn && this.currentRecordingForTranscription) {
            this.transcribeBtn.disabled = false;
            this.showTranscriptionStatus('🎯', 'Ready to transcribe your recording. Click the button above to start.', 'ready');
        }
    }

    getRecordingDuration() {
        if (!this.recordingStartTime) return '00:00';
        const duration = Math.floor((Date.now() - this.recordingStartTime) / 1000);
        const minutes = Math.floor(duration / 60).toString().padStart(2, '0');
        const seconds = (duration % 60).toString().padStart(2, '0');
        return `${minutes}:${seconds}`;
    }

    startTimer() {
        this.timerInterval = setInterval(() => {
            if (this.recordingStartTime) {
                const elapsed = Math.floor((Date.now() - this.recordingStartTime) / 1000);
                const minutes = Math.floor(elapsed / 60).toString().padStart(2, '0');
                const seconds = (elapsed % 60).toString().padStart(2, '0');
                this.timer.textContent = `${minutes}:${seconds}`;
            }
        }, 1000);
    }

    stopTimer() {
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
            this.timerInterval = null;
        }
    }

    reset() {
        this.stopRecording();
        this.stopTimer();
        this.timer.textContent = '00:00';
        this.recordedChunks = [];
        this.updateStatus('Ready to record');
        
        // Hide watermark and reset UI
        this.hideWatermark();
        this.startBtn.disabled = false;
        this.stopBtn.disabled = true;
        this.startBtn.classList.remove('recording');
    }

    // File Upload Methods
    handleFileSelect(event) {
        const files = Array.from(event.target.files);
        this.processFiles(files);
    }

    handleDragOver(event) {
        event.preventDefault();
        this.uploadArea.classList.add('dragover');
    }

    handleDragLeave(event) {
        event.preventDefault();
        this.uploadArea.classList.remove('dragover');
    }

    handleDrop(event) {
        event.preventDefault();
        this.uploadArea.classList.remove('dragover');
        
        const files = Array.from(event.dataTransfer.files);
        this.processFiles(files);
    }

    async processFiles(files) {
        if (files.length === 0) return;

        // Check if user can upload files
        if (!this.authManager.canAccessFeature('upload')) {
            this.showError('File upload is only available for registered users. Please create an account or sign in.');
            return;
        }

        // Filter valid media files
        const validFiles = files.filter(file => this.isValidMediaFile(file));
        
        if (validFiles.length === 0) {
            this.showError('Please select valid video or audio files (MP4, WebM, MOV, AVI, MP3, WAV, OGG, etc.)');
            return;
        }

        if (validFiles.length !== files.length) {
            this.showError(`${files.length - validFiles.length} files were skipped (invalid format)`);
        }

        // Process each valid file
        for (let i = 0; i < validFiles.length; i++) {
            await this.processFile(validFiles[i], i + 1, validFiles.length);
        }

        // Clear file input
        this.fileInput.value = '';
    }

    isValidMediaFile(file) {
        const validTypes = [
            // Video types
            'video/mp4', 'video/webm', 'video/ogg', 'video/quicktime', 'video/x-msvideo',
            'video/x-ms-wmv', 'video/3gpp', 'video/x-flv', 'video/mp2t',
            // Audio types
            'audio/mpeg', 'audio/wav', 'audio/ogg', 'audio/mp4', 'audio/webm',
            'audio/flac', 'audio/aac', 'audio/x-ms-wma', 'audio/x-wav'
        ];
        
        return validTypes.includes(file.type) || 
               this.hasValidMediaExtension(file.name);
    }

    hasValidMediaExtension(filename) {
        const validExtensions = [
            '.mp4', '.webm', '.ogg', '.mov', '.avi', '.wmv', '.3gp', '.flv', '.ts',
            '.mp3', '.wav', '.ogg', '.m4a', '.aac', '.flac', '.wma'
        ];
        
        const extension = filename.toLowerCase().substring(filename.lastIndexOf('.'));
        return validExtensions.includes(extension);
    }

    async processFile(file, current, total) {
        try {
            // Show progress
            this.showUploadProgress(current, total, file.name);

            // Determine file type
            const isVideo = file.type.startsWith('video/') || 
                           this.hasVideoExtension(file.name);

            // Create file URL
            const url = URL.createObjectURL(file);

            // Get file duration if possible
            const duration = await this.getMediaDuration(url, isVideo);

            // Create recording object
            const recording = {
                id: Date.now() + current, // Ensure unique ID
                type: isVideo ? 'video' : 'audio',
                blob: file,
                url: url,
                timestamp: new Date(file.lastModified || Date.now()),
                duration: duration,
                size: this.formatFileSize(file.size),
                source: 'uploaded',
                name: file.name.substring(0, file.name.lastIndexOf('.')) || file.name,
                originalFile: file
            };

            this.recordings.unshift(recording);

            // Simulate upload progress
            await this.simulateUploadProgress();

        } catch (error) {
            console.error('Error processing file:', error);
            this.showError(`Error processing ${file.name}: ${error.message}`);
        }
    }

    hasVideoExtension(filename) {
        const videoExtensions = ['.mp4', '.webm', '.ogg', '.mov', '.avi', '.wmv', '.3gp', '.flv', '.ts'];
        const extension = filename.toLowerCase().substring(filename.lastIndexOf('.'));
        return videoExtensions.includes(extension);
    }

    async getMediaDuration(url, isVideo) {
        return new Promise((resolve) => {
            const element = isVideo ? document.createElement('video') : document.createElement('audio');
            
            const cleanup = () => {
                element.removeEventListener('loadedmetadata', onLoaded);
                element.removeEventListener('error', onError);
                if (element.src) {
                    element.src = '';
                }
            };

            const onLoaded = () => {
                const duration = element.duration;
                cleanup();
                if (duration && !isNaN(duration) && isFinite(duration)) {
                    const minutes = Math.floor(duration / 60).toString().padStart(2, '0');
                    const seconds = Math.floor(duration % 60).toString().padStart(2, '0');
                    resolve(`${minutes}:${seconds}`);
                } else {
                    resolve('--:--');
                }
            };

            const onError = () => {
                cleanup();
                resolve('--:--');
            };

            element.addEventListener('loadedmetadata', onLoaded);
            element.addEventListener('error', onError);
            
            // Set a timeout to avoid hanging
            setTimeout(() => {
                cleanup();
                resolve('--:--');
            }, 5000);
            
            element.src = url;
        });
    }

    showUploadProgress(current, total, filename) {
        this.uploadProgress.style.display = 'block';
        this.progressText.textContent = `Processing ${current} of ${total}: ${filename}`;
        
        const percentage = (current / total) * 100;
        this.progressFill.style.width = `${percentage}%`;
    }

    async simulateUploadProgress() {
        // Simulate processing time
        await new Promise(resolve => setTimeout(resolve, 500));
    }

    hideUploadProgress() {
        setTimeout(() => {
            this.uploadProgress.style.display = 'none';
            this.progressFill.style.width = '0%';
        }, 1000);
    }

    handleFilterChange(event) {
        // Update active filter button
        this.filterButtons.forEach(btn => btn.classList.remove('active'));
        event.target.classList.add('active');
        
        this.currentFilter = event.target.dataset.filter;
        this.updateRecordingsList();
    }

    getFilteredRecordings() {
        switch (this.currentFilter) {
            case 'recorded':
                return this.recordings.filter(r => r.source === 'recorded');
            case 'uploaded':
                return this.recordings.filter(r => r.source === 'uploaded');
            default:
                return this.recordings;
        }
    }

    updateRecordingsList() {
        if (!this.recordingsList) return;
        
        if (this.recordings.length === 0) {
            this.recordingsList.innerHTML = `
                <div class="no-recordings" style="text-align: center; padding: 40px; color: var(--text-gray);">
                    <div style="font-size: 3rem; margin-bottom: 15px;">📁</div>
                    <h3>No recordings yet</h3>
                    <p>Start recording to see your files here</p>
                </div>
            `;
            return;
        }

        this.recordingsList.innerHTML = '';

        this.recordings.forEach(recording => {
            const item = this.createRecordingItem(recording);
            this.recordingsList.appendChild(item);
        });
    }

    setupWatermark() {
        this.watermarkElement = document.getElementById('recordingWatermark');
    }

    showWatermark() {
        if (this.watermarkElement) {
            this.watermarkElement.classList.add('visible');
        }
    }

    hideWatermark() {
        if (this.watermarkElement) {
            this.watermarkElement.classList.remove('visible');
        }
    }

    updateUploadAreaAccess() {
        const canUpload = this.authManager.canAccessFeature('upload');
        const uploadContent = this.uploadArea.querySelector('.upload-content');
        
        if (!canUpload) {
            uploadContent.innerHTML = `
                <div class="upload-icon">🔒</div>
                <h3>Premium Feature</h3>
                <p>File upload is available for registered users only</p>
                <button type="button" class="btn upload-btn" onclick="authManager.switchToLogin(); authManager.showLoginPortal();">
                    <span class="icon">👤</span>
                    Sign In to Upload
                </button>
            `;
            this.uploadArea.style.opacity = '0.7';
        }
    }

    createRecordingItem(recording) {
        const item = document.createElement('div');
        item.className = 'library-item';
        
        const typeIcon = recording.type === 'video' ? '🎥' : '�';
        const displayName = recording.name || `${recording.type} recording`;
        
        item.innerHTML = `
            <div class="library-item-header">
                <div class="item-icon">${typeIcon}</div>
                <div class="item-info">
                    <div class="item-title">${displayName}</div>
                    <div class="item-meta">${recording.timestamp.toLocaleDateString()} • ${recording.duration} • ${recording.size}</div>
                </div>
                <div class="item-actions">
                    <button class="action-btn" onclick="recorder.selectForTranscription('${recording.id}')" title="Select for transcription">
                        🎯
                    </button>
                    <button class="action-btn" onclick="recorder.playRecording('${recording.id}')" title="Play">
                        ▶️
                    </button>
                    <button class="action-btn" onclick="recorder.downloadRecording('${recording.id}')" title="Download">
                        📥
                    </button>
                    <button class="action-btn delete" onclick="recorder.deleteRecording('${recording.id}')" title="Delete">
                        �️
                    </button>
                </div>
            </div>
        `;
        return item;
    }

    selectForTranscription(recordingId) {
        const recording = this.recordings.find(r => r.id == recordingId);
        if (!recording) return;

        this.currentRecordingForTranscription = recording;
        this.enableTranscription();
        
        // Show visual feedback
        const items = document.querySelectorAll('.library-item');
        items.forEach(item => item.classList.remove('selected'));
        
        const selectedItem = [...items].find(item => 
            item.querySelector('.action-btn[onclick*="selectForTranscription"]')
                ?.getAttribute('onclick')?.includes(recordingId)
        );
        if (selectedItem) {
            selectedItem.classList.add('selected');
        }
        
        this.showSuccess(`Selected "${recording.name}" for transcription`);
    }

    playRecording(recordingId) {
        const recording = this.recordings.find(r => r.id == recordingId);
        if (!recording) return;

        // Create a modal for playback
        const modal = document.createElement('div');
        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0,0,0,0.8);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 1000;
        `;

        const content = document.createElement('div');
        content.style.cssText = `
            background: white;
            padding: 20px;
            border-radius: 15px;
            max-width: 90%;
            max-height: 90%;
        `;

        if (recording.type === 'video') {
            content.innerHTML = `
                <video controls autoplay style="width: 100%; max-width: 600px; border-radius: 10px;">
                    <source src="${recording.url}" type="video/webm">
                </video>
                <br><br>
                <button onclick="this.closest('[style*=\"position: fixed\"]').remove()" 
                        style="padding: 10px 20px; background: #ff4757; color: white; border: none; border-radius: 5px; cursor: pointer;">
                    Close
                </button>
            `;
        } else {
            content.innerHTML = `
                <audio controls autoplay style="width: 100%; max-width: 400px;">
                    <source src="${recording.url}" type="audio/webm">
                </audio>
                <br><br>
                <button onclick="this.closest('[style*=\"position: fixed\"]').remove()" 
                        style="padding: 10px 20px; background: #ff4757; color: white; border: none; border-radius: 5px; cursor: pointer;">
                    Close
                </button>
            `;
        }

        modal.appendChild(content);
        document.body.appendChild(modal);

        // Close on click outside
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.remove();
            }
        });
    }

    downloadRecording(recordingId) {
        const recording = this.recordings.find(r => r.id == recordingId);
        if (!recording) return;

        const link = document.createElement('a');
        link.href = recording.url;
        
        // Use original filename for uploaded files, generate name for recorded files
        if (recording.source === 'uploaded' && recording.originalFile) {
            link.download = recording.originalFile.name;
        } else {
            const extension = recording.source === 'recorded' ? 'webm' : 
                             (recording.originalFile ? recording.originalFile.name.split('.').pop() : 'webm');
            link.download = `${recording.name || recording.type + '_recording'}_${recording.timestamp.toISOString().slice(0,19).replace(/:/g, '-')}.${extension}`;
        }
        
        link.click();
    }

    deleteRecording(recordingId) {
        if (confirm('Are you sure you want to delete this recording?')) {
            const index = this.recordings.findIndex(r => r.id == recordingId);
            if (index > -1) {
                // Revoke the object URL to free memory
                URL.revokeObjectURL(this.recordings[index].url);
                this.recordings.splice(index, 1);
                this.updateRecordingsList();
                this.saveRecordingsToStorage();
                this.updateStatus('Recording deleted');
            }
        }
    }

    saveRecordingsToStorage() {
        // Save recording metadata to localStorage (not the actual blobs)
        const recordingsMetadata = this.recordings.map(recording => ({
            id: recording.id,
            type: recording.type,
            timestamp: recording.timestamp,
            duration: recording.duration,
            size: recording.size
        }));
        localStorage.setItem('videoAudioRecordings', JSON.stringify(recordingsMetadata));
    }

    loadSavedRecordings() {
        // Load recording metadata from localStorage
        const saved = localStorage.getItem('videoAudioRecordings');
        if (saved) {
            try {
                const recordingsMetadata = JSON.parse(saved);
                // Note: We can't restore the actual recording blobs from localStorage
                // This would typically require a backend storage solution
                console.log('Found saved recordings metadata:', recordingsMetadata.length);
            } catch (error) {
                console.error('Error loading saved recordings:', error);
            }
        }
    }

    updateStatus(message, isRecording = false) {
        if (this.statusText) {
            this.statusText.textContent = message;
            if (isRecording) {
                this.statusText.classList.add('recording');
            } else {
                this.statusText.classList.remove('recording');
            }
        }
    }

    showSuccess(message) {
        this.authManager.showSuccess(message);
    }

    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    showError(message) {
        // Create a simple error notification
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #ff4757;
            color: white;
            padding: 15px 20px;
            border-radius: 10px;
            z-index: 1000;
            max-width: 300px;
            box-shadow: 0 5px 15px rgba(0,0,0,0.2);
        `;
        notification.textContent = message;
        document.body.appendChild(notification);

        setTimeout(() => {
            notification.remove();
        }, 5000);
    }

    // Cleanup method
    destroy() {
        if (this.stream) {
            this.stream.getTracks().forEach(track => track.stop());
        }
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
        }
        // Revoke all object URLs
        this.recordings.forEach(recording => {
            URL.revokeObjectURL(recording.url);
        });
    }
}

// Initialize the app when the page loads
let recorder;
let authManager;

document.addEventListener('DOMContentLoaded', () => {
    // Initialize authentication first
    authManager = new AuthManager();
    
    // Initialize recorder after auth (will be called when user logs in or continues as guest)
    // We'll create a global function to initialize the recorder
    window.initializeRecorder = () => {
        if (!recorder) {
            recorder = new VideoAudioRecorder(authManager);
        }
    };
    
    // If main app is already visible (user was already logged in), initialize recorder
    if (document.getElementById('mainApp').style.display !== 'none') {
        initializeRecorder();
    }
});

// Add CSS animations for notifications
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from {
            opacity: 0;
            transform: translateX(100%);
        }
        to {
            opacity: 1;
            transform: translateX(0);
        }
    }
    
    @keyframes slideOutRight {
        from {
            opacity: 1;
            transform: translateX(0);
        }
        to {
            opacity: 0;
            transform: translateX(100%);
        }
    }
`;
document.head.appendChild(style);

// Cleanup on page unload
window.addEventListener('beforeunload', () => {
    if (recorder) {
        recorder.destroy();
    }
});