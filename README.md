# 📹 Video & Audio Recorder

A modern, browser-based application for recording video and audio directly in your web browser. No installations required - just open and start recording!

## ✨ Features

- **Video Recording**: Record video with audio using your camera and microphone
- **Audio-Only Recording**: Record audio-only with a beautiful visualizer
- **Live Preview**: See yourself or visualize audio levels while recording
- **Real-time Timer**: Track recording duration in real-time
- **Playback Controls**: Preview your recordings before downloading
- **Download Support**: Save recordings as WebM files to your device
- **Responsive Design**: Works on desktop, tablet, and mobile devices
- **Modern UI**: Clean, intuitive interface with smooth animations

## 🚀 Getting Started

### Prerequisites

- A modern web browser that supports:
  - MediaRecorder API
  - getUserMedia API
  - Web Audio API (for audio visualization)
  
**Supported Browsers:**
- Chrome 47+
- Firefox 29+
- Safari 14+
- Edge 79+

### Installation

1. **Clone or Download** this repository
2. **Open** `index.html` in your web browser
3. **Allow** camera and microphone permissions when prompted
4. **Start Recording!**

### Using a Local Server (Recommended)

For the best experience, serve the files using a local web server:

```bash
# Using Python 3
python -m http.server 8000

# Using Python 2
python -m SimpleHTTPServer 8000

# Using Node.js (if you have http-server installed)
npx http-server

# Using PHP
php -S localhost:8000
```

Then open `http://localhost:8000` in your browser.

## 📱 How to Use

### 1. Choose Recording Type
- **📹 Video + Audio**: Records both video and audio
- **🎤 Audio Only**: Records audio with a visual waveform display

### 2. Start Recording
- Click the **"Start Recording"** button
- Grant camera/microphone permissions if prompted
- Watch the timer count up as you record

### 3. Stop Recording
- Click **"Stop Recording"** when finished
- Your recording will be automatically processed and saved

### 4. Manage Recordings
- **Play**: Preview your recording in a modal popup
- **Download**: Save the recording file to your device
- **Delete**: Remove unwanted recordings

## 🛠️ Technical Details

### File Formats
- **Video**: WebM format with VP9 codec (fallback to default WebM)
- **Audio**: WebM format with Opus codec (fallback to default WebM)

### Browser Permissions
The app requires the following permissions:
- **Camera Access**: For video recording
- **Microphone Access**: For audio recording (both video and audio-only modes)

### Storage
- Recordings are stored temporarily in browser memory
- Recording metadata is saved to localStorage
- For persistent storage, download recordings to your device

### Performance Notes
- Recording quality adapts to your device capabilities
- Default video resolution: 1280x720 (HD)
- Audio is recorded at the browser's default quality settings

## 🔧 Customization

### Video Quality Settings
To modify video quality, edit the `getUserMedia` constraints in `script.js`:

```javascript
this.stream = await navigator.mediaDevices.getUserMedia({
    video: { 
        width: 1920,    // Desired width
        height: 1080,   // Desired height
        frameRate: 30   // Frame rate
    },
    audio: true
});
```

### Audio Settings
To modify audio settings:

```javascript
this.stream = await navigator.mediaDevices.getUserMedia({
    audio: {
        sampleRate: 48000,      // Sample rate
        channelCount: 2,        // Stereo
        echoCancellation: true, // Echo cancellation
        noiseSuppression: true  // Noise suppression
    }
});
```

## 🎨 UI Customization

### Colors and Themes
Edit the CSS variables in `styles.css` to customize colors:

```css
:root {
    --primary-color: #4facfe;
    --secondary-color: #00f2fe;
    --accent-color: #ff4757;
    --background-gradient: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}
```

### Layout Modifications
The layout is fully responsive and uses Flexbox. Modify the `.container`, `.controls`, and other classes to adjust the layout.

## 🔒 Privacy & Security

- **No Data Collection**: This app runs entirely in your browser
- **No Server Communication**: Recordings never leave your device unless you download them
- **Local Storage Only**: Only recording metadata is stored locally
- **Secure**: Uses modern web APIs with proper error handling

## 🐛 Troubleshooting

### Camera/Microphone Not Working
1. **Check Permissions**: Ensure you've granted camera/microphone access
2. **HTTPS Required**: Some browsers require HTTPS for media access in production
3. **Browser Compatibility**: Update to a supported browser version
4. **Device Issues**: Check if other apps can access your camera/microphone

### Recording Issues
1. **Codec Support**: The app will fallback to supported codecs automatically
2. **Storage Space**: Ensure you have enough disk space for recordings
3. **Memory Issues**: Close other tabs if experiencing performance problems

### Common Error Messages
- **"Could not access camera/microphone"**: Grant permissions and refresh
- **"Recording error occurred"**: Try refreshing the page and starting again
- **"No recording data to save"**: The recording may have been too short

## 🌐 Deployment

### GitHub Pages
1. Push your code to a GitHub repository
2. Enable GitHub Pages in repository settings
3. Your app will be available at `https://yourusername.github.io/repository-name`

### Other Hosting Platforms
- **Netlify**: Drag and drop the files or connect your GitHub repo
- **Vercel**: Deploy directly from GitHub
- **Firebase Hosting**: Use Firebase CLI to deploy

### HTTPS Requirement
For production deployment, ensure your site uses HTTPS, as many browsers require secure connections for camera/microphone access.

## 📄 File Structure

```
RecordVideo/
├── index.html          # Main HTML file
├── styles.css          # CSS styles and animations
├── script.js           # JavaScript functionality
└── README.md           # This documentation
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is open source and available under the [MIT License](LICENSE).

## 🙏 Acknowledgments

- Built with modern Web APIs (MediaRecorder, getUserMedia, Web Audio)
- Styled with CSS3 animations and gradients
- Icons from Unicode emoji set
- Responsive design patterns

## 📞 Support

If you encounter any issues or have questions:
1. Check the troubleshooting section above
2. Review browser console for error messages
3. Ensure your browser supports the required APIs
4. Try the app in a different browser

---

**Happy Recording! 🎬**