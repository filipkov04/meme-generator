// Canvas and image setup
const canvas = document.getElementById('meme-canvas');
const ctx = canvas.getContext('2d');
const imageUpload = document.getElementById('image-upload');
const addTextBtn = document.getElementById('add-text-btn');
const downloadBtn = document.getElementById('download-btn');
const fontSizeSlider = document.getElementById('font-size');
const fontSizeValue = document.getElementById('font-size-value');
const textColorPicker = document.getElementById('text-color');
const fontFamilySelect = document.getElementById('font-family');
const textBoxesList = document.getElementById('text-boxes-list');
const canvasHint = document.getElementById('canvas-hint');
const templatesGrid = document.getElementById('templates-grid');

// State
let currentImage = null;
let textBoxes = [];
let fontSize = 40;
let textColor = '#ffffff';
let fontFamily = 'Impact';
let isDragging = false;
let dragTarget = null;
let dragOffset = { x: 0, y: 0 };

// Template images from Assets folder
// Note: Filenames contain Unicode narrow no-break space (\u202f) instead of regular space
const templateImages = [
    "Assets/Screenshot 2025-11-19 at 11.28.30\u202fAM.png",
    "Assets/Screenshot 2025-11-19 at 11.32.43\u202fAM.png",
    "Assets/Screenshot 2025-11-19 at 11.38.25\u202fAM.png",
    "Assets/Screenshot 2025-11-19 at 11.43.04\u202fAM.png",
    "Assets/Screenshot 2025-11-19 at 11.43.08\u202fAM.png",
    "Assets/Screenshot 2025-11-19 at 11.46.36\u202fAM.png",
    "Assets/Screenshot 2025-11-19 at 11.55.18\u202fAM.png",
    "Assets/Screenshot 2025-11-19 at 12.48.47\u202fPM.png",
    "Assets/Screenshot 2025-11-19 at 2.37.27\u202fPM.png",
    "Assets/Screenshot 2025-11-19 at 2.37.30\u202fPM.png",
    "Assets/Screenshot 2025-11-19 at 5.18.52\u202fPM.png",
    "Assets/Screenshot 2025-11-19 at 5.20.29\u202fPM.png"
];

// Initialize canvas
function initCanvas() {
    canvas.width = 800;
    canvas.height = 600;
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
}

// Function to load an image (used by both upload and template selection)
function loadImage(src) {
    const img = new Image();
    img.onload = function() {
        currentImage = img;
        resizeCanvasToImage(img);
        canvasHint.style.display = 'none';
        drawCanvas();
    };
    img.onerror = function() {
        console.error('Failed to load image:', src);
        alert('Failed to load image. Please check the file path.\n\nPath: ' + src);
    };
    // If it's a data URL, use as-is. Otherwise, src should already be encoded
    img.src = src.startsWith('data:') ? src : src;
}

// Load image from file
imageUpload.addEventListener('change', function(e) {
    const file = e.target.files[0];
    if (file && file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = function(event) {
            // Clear active template state
            document.querySelectorAll('.template-item').forEach(item => {
                item.classList.remove('active');
            });
            loadImage(event.target.result);
        };
        reader.readAsDataURL(file);
    }
});

// Resize canvas to fit image while maintaining aspect ratio
function resizeCanvasToImage(img) {
    const maxWidth = 800;
    const maxHeight = 600;
    let width = img.width;
    let height = img.height;

    if (width > maxWidth) {
        height = (height * maxWidth) / width;
        width = maxWidth;
    }
    if (height > maxHeight) {
        width = (width * maxHeight) / height;
        height = maxHeight;
    }

    canvas.width = width;
    canvas.height = height;
}

// Add new text box
addTextBtn.addEventListener('click', function() {
    const textBox = {
        id: Date.now(),
        text: 'Your text here',
        x: canvas.width / 2,
        y: canvas.height / 2,
        fontSize: fontSize
    };
    textBoxes.push(textBox);
    createTextBoxUI(textBox);
    drawCanvas();
});

// Create UI for a text box
function createTextBoxUI(textBox) {
    const item = document.createElement('div');
    item.className = 'text-box-item';
    item.dataset.id = textBox.id;

    const header = document.createElement('div');
    header.className = 'text-box-header';

    const label = document.createElement('span');
    label.className = 'text-box-label';
    label.textContent = `Text Box ${textBoxes.length}`;

    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'btn btn-delete';
    deleteBtn.textContent = 'Delete';
    deleteBtn.addEventListener('click', function() {
        textBoxes = textBoxes.filter(tb => tb.id !== textBox.id);
        item.remove();
        drawCanvas();
    });

    header.appendChild(label);
    header.appendChild(deleteBtn);

    const input = document.createElement('input');
    input.type = 'text';
    input.value = textBox.text;
    input.placeholder = 'Enter text...';
    input.addEventListener('input', function() {
        textBox.text = input.value;
        drawCanvas();
    });

    item.appendChild(header);
    item.appendChild(input);
    textBoxesList.appendChild(item);
}

// Font size slider
fontSizeSlider.addEventListener('input', function() {
    fontSize = parseInt(this.value);
    fontSizeValue.textContent = fontSize;
    // Update all text boxes with new font size
    textBoxes.forEach(textBox => {
        textBox.fontSize = fontSize;
    });
    drawCanvas();
});

// Text color picker
textColorPicker.addEventListener('input', function() {
    textColor = this.value;
    drawCanvas();
});

// Font family selector
fontFamilySelect.addEventListener('change', function() {
    fontFamily = this.value;
    drawCanvas();
});

// Mouse events for dragging
canvas.addEventListener('mousedown', function(e) {
    if (!currentImage) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Check if clicking on a text box
    for (let i = textBoxes.length - 1; i >= 0; i--) {
        const textBox = textBoxes[i];
        const metrics = ctx.measureText(textBox.text);
        const textWidth = metrics.width;
        const textHeight = textBox.fontSize;

        // Approximate bounding box (centered at x, y)
        const left = textBox.x - textWidth / 2;
        const right = textBox.x + textWidth / 2;
        const top = textBox.y - textHeight / 2;
        const bottom = textBox.y + textHeight / 2;

        if (x >= left && x <= right && y >= top && y <= bottom) {
            isDragging = true;
            dragTarget = textBox;
            dragOffset.x = x - textBox.x;
            dragOffset.y = y - textBox.y;
            canvas.style.cursor = 'grabbing';
            break;
        }
    }
});

canvas.addEventListener('mousemove', function(e) {
    if (isDragging && dragTarget) {
        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        dragTarget.x = x - dragOffset.x;
        dragTarget.y = y - dragOffset.y;

        // Keep text within canvas bounds
        dragTarget.x = Math.max(0, Math.min(canvas.width, dragTarget.x));
        dragTarget.y = Math.max(0, Math.min(canvas.height, dragTarget.y));

        drawCanvas();
    } else if (currentImage) {
        // Check if hovering over text for cursor feedback
        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        let hovering = false;
        for (let i = textBoxes.length - 1; i >= 0; i--) {
            const textBox = textBoxes[i];
            const metrics = ctx.measureText(textBox.text);
            const textWidth = metrics.width;
            const textHeight = textBox.fontSize;

            const left = textBox.x - textWidth / 2;
            const right = textBox.x + textWidth / 2;
            const top = textBox.y - textHeight / 2;
            const bottom = textBox.y + textHeight / 2;

            if (x >= left && x <= right && y >= top && y <= bottom) {
                hovering = true;
                break;
            }
        }
        canvas.style.cursor = hovering ? 'grab' : 'default';
    }
});

canvas.addEventListener('mouseup', function() {
    if (isDragging) {
        isDragging = false;
        dragTarget = null;
        canvas.style.cursor = 'default';
    }
});

canvas.addEventListener('mouseleave', function() {
    if (isDragging) {
        isDragging = false;
        dragTarget = null;
        canvas.style.cursor = 'default';
    }
});

// Draw everything on canvas
function drawCanvas() {
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw image if available
    if (currentImage) {
        ctx.drawImage(currentImage, 0, 0, canvas.width, canvas.height);
    } else {
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    // Draw all text boxes
    textBoxes.forEach(textBox => {
        ctx.save();
        ctx.font = `${textBox.fontSize}px ${fontFamily}`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        // Draw black stroke (border) - thicker border
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = Math.max(6, textBox.fontSize / 8);
        ctx.lineJoin = 'round';
        ctx.miterLimit = 2;
        ctx.strokeText(textBox.text, textBox.x, textBox.y);

        // Draw text fill with selected color
        ctx.fillStyle = textColor;
        ctx.fillText(textBox.text, textBox.x, textBox.y);

        ctx.restore();
    });
}

// Download meme
downloadBtn.addEventListener('click', function() {
    if (!currentImage && textBoxes.length === 0) {
        alert('Please upload an image and add some text first!');
        return;
    }

    // Create a temporary canvas for high-quality download
    const downloadCanvas = document.createElement('canvas');
    const downloadCtx = downloadCanvas.getContext('2d');

    // Use original image dimensions if available, otherwise use current canvas size
    if (currentImage) {
        downloadCanvas.width = currentImage.width;
        downloadCanvas.height = currentImage.height;

        // Draw image at full resolution
        downloadCtx.drawImage(currentImage, 0, 0);

        // Scale text positions and sizes proportionally
        const scaleX = currentImage.width / canvas.width;
        const scaleY = currentImage.height / canvas.height;

        textBoxes.forEach(textBox => {
            downloadCtx.save();
            const scaledFontSize = textBox.fontSize * Math.min(scaleX, scaleY);
            downloadCtx.font = `${scaledFontSize}px ${fontFamily}`;
            downloadCtx.textAlign = 'center';
            downloadCtx.textBaseline = 'middle';

            const scaledX = textBox.x * scaleX;
            const scaledY = textBox.y * scaleY;

            // Draw black stroke - thicker border
            downloadCtx.strokeStyle = '#000000';
            downloadCtx.lineWidth = Math.max(6, scaledFontSize / 8);
            downloadCtx.lineJoin = 'round';
            downloadCtx.miterLimit = 2;
            downloadCtx.strokeText(textBox.text, scaledX, scaledY);

            // Draw text fill with selected color
            downloadCtx.fillStyle = textColor;
            downloadCtx.fillText(textBox.text, scaledX, scaledY);

            downloadCtx.restore();
        });
    } else {
        // No image, just use current canvas
        downloadCanvas.width = canvas.width;
        downloadCanvas.height = canvas.height;
        downloadCtx.drawImage(canvas, 0, 0);
    }

    // Convert to blob and download
    downloadCanvas.toBlob(function(blob) {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `meme-${Date.now()}.png`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    });
});

// Audio recording setup
const recordBtn = document.getElementById('record-btn');
const stopRecordBtn = document.getElementById('stop-record-btn');
const playAudioBtn = document.getElementById('play-audio-btn');
const downloadAudioBtn = document.getElementById('download-audio-btn');
const audioCanvas = document.getElementById('audio-canvas');
const audioCtx = audioCanvas.getContext('2d');
const recordingIndicator = document.getElementById('recording-indicator');
const audioStatus = document.getElementById('audio-status');
const audioPlayer = document.getElementById('audio-player');
const testMicBtn = document.getElementById('test-mic-btn');
const testMicText = document.getElementById('test-mic-text');
const microphoneSelect = document.getElementById('microphone-select');
const volumeThresholdSlider = document.getElementById('volume-threshold');
const thresholdValue = document.getElementById('threshold-value');
const volumeBar = document.getElementById('volume-bar');
const thresholdIndicator = document.getElementById('threshold-indicator');
const volumeValue = document.getElementById('volume-value');

let mediaRecorder = null;
let audioChunks = [];
let audioStream = null;
let audioBlob = null;
let isRecording = false;
let animationFrameId = null;
let analyser = null;
let dataArray = null;
let testMicStream = null;
let testMicAnalyser = null;
let testMicDataArray = null;
let testMicAnimationId = null;
let isTestingMic = false;
let volumeThreshold = 50;
let audioDevices = [];
let selectedDeviceId = null;

// Initialize audio canvas
audioCanvas.width = 280;
audioCanvas.height = 80;

// Audio recording functions
async function startRecording() {
    try {
        // Stop mic test if running
        if (isTestingMic) {
            stopMicTest();
        }
        
        const constraints = {
            audio: selectedDeviceId ? { deviceId: { exact: selectedDeviceId } } : true
        };
        
        audioStream = await navigator.mediaDevices.getUserMedia(constraints);
        
        // Set up audio visualization
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        analyser = audioContext.createAnalyser();
        const source = audioContext.createMediaStreamSource(audioStream);
        source.connect(analyser);
        
        analyser.fftSize = 256;
        const bufferLength = analyser.frequencyBinCount;
        dataArray = new Uint8Array(bufferLength);
        
        // Start visualization
        visualizeAudio();
        
        // Set up MediaRecorder with supported MIME type
        let options = { mimeType: 'audio/webm' };
        
        // Check for supported MIME types
        if (!MediaRecorder.isTypeSupported('audio/webm')) {
            if (MediaRecorder.isTypeSupported('audio/webm;codecs=opus')) {
                options.mimeType = 'audio/webm;codecs=opus';
            } else if (MediaRecorder.isTypeSupported('audio/mp4')) {
                options.mimeType = 'audio/mp4';
            } else {
                options = {}; // Use default
            }
        }
        
        mediaRecorder = new MediaRecorder(audioStream, options);
        audioChunks = [];
        
        mediaRecorder.ondataavailable = (event) => {
            if (event.data.size > 0) {
                audioChunks.push(event.data);
            }
        };
        
        mediaRecorder.onstop = () => {
            // Determine MIME type from recorder or default to webm
            const mimeType = mediaRecorder.mimeType || 'audio/webm';
            audioBlob = new Blob(audioChunks, { type: mimeType });
            const audioUrl = URL.createObjectURL(audioBlob);
            
            // Set up audio player
            audioPlayer.src = audioUrl;
            audioPlayer.load(); // Reload the audio element
            
            // Enable play and download buttons
            playAudioBtn.disabled = false;
            downloadAudioBtn.disabled = false;
            
            audioStatus.textContent = 'Recording complete!';
            recordingIndicator.style.display = 'none';
            
            // Stop visualization
            if (animationFrameId) {
                cancelAnimationFrame(animationFrameId);
            }
            clearCanvas();
        };
        
        mediaRecorder.start();
        isRecording = true;
        
        // Update UI
        recordBtn.disabled = true;
        stopRecordBtn.disabled = false;
        recordingIndicator.style.display = 'flex';
        audioStatus.textContent = 'Recording...';
        audioStatus.style.color = 'rgba(245, 101, 101, 0.95)';
        
    } catch (error) {
        console.error('Error accessing microphone:', error);
        audioStatus.textContent = 'Microphone access denied';
        audioStatus.style.color = 'rgba(245, 101, 101, 0.95)';
        alert('Please allow microphone access to record audio.');
    }
}

function stopRecording() {
    if (mediaRecorder && isRecording) {
        mediaRecorder.stop();
        isRecording = false;
        
        // Stop all tracks
        if (audioStream) {
            audioStream.getTracks().forEach(track => track.stop());
        }
        
        // Update UI
        recordBtn.disabled = false;
        stopRecordBtn.disabled = true;
    }
}

function playAudio() {
    if (audioBlob && audioPlayer.src) {
        // Reset audio to beginning
        audioPlayer.currentTime = 0;
        
        // Play audio with error handling
        const playPromise = audioPlayer.play();
        
        if (playPromise !== undefined) {
            playPromise
                .then(() => {
                    audioStatus.textContent = 'Playing audio...';
                    audioStatus.style.color = 'rgba(72, 187, 120, 0.95)';
                    
                    audioPlayer.onended = () => {
                        audioStatus.textContent = 'Playback complete';
                        audioStatus.style.color = 'rgba(255, 255, 255, 0.8)';
                    };
                })
                .catch(error => {
                    console.error('Error playing audio:', error);
                    audioStatus.textContent = 'Error playing audio';
                    audioStatus.style.color = 'rgba(245, 101, 101, 0.95)';
                    alert('Unable to play audio. Please try again.');
                });
        }
    } else {
        audioStatus.textContent = 'No audio to play';
        audioStatus.style.color = 'rgba(245, 101, 101, 0.95)';
    }
}

function downloadAudio() {
    if (audioBlob) {
        const url = URL.createObjectURL(audioBlob);
        const a = document.createElement('a');
        a.href = url;
        
        // Determine file extension based on MIME type
        const mimeType = audioBlob.type || 'audio/webm';
        let extension = 'webm';
        if (mimeType.includes('mp4')) {
            extension = 'mp4';
        } else if (mimeType.includes('ogg')) {
            extension = 'ogg';
        }
        
        a.download = `meme-audio-${Date.now()}.${extension}`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        audioStatus.textContent = 'Audio downloaded!';
        setTimeout(() => {
            audioStatus.textContent = 'Ready to record';
            audioStatus.style.color = 'rgba(255, 255, 255, 0.8)';
        }, 2000);
    }
}

function visualizeAudio() {
    if (!analyser || !dataArray) return;
    
    analyser.getByteFrequencyData(dataArray);
    
    audioCtx.fillStyle = 'rgba(255, 255, 255, 0.1)';
    audioCtx.fillRect(0, 0, audioCanvas.width, audioCanvas.height);
    
    const barWidth = (audioCanvas.width / dataArray.length) * 2.5;
    let barHeight;
    let x = 0;
    
    for (let i = 0; i < dataArray.length; i++) {
        barHeight = (dataArray[i] / 255) * audioCanvas.height;
        
        const gradient = audioCtx.createLinearGradient(0, audioCanvas.height - barHeight, 0, audioCanvas.height);
        gradient.addColorStop(0, 'rgba(102, 126, 234, 0.8)');
        gradient.addColorStop(1, 'rgba(118, 75, 162, 0.8)');
        
        audioCtx.fillStyle = gradient;
        audioCtx.fillRect(x, audioCanvas.height - barHeight, barWidth - 1, barHeight);
        
        x += barWidth + 1;
    }
    
    animationFrameId = requestAnimationFrame(visualizeAudio);
}

function clearCanvas() {
    audioCtx.fillStyle = 'rgba(255, 255, 255, 0.1)';
    audioCtx.fillRect(0, 0, audioCanvas.width, audioCanvas.height);
}

// Get available audio devices
async function getAudioDevices() {
    try {
        // Request permission first to get device labels
        await navigator.mediaDevices.getUserMedia({ audio: true });
        
        const devices = await navigator.mediaDevices.enumerateDevices();
        audioDevices = devices.filter(device => device.kind === 'audioinput');
        
        // Clear existing options except the first one
        microphoneSelect.innerHTML = '<option value="">Select microphone...</option>';
        
        // Add devices to dropdown
        audioDevices.forEach((device, index) => {
            const option = document.createElement('option');
            option.value = device.deviceId;
            option.textContent = device.label || `Microphone ${index + 1}`;
            microphoneSelect.appendChild(option);
        });
        
        // Select first device by default if available
        if (audioDevices.length > 0 && !selectedDeviceId) {
            selectedDeviceId = audioDevices[0].deviceId;
            microphoneSelect.value = selectedDeviceId;
        }
        
    } catch (error) {
        console.error('Error getting audio devices:', error);
    }
}

// Microphone selection handler
microphoneSelect.addEventListener('change', function() {
    selectedDeviceId = this.value;
    
    // If testing or recording, restart with new device
    if (isTestingMic) {
        stopMicTest();
        setTimeout(() => {
            startMicTest();
        }, 100);
    }
    
    if (isRecording) {
        stopRecording();
        setTimeout(() => {
            startRecording();
        }, 100);
    }
});

// Microphone test functions
async function startMicTest() {
    try {
        const constraints = {
            audio: selectedDeviceId ? { deviceId: { exact: selectedDeviceId } } : true
        };
        
        testMicStream = await navigator.mediaDevices.getUserMedia(constraints);
        
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        testMicAnalyser = audioContext.createAnalyser();
        const source = audioContext.createMediaStreamSource(testMicStream);
        source.connect(testMicAnalyser);
        
        testMicAnalyser.fftSize = 256;
        const bufferLength = testMicAnalyser.frequencyBinCount;
        testMicDataArray = new Uint8Array(bufferLength);
        
        isTestingMic = true;
        testMicBtn.classList.add('active');
        testMicText.textContent = 'Stop Test';
        updateVolumeMeter();
        
    } catch (error) {
        console.error('Error accessing microphone:', error);
        audioStatus.textContent = 'Microphone access denied';
        audioStatus.style.color = 'rgba(245, 101, 101, 0.95)';
        alert('Please allow microphone access to test audio.');
    }
}

function stopMicTest() {
    if (testMicStream) {
        testMicStream.getTracks().forEach(track => track.stop());
        testMicStream = null;
    }
    
    if (testMicAnimationId) {
        cancelAnimationFrame(testMicAnimationId);
        testMicAnimationId = null;
    }
    
    isTestingMic = false;
    testMicBtn.classList.remove('active');
    testMicText.textContent = 'Test Microphone';
    volumeBar.style.width = '0%';
    volumeValue.textContent = '0%';
    testMicAnalyser = null;
    testMicDataArray = null;
}

function updateVolumeMeter() {
    if (!isTestingMic || !testMicAnalyser || !testMicDataArray) {
        return;
    }
    
    testMicAnalyser.getByteFrequencyData(testMicDataArray);
    
    // Calculate average volume
    let sum = 0;
    for (let i = 0; i < testMicDataArray.length; i++) {
        sum += testMicDataArray[i];
    }
    const average = sum / testMicDataArray.length;
    const volumePercent = Math.min(100, Math.round((average / 255) * 100));
    
    // Update volume bar
    volumeBar.style.width = volumePercent + '%';
    volumeValue.textContent = volumePercent + '%';
    
    // Update color based on threshold
    if (volumePercent >= volumeThreshold) {
        volumeBar.style.background = 'linear-gradient(90deg, rgba(72, 187, 120, 0.9), rgba(72, 187, 120, 0.7))';
        volumeBar.style.boxShadow = '0 0 10px rgba(72, 187, 120, 0.5)';
    } else {
        volumeBar.style.background = 'linear-gradient(90deg, rgba(102, 126, 234, 0.9), rgba(118, 75, 162, 0.7))';
        volumeBar.style.boxShadow = 'none';
    }
    
    testMicAnimationId = requestAnimationFrame(updateVolumeMeter);
}

// Threshold slider
volumeThresholdSlider.addEventListener('input', function() {
    volumeThreshold = parseInt(this.value);
    thresholdValue.textContent = volumeThreshold;
    thresholdIndicator.style.left = volumeThreshold + '%';
});

// Test microphone button
testMicBtn.addEventListener('click', function() {
    if (isTestingMic) {
        stopMicTest();
    } else {
        startMicTest();
    }
});

// Event listeners for audio controls
recordBtn.addEventListener('click', startRecording);
stopRecordBtn.addEventListener('click', stopRecording);
playAudioBtn.addEventListener('click', playAudio);
downloadAudioBtn.addEventListener('click', downloadAudio);

// Initialize audio canvas
clearCanvas();

// Initialize threshold indicator position
thresholdIndicator.style.left = volumeThreshold + '%';

// Load audio devices when page loads
getAudioDevices();

// Refresh device list when devices are added/removed
navigator.mediaDevices.addEventListener('devicechange', getAudioDevices);

// ChatGPT Integration
const apiKeyInput = document.getElementById('api-key-input');
const chatInput = document.getElementById('chat-input');
const sendChatBtn = document.getElementById('send-chat-btn');
const chatResponse = document.getElementById('chat-response');
const copyResponseBtn = document.getElementById('copy-response-btn');

// Load API key from localStorage
const savedApiKey = localStorage.getItem('openai_api_key');
if (savedApiKey) {
    apiKeyInput.value = savedApiKey;
}

// Save API key to localStorage when changed
apiKeyInput.addEventListener('input', function() {
    if (this.value.trim()) {
        localStorage.setItem('openai_api_key', this.value);
    } else {
        localStorage.removeItem('openai_api_key');
    }
});

// Send message to ChatGPT
async function sendChatMessage() {
    const apiKey = apiKeyInput.value.trim();
    const message = chatInput.value.trim();
    
    if (!apiKey) {
        chatResponse.innerHTML = '<p class="chat-error">Please enter your OpenAI API key</p>';
        return;
    }
    
    if (!message) {
        chatResponse.innerHTML = '<p class="chat-error">Please enter a message</p>';
        return;
    }
    
    // Update UI
    sendChatBtn.disabled = true;
    sendChatBtn.innerHTML = '<span>⏳</span><span>Sending...</span>';
    chatResponse.innerHTML = '<p class="chat-loading">Thinking...</p>';
    copyResponseBtn.style.display = 'none';
    
    try {
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                model: 'gpt-4', // Using GPT-4 (you can change to gpt-3.5-turbo for cheaper option)
                messages: [
                    {
                        role: 'user',
                        content: message
                    }
                ],
                max_tokens: 1000,
                temperature: 0.7
            })
        });
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error?.message || `HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        const assistantMessage = data.choices[0].message.content;
        
        // Display response
        chatResponse.innerHTML = `<p class="chat-message">${assistantMessage.replace(/\n/g, '<br>')}</p>`;
        copyResponseBtn.style.display = 'flex';
        
    } catch (error) {
        console.error('ChatGPT API Error:', error);
        chatResponse.innerHTML = `<p class="chat-error">Error: ${error.message}</p>`;
    } finally {
        sendChatBtn.disabled = false;
        sendChatBtn.innerHTML = '<span>💬</span><span>Send Message</span>';
    }
}

// Send on button click
sendChatBtn.addEventListener('click', sendChatMessage);

// Send on Enter (Ctrl/Cmd + Enter)
chatInput.addEventListener('keydown', function(e) {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        sendChatMessage();
    }
});

// Copy response to clipboard
copyResponseBtn.addEventListener('click', function() {
    const responseText = chatResponse.innerText;
    navigator.clipboard.writeText(responseText).then(() => {
        const originalText = this.innerHTML;
        this.innerHTML = '<span>✓</span><span>Copied!</span>';
        setTimeout(() => {
            this.innerHTML = originalText;
        }, 2000);
    }).catch(err => {
        console.error('Failed to copy:', err);
        alert('Failed to copy to clipboard');
    });
});

// Load template images into the grid
function loadTemplates() {
    templateImages.forEach((imagePath, index) => {
        const templateItem = document.createElement('div');
        templateItem.className = 'template-item';
        templateItem.title = `Template ${index + 1}`;
        
        const img = document.createElement('img');
        // Properly encode the path - encodeURI handles Unicode characters correctly
        // Split path and encode each component separately to handle special characters
        const pathParts = imagePath.split('/');
        const encodedPath = pathParts.map(part => encodeURIComponent(part)).join('/');
        img.src = encodedPath;
        img.alt = `Template ${index + 1}`;
        img.className = 'template-thumbnail';
        
        img.onerror = function() {
            console.error('Failed to load template image:', imagePath);
            console.error('Encoded path was:', encodedPath);
            // Show error indicator instead of hiding
            templateItem.innerHTML = '<div style="padding: 20px; text-align: center; color: rgba(255,255,255,0.5); font-size: 0.8rem;">Image not found</div>';
            templateItem.style.cursor = 'not-allowed';
        };
        
        img.onload = function() {
            console.log('Successfully loaded template:', imagePath);
        };
        
        templateItem.appendChild(img);
        
        templateItem.addEventListener('click', function() {
            // Don't allow clicking if image failed to load
            if (img.complete && img.naturalHeight === 0) {
                return;
            }
            loadImage(encodedPath);
            // Update active state
            document.querySelectorAll('.template-item').forEach(item => {
                item.classList.remove('active');
            });
            templateItem.classList.add('active');
        });
        
        templatesGrid.appendChild(templateItem);
    });
}

// Initialize
initCanvas();
drawCanvas();
loadTemplates();

// Logout functionality
document.getElementById('logout-btn')?.addEventListener('click', function() {
    if(confirm('Are you sure you want to sign out?')) {
        localStorage.removeItem('currentUser');
        window.location.reload();
    }
});

// Loading Overlay Logic
document.addEventListener('DOMContentLoaded', function() {
    const loader = document.getElementById('loading-overlay');
    const progressBar = document.getElementById('loader-progress');
    
    // Simulate progress
    let progress = 0;
    const interval = setInterval(() => {
        progress += Math.random() * 10;
        if (progress > 90) progress = 90; // Wait for real load to finish 100%
        progressBar.style.width = progress + '%';
    }, 200);
    
    // When page is fully loaded
    window.addEventListener('load', function() {
        clearInterval(interval);
        progressBar.style.width = '100%';
        
        // Add a small delay to let the user see the 100% state and the brand name
        setTimeout(() => {
            loader.classList.add('hidden');
            // Remove from DOM after transition to avoid blocking clicks
            setTimeout(() => {
                loader.style.display = 'none';
            }, 500);
        }, 800); // 0.8s delay before hiding
    });
});
