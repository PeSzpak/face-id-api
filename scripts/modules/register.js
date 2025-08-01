// Register section management
export class RegisterManager {
  constructor(modelsManager, utils) {
    this.modelsManager = modelsManager;
    this.utils = utils;
    this.currentStream = null;
  }

  loadSection() {
    const section = document.getElementById("register");
    section.innerHTML = `
            <div class="register-container">
                <h2>Cadastrar Novo Usuário</h2>
                <div class="register-form">
                    <input type="text" id="registerName" placeholder="Digite o nome da pessoa">
                    <video id="registerVideo" autoplay muted style="width: 100%; max-width: 400px; border-radius: 10px; margin: 20px 0;"></video>
                    <div style="margin: 20px 0;">
                        <button id="startRegisterCamera" class="register-btn btn-primary">
                            📹 Iniciar Câmera
                        </button>
                        <button id="captureBtn" class="register-btn btn-success" disabled>
                            📸 Capturar e Cadastrar
                        </button>
                        <button id="stopRegisterCamera" class="register-btn btn-danger">
                            ⏹️ Parar Câmera
                        </button>
                    </div>
                    <div id="registerStatus"></div>
                </div>
            </div>
        `;
    this.setupSection();
  }

  setupSection() {
    const video = document.getElementById("registerVideo");
    const startBtn = document.getElementById("startRegisterCamera");
    const captureBtn = document.getElementById("captureBtn");
    const stopBtn = document.getElementById("stopRegisterCamera");
    const nameInput = document.getElementById("registerName");
    const statusDiv = document.getElementById("registerStatus");

    if (!video || !startBtn || !captureBtn || !stopBtn) return;

    startBtn.onclick = () =>
      this.startCamera(video, startBtn, captureBtn, statusDiv);
    stopBtn.onclick = () =>
      this.stopCamera(video, startBtn, captureBtn, statusDiv);
    captureBtn.onclick = () =>
      this.captureAndRegister(video, nameInput, statusDiv);
  }

  async startCamera(video, startBtn, captureBtn, statusDiv) {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      video.srcObject = stream;
      this.currentStream = stream;
      startBtn.disabled = true;
      captureBtn.disabled = false;
      statusDiv.innerHTML = '<p style="color: green;">✅ Câmera iniciada</p>';
    } catch (error) {
      console.error("Error accessing camera:", error);
      statusDiv.innerHTML =
        '<p style="color: red;">❌ Erro ao acessar câmera</p>';
    }
  }

  stopCamera(video, startBtn, captureBtn, statusDiv) {
    if (this.currentStream) {
      this.currentStream.getTracks().forEach((track) => track.stop());
      video.srcObject = null;
      this.currentStream = null;
      startBtn.disabled = false;
      captureBtn.disabled = true;
      statusDiv.innerHTML = "<p>📹 Câmera parada</p>";
    }
  }

  async captureAndRegister(video, nameInput, statusDiv) {
    const name = nameInput.value.trim();
    if (!name) {
      statusDiv.innerHTML =
        '<p style="color: red;">❌ Por favor, digite um nome</p>';
      return;
    }

    if (!this.modelsManager.modelsLoaded) {
      statusDiv.innerHTML =
        '<p style="color: red;">❌ Modelos ainda carregando...</p>';
      return;
    }

    try {
      statusDiv.innerHTML = "<p>🔍 Capturando e analisando rosto...</p>";

      const detections = await faceapi
        .detectSingleFace(video, new faceapi.TinyFaceDetectorOptions())
        .withFaceLandmarks()
        .withFaceDescriptor();

      if (!detections) {
        statusDiv.innerHTML =
          '<p style="color: red;">❌ Nenhum rosto detectado</p>';
        return;
      }

      const result = await window.dbManager.registerFace(
        name,
        detections.descriptor
      );
      statusDiv.innerHTML = `<p style="color: green;">✅ ${result.message}</p>`;
      nameInput.value = "";

      await this.modelsManager.loadFaceDescriptors();
      this.utils.showSuccessToast(`${name} cadastrado com sucesso!`);
    } catch (error) {
      console.error("Registration error:", error);
      statusDiv.innerHTML = `<p style="color: red;">❌ Erro: ${error.message}</p>`;
    }
  }
}
