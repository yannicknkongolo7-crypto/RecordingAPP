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
        
        this.initializeElements();
        this.bindEvents();
        this.loadSavedRecordings();
        this.setupWatermark();
    }

    initializeElements() {
        // Get DOM elements
        this.startBtn = document.getElementById('startBtn');
        this.stopBtn = document.getElementById('stopBtn');
        this.resetBtn = document.getElementById('resetBtn');
        this.preview = document.getElementById('preview');
        this.status = document.getElementById('status').querySelector('.status-text');
        this.timer = document.getElementById('timer');
        this.recordingsList = document.getElementById('recordingsList');
        this.recordingsSection = document.getElementById('recordingsSection');
        this.audioVisualizer = document.getElementById('audioVisualizer');
        this.recordTypeRadios = document.querySelectorAll('input[name="recordType"]');
        
        // Upload elements
        this.uploadArea = document.getElementById('uploadArea');
        this.fileInput = document.getElementById('fileInput');
        this.uploadProgress = document.getElementById('uploadProgress');
        this.progressFill = document.getElementById('progressFill');
        this.progressText = document.getElementById('progressText');
        this.filterButtons = document.querySelectorAll('.filter-btn');
        
        // Current filter state
        this.currentFilter = 'all';
    }

    bindEvents() {
        // Button events
        this.startBtn.addEventListener('click', () => this.startRecording());
        this.stopBtn.addEventListener('click', () => this.stopRecording());
        this.resetBtn.addEventListener('click', () => this.reset());

        // Recording type change
        this.recordTypeRadios.forEach(radio => {
            radio.addEventListener('change', (e) => {
                this.recordType = e.target.value;
                this.updatePreview();
            });
        });

        // File upload events
        this.fileInput.addEventListener('change', (e) => this.handleFileSelect(e));
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
        
        // Update upload area based on user permissions
        this.updateUploadAreaAccess();
        
        // Filter events
        this.filterButtons.forEach(btn => {
            btn.addEventListener('click', (e) => this.handleFilterChange(e));
        });

        // Initialize preview
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
                this.preview.style.display = 'block';
                this.audioVisualizer.classList.remove('active');
                
                // Get video + audio stream
                this.stream = await navigator.mediaDevices.getUserMedia({
                    video: { width: 1280, height: 720 },
                    audio: true
                });
                this.preview.srcObject = this.stream;
            } else {
                // Hide video preview, show audio visualizer
                this.preview.style.display = 'none';
                this.audioVisualizer.classList.add('active');
                
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
        if (!this.stream) return;

        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const source = audioContext.createMediaStreamSource(this.stream);
        const analyser = audioContext.createAnalyser();
        
        analyser.fftSize = 256;
        const bufferLength = analyser.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);
        
        source.connect(analyser);
        
        const bars = this.audioVisualizer.querySelectorAll('.bar');
        
        const animate = () => {
            if (this.recordType === 'audio') {
                requestAnimationFrame(animate);
                
                analyser.getByteFrequencyData(dataArray);
                
                bars.forEach((bar, index) => {
                    const value = dataArray[index * 4] || 0;
                    const height = Math.max(10, (value / 255) * 60);
                    bar.style.height = `${height}px`;
                });
            }
        };
        
        animate();
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
        
        this.updateStatus(`${this.recordType === 'video' ? 'Video' : 'Audio'} recording saved!`);
        
        // Clear recorded chunks
        this.recordedChunks = [];
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
        const filteredRecordings = this.getFilteredRecordings();
        
        if (this.recordings.length === 0) {
            this.recordingsSection.style.display = 'none';
            return;
        }

        this.recordingsSection.style.display = 'block';
        this.recordingsList.innerHTML = '';

        if (filteredRecordings.length === 0) {
            const noResults = document.createElement('div');
            noResults.className = 'no-results';
            noResults.style.cssText = 'text-align: center; padding: 40px; color: #6c757d;';
            noResults.innerHTML = `
                <div style="font-size: 3rem; margin-bottom: 15px;">📁</div>
                <h3>No ${this.currentFilter === 'all' ? '' : this.currentFilter} files found</h3>
                <p>Try changing the filter or ${this.currentFilter === 'uploaded' ? 'upload some files' : 'record something new'}</p>
            `;
            this.recordingsList.appendChild(noResults);
            return;
        }

        filteredRecordings.forEach(recording => {
            const item = this.createRecordingItem(recording);
            this.recordingsList.appendChild(item);
        });

        // Hide progress after updating list
        if (this.currentFilter === 'all' || this.currentFilter === 'uploaded') {
            this.hideUploadProgress();
        }
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
        item.className = 'recording-item';
        
        const typeIcon = recording.type === 'video' ? '📹' : '🎤';
        const sourceLabel = recording.source === 'uploaded' ? 'Uploaded' : 'Recorded';
        const displayName = recording.name || `${recording.type} ${sourceLabel.toLowerCase()}`;
        
        item.innerHTML = `
            <div class="recording-info">
                <div class="recording-title">
                    ${typeIcon} ${displayName}
                    <span class="recording-source ${recording.source}">${sourceLabel}</span>
                </div>
                <div class="recording-meta">
                    ${recording.timestamp.toLocaleString()} • 
                    Duration: ${recording.duration} • 
                    Size: ${recording.size}
                </div>
            </div>
            <div class="recording-actions">
                <button class="play-btn" onclick="recorder.playRecording('${recording.id}')">
                    ▶️ Play
                </button>
                <button class="download-btn" onclick="recorder.downloadRecording('${recording.id}')">
                    💾 Download
                </button>
                <button class="delete-btn" onclick="recorder.deleteRecording('${recording.id}')">
                    🗑️ Delete
                </button>
            </div>
        `;
        return item;
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
        this.status.textContent = message;
        if (isRecording) {
            this.status.classList.add('recording');
        } else {
            this.status.classList.remove('recording');
        }
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