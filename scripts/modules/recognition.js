// Recognition section management
export class RecognitionManager {
  constructor(modelsManager) {
    this.modelsManager = modelsManager;
    this.currentStream = null;
    this.recognitionInterval = null;
    this.similarityThreshold = 0.7; // 70% minimum similarity
  }

  loadSection() {
    const section = document.getElementById("recognize");
    section.innerHTML = `
            <div class="recognize-container">
                <h2>Reconhecimento Facial</h2>
                
                <div class="video-container">
                    <video id="recognizeVideo" autoplay muted></video>
                    <canvas id="recognizeCanvas"></canvas>
                </div>
                
                <div class="recognition-controls">
                    <button id="startRecognizeCamera" class="register-btn btn-primary">
                        📹 Iniciar Reconhecimento
                    </button>
                    <button id="stopRecognizeCamera" class="register-btn btn-danger">
                        ⏹️ Parar Reconhecimento
                    </button>
                </div>
                
                <div class="threshold-control">
                    <label for="similarityThreshold">
                        Nível de Similaridade Mínimo: <span id="thresholdValue">${Math.round(
                          this.similarityThreshold * 100
                        )}%</span>
                    </label>
                    <input type="range" id="similarityThreshold" min="0.3" max="0.9" step="0.05" value="${
                      this.similarityThreshold
                    }" 
                           onchange="window.recognitionManager.updateThreshold(this.value)">
                    <div class="threshold-labels">
                        <span>30% (Muito Permissivo)</span>
                        <span>90% (Muito Restritivo)</span>
                    </div>
                    <div class="threshold-info">
                        ⚠️ Só mostra detecções acima do nível configurado
                    </div>
                </div>
                
                <div id="recognizeResults">
                    <p>Aguardando início do reconhecimento...</p>
                </div>
            </div>
        `;
    this.setupSection();
  }

  setupSection() {
    const video = document.getElementById("recognizeVideo");
    const canvas = document.getElementById("recognizeCanvas");
    const startBtn = document.getElementById("startRecognizeCamera");
    const stopBtn = document.getElementById("stopRecognizeCamera");
    const resultsDiv = document.getElementById("recognizeResults");

    if (!video || !canvas || !startBtn || !stopBtn) return;

    startBtn.onclick = () =>
      this.startRecognition(video, canvas, startBtn, stopBtn, resultsDiv);
    stopBtn.onclick = () =>
      this.stopRecognition(video, canvas, startBtn, stopBtn, resultsDiv);
  }

  updateThreshold(value) {
    this.similarityThreshold = parseFloat(value);
    const thresholdDisplay = document.getElementById("thresholdValue");
    if (thresholdDisplay) {
      thresholdDisplay.textContent = `${Math.round(
        this.similarityThreshold * 100
      )}%`;
    }
    console.log(
      `🎯 Threshold atualizado para: ${this.similarityThreshold} (${Math.round(
        this.similarityThreshold * 100
      )}%)`
    );
  }

  async startRecognition(video, canvas, startBtn, stopBtn, resultsDiv) {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      video.srcObject = stream;
      this.currentStream = stream;

      video.addEventListener("loadedmetadata", () => {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;

        this.recognitionInterval = setInterval(async () => {
          if (
            this.modelsManager.modelsLoaded &&
            this.modelsManager.labeledFaceDescriptors.length > 0
          ) {
            await this.performRecognition(video, canvas, resultsDiv);
          }
        }, 1000);
      });

      startBtn.disabled = true;
      stopBtn.disabled = false;
      resultsDiv.innerHTML = `<p style="color: blue;">🔍 Reconhecimento iniciado (mín. ${Math.round(
        this.similarityThreshold * 100
      )}%)...</p>`;
    } catch (error) {
      console.error("Error starting recognition:", error);
      resultsDiv.innerHTML =
        '<p style="color: red;">❌ Erro ao iniciar reconhecimento</p>';
    }
  }

  stopRecognition(video, canvas, startBtn, stopBtn, resultsDiv) {
    if (this.recognitionInterval) {
      clearInterval(this.recognitionInterval);
      this.recognitionInterval = null;
    }
    if (this.currentStream) {
      this.currentStream.getTracks().forEach((track) => track.stop());
      video.srcObject = null;
      this.currentStream = null;
    }
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    startBtn.disabled = false;
    stopBtn.disabled = true;
    resultsDiv.innerHTML = "<p>🔍 Reconhecimento parado</p>";
  }

  async performRecognition(video, canvas, resultsDiv) {
    try {
      const detections = await faceapi
        .detectAllFaces(video, new faceapi.TinyFaceDetectorOptions())
        .withFaceLandmarks()
        .withFaceDescriptors();

      const ctx = canvas.getContext("2d");
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      if (detections.length === 0) {
        resultsDiv.innerHTML =
          '<p style="color: #666;">👤 Nenhum rosto detectado</p>';
        return;
      }

      const faceMatcher = this.modelsManager.getFaceMatcher();
      const results = detections.map((d) =>
        faceMatcher.findBestMatch(d.descriptor)
      );

      //  // only process Threshold recognition
      const validDetections = [];
      const rejectedDetections = [];

      results.forEach((result, i) => {
        const box = detections[i].detection.box;
        const similarity = 1 - result.distance; // Convert distance to similarity
        const similarityPercent = Math.round(similarity * 100);

        console.log(
          `🔍 Detecção ${i}: ${
            result.label
          }, Similaridade: ${similarityPercent}%, Threshold: ${Math.round(
            this.similarityThreshold * 100
          )}%`
        );

        // ONLY SHOW IF PASS ON THRESHOLD
        if (
          result.label !== "unknown" &&
          similarity >= this.similarityThreshold
        ) {
          // Sucefully recognized - SHOW
          const drawOptions = {
            label: `${result.label} (${similarityPercent}%)`,
            lineWidth: 3,
            boxColor: "green",
          };

          // draw green box
          const drawBox = new faceapi.draw.DrawBox(box, drawOptions);
          drawBox.draw(canvas);

          validDetections.push({
            type: "success",
            name: result.label,
            similarity: similarityPercent,
          });

          // Update recognition count in database
          window.dbManager.updateRecognition(result.label).catch(console.error);
        } else {
          // DON`T SHOW - but count for statistic
          rejectedDetections.push({
            label: result.label,
            similarity: similarityPercent,
            reason:
              result.label === "unknown"
                ? "Desconhecido"
                : "Baixa similaridade",
          });
        }
      });

      //  // updated display for only validated detection
      this.updateResultsDisplay(
        validDetections,
        rejectedDetections,
        resultsDiv
      );
    } catch (error) {
      console.error("Recognition error:", error);
      resultsDiv.innerHTML =
        '<p style="color: red;">❌ Erro durante reconhecimento</p>';
    }
  }

  updateResultsDisplay(validDetections, rejectedDetections, resultsDiv) {
    let html = '<div style="text-align: center; font-weight: 600;">';

    if (validDetections.length > 0) {
      //only show validated detection
      const names = validDetections
        .map((r) => `${r.name} (${r.similarity}%)`)
        .join(", ");
      html += `<p style="color: green; font-size: 1.3em; margin: 10px 0;">
                ✅ <strong>RECONHECIDO:</strong> ${names}
            </p>`;
    } else {
      // No valid recognition
      const totalFaces = validDetections.length + rejectedDetections.length;

      if (totalFaces > 0) {
        html += `<p style="color: orange; font-size: 1.1em; margin: 10px 0;">
                    ⚠️ <strong>Rosto detectado mas não reconhecido</strong><br>
                    <small>Similaridade abaixo de ${Math.round(
                      this.similarityThreshold * 100
                    )}%</small>
                </p>`;
      } else {
        html += `<p style="color: #666; font-size: 1em; margin: 10px 0;">
                    👤 Aguardando detecção de rosto...
                </p>`;
      }
    }

    //show statistic on console for debug
    if (rejectedDetections.length > 0) {
      console.log(
        `❌ ${rejectedDetections.length} detecções rejeitadas:`,
        rejectedDetections
      );
    }

    html += "</div>";
    resultsDiv.innerHTML = html;
  }
}
