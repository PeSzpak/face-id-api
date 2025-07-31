// Recognition section management
export class RecognitionManager {
    constructor(modelsManager) {
        this.modelsManager = modelsManager;
        this.currentStream = null;
        this.recognitionInterval = null;
    }

    loadSection() {
        const section = document.getElementById('recognize');
        section.innerHTML = `
            <div class="recognize-container">
                <h2>Reconhecimento Facial</h2>
                <div class="video-container">
                    <video id="recognizeVideo" autoplay muted></video>
                    <canvas id="recognizeCanvas"></canvas>
                </div>
                <div style="margin: 20px 0;">
                    <button id="startRecognizeCamera" class="register-btn btn-primary">
                        📹 Iniciar Reconhecimento
                    </button>
                    <button id="stopRecognizeCamera" class="register-btn btn-danger">
                        ⏹️ Parar Reconhecimento
                    </button>
                </div>
                <div id="recognizeResults"></div>
            </div>
        `;
        this.setupSection();
    }

    setupSection() {
        const video = document.getElementById('recognizeVideo');
        const canvas = document.getElementById('recognizeCanvas');
        const startBtn = document.getElementById('startRecognizeCamera');
        const stopBtn = document.getElementById('stopRecognizeCamera');
        const resultsDiv = document.getElementById('recognizeResults');

        if (!video || !canvas || !startBtn || !stopBtn) return;

        startBtn.onclick = () => this.startRecognition(video, canvas, startBtn, stopBtn, resultsDiv);
        stopBtn.onclick = () => this.stopRecognition(video, canvas, startBtn, stopBtn, resultsDiv);
    }

    async startRecognition(video, canvas, startBtn, stopBtn, resultsDiv) {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true });
            video.srcObject = stream;
            this.currentStream = stream;

            video.addEventListener('loadedmetadata', () => {
                canvas.width = video.videoWidth;
                canvas.height = video.videoHeight;
                
                this.recognitionInterval = setInterval(async () => {
                    if (this.modelsManager.modelsLoaded && this.modelsManager.labeledFaceDescriptors.length > 0) {
                        await this.performRecognition(video, canvas, resultsDiv);
                    }
                }, 1000);
            });

            startBtn.disabled = true;
            stopBtn.disabled = false;
            
        } catch (error) {
            console.error('Error starting recognition:', error);
            resultsDiv.innerHTML = '<p style="color: red;">❌ Erro ao iniciar reconhecimento</p>';
        }
    }

    stopRecognition(video, canvas, startBtn, stopBtn, resultsDiv) {
        if (this.recognitionInterval) {
            clearInterval(this.recognitionInterval);
            this.recognitionInterval = null;
        }
        if (this.currentStream) {
            this.currentStream.getTracks().forEach(track => track.stop());
            video.srcObject = null;
            this.currentStream = null;
        }
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        startBtn.disabled = false;
        stopBtn.disabled = true;
        resultsDiv.innerHTML = '<p>🔍 Reconhecimento parado</p>';
    }

    async performRecognition(video, canvas, resultsDiv) {
        try {
            const detections = await faceapi
                .detectAllFaces(video, new faceapi.TinyFaceDetectorOptions())
                .withFaceLandmarks()
                .withFaceDescriptors();

            const ctx = canvas.getContext('2d');
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            if (detections.length === 0) {
                resultsDiv.innerHTML = '<p>👤 Nenhum rosto detectado</p>';
                return;
            }

            const faceMatcher = this.modelsManager.getFaceMatcher();
            const results = detections.map(d => faceMatcher.findBestMatch(d.descriptor));

            // Draw results
            results.forEach((result, i) => {
                const box = detections[i].detection.box;
                const drawOptions = {
                    label: result.toString(),
                    lineWidth: 2,
                    boxColor: result.label !== 'unknown' ? 'green' : 'red'
                };
                
                if (result.label !== 'unknown') {
                    window.dbManager.updateRecognition(result.label).catch(console.error);
                }

                const drawBox = new faceapi.draw.DrawBox(box, drawOptions);
                drawBox.draw(canvas);
            });

            // Update results display
            const recognizedNames = results
                .filter(r => r.label !== 'unknown')
                .map(r => r.label);

            if (recognizedNames.length > 0) {
                resultsDiv.innerHTML = `<p style="color: green;">✅ Reconhecido: ${recognizedNames.join(', ')}</p>`;
            } else {
                resultsDiv.innerHTML = '<p style="color: orange;">⚠️ Pessoa não reconhecida</p>';
            }

        } catch (error) {
            console.error('Recognition error:', error);
        }
    }
}