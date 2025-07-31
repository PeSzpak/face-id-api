// Global variables
let modelsLoaded = false;
let labeledFaceDescriptors = [];
let currentStream = null;

// Navigation and theme functions
function setupNavigation() {
    const menuItems = document.querySelectorAll('.menu li');
    const sections = document.querySelectorAll('.content-section');

    menuItems.forEach(item => {
        item.addEventListener('click', () => {
            const targetSection = item.getAttribute('data-section');
            
            // Remove active class from all items and sections
            menuItems.forEach(mi => mi.classList.remove('active'));
            sections.forEach(section => section.classList.remove('active'));
            
            // Add active class to clicked item and target section
            item.classList.add('active');
            const targetElement = document.getElementById(targetSection);
            if (targetElement) {
                targetElement.classList.add('active');
                
                // Load content based on section
                if (targetSection === 'users') {
                    loadUsersSection();
                } else if (targetSection === 'register') {
                    loadRegisterSection();
                } else if (targetSection === 'recognize') {
                    loadRecognizeSection();
                } else if (targetSection === 'history') {
                    loadHistorySection();
                } else if (targetSection === 'dashboard') {
                    loadDashboardSection();
                }
            }
        });
    });
}

function setupTheme() {
    const themeSwitcher = document.querySelector('.theme-switcher');
    if (themeSwitcher) {
        themeSwitcher.addEventListener('click', () => {
            document.body.classList.toggle('dark-mode');
            document.body.classList.toggle('light-mode');
        });
    }
}

// Load face-api.js models
async function loadModels() {
    try {
        console.log('Loading face-api.js models...');
        await faceapi.nets.tinyFaceDetector.loadFromUri('./models');
        await faceapi.nets.faceLandmark68Net.loadFromUri('./models');
        await faceapi.nets.faceRecognitionNet.loadFromUri('./models');
        await faceapi.nets.faceExpressionNet.loadFromUri('./models');
        modelsLoaded = true;
        console.log('✅ All models loaded successfully');
    } catch (error) {
        console.error('❌ Error loading models:', error);
    }
}

// Load face descriptors from database
async function loadFaceDescriptors() {
    try {
        const faces = await window.dbManager.getFaceDescriptors();
        labeledFaceDescriptors = faces.map(face => 
            new faceapi.LabeledFaceDescriptors(
                face.name,
                [new Float32Array(face.descriptor)]
            )
        );
        console.log(`Loaded ${labeledFaceDescriptors.length} face descriptors from database`);
    } catch (error) {
        console.error('Error loading face descriptors:', error);
        labeledFaceDescriptors = [];
    }
}

// Dashboard Section
function loadDashboardSection() {
    const section = document.getElementById('dashboard');
    section.innerHTML = `
        <div class="welcome-message">
            <h2>Bem-vindo ao Face ID</h2>
            <p>Sistema de reconhecimento facial inteligente com tecnologia avançada</p>
            <div class="dashboard-buttons">
                <button onclick="showSection('register')" class="dashboard-btn btn-register">
                    <i class="fas fa-user-plus"></i>
                    <span>Cadastrar Novo Usuário</span>
                </button>
                <button onclick="showSection('recognize')" class="dashboard-btn btn-recognize">
                    <i class="fas fa-search"></i>
                    <span>Reconhecer Rosto</span>
                </button>
                <button onclick="showSection('users')" class="dashboard-btn btn-users">
                    <i class="fas fa-users"></i>
                    <span>Ver Usuários</span>
                </button>
            </div>
        </div>
    `;
}

// Register Section
function loadRegisterSection() {
    const section = document.getElementById('register');
    section.innerHTML = `
        <div class="register-container">
            <h2>Cadastrar Novo Usuário</h2>
            <div class="register-form">
                <input type="text" id="registerName" placeholder="Digite o nome da pessoa">
                <video id="registerVideo" autoplay muted style="width: 100%; max-width: 400px; border-radius: 10px; margin: 20px 0;"></video>
                <div style="margin: 20px 0;">
                    <button id="startRegisterCamera" style="margin: 5px; padding: 10px 20px; background: #007bff; color: white; border: none; border-radius: 5px; cursor: pointer;">
                        📹 Iniciar Câmera
                    </button>
                    <button id="captureBtn" style="margin: 5px; padding: 10px 20px; background: #28a745; color: white; border: none; border-radius: 5px; cursor: pointer;" disabled>
                        📸 Capturar e Cadastrar
                    </button>
                    <button id="stopRegisterCamera" style="margin: 5px; padding: 10px 20px; background: #dc3545; color: white; border: none; border-radius: 5px; cursor: pointer;">
                        ⏹️ Parar Câmera
                    </button>
                </div>
                <div id="registerStatus"></div>
            </div>
        </div>
    `;
    setupRegisterSection();
}

// Recognize Section - CORRIGIDO
function loadRecognizeSection() {
    const section = document.getElementById('recognize');
    section.innerHTML = `
        <div class="recognize-container">
            <h2>Reconhecimento Facial</h2>
            <div class="video-container">
                <video id="recognizeVideo" autoplay muted></video>
                <canvas id="recognizeCanvas"></canvas>
            </div>
            <div style="margin: 20px 0;">
                <button id="startRecognizeCamera" style="margin: 5px; padding: 10px 20px; background: #007bff; color: white; border: none; border-radius: 5px; cursor: pointer;">
                    📹 Iniciar Reconhecimento
                </button>
                <button id="stopRecognizeCamera" style="margin: 5px; padding: 10px 20px; background: #dc3545; color: white; border: none; border-radius: 5px; cursor: pointer;">
                    ⏹️ Parar Reconhecimento
                </button>
            </div>
            <div id="recognizeResults"></div>
        </div>
    `;
    setupRecognizeSection();
}

// Users Section
function loadUsersSection() {
    const section = document.getElementById('users');
    section.innerHTML = `
        <div class="users-list">
            <div class="users-list-header">
                <h2>Usuários Cadastrados</h2>
                <button id="refreshUsersBtn" style="padding: 10px 20px; background: #17a2b8; color: white; border: none; border-radius: 5px; cursor: pointer;">
                    🔄 Atualizar Lista
                </button>
            </div>
            <div id="usersListContainer">
                <p>Carregando usuários...</p>
            </div>
        </div>
    `;
    setupUsersSection();
}

// History Section
function loadHistorySection() {
    const section = document.getElementById('history');
    section.innerHTML = `
        <div class="history-container">
            <h2>Histórico de Reconhecimentos</h2>
            <button id="refreshHistoryBtn" style="margin: 20px 0; padding: 10px 20px; background: #17a2b8; color: white; border: none; border-radius: 5px; cursor: pointer;">
                🔄 Atualizar Histórico
            </button>
            <div id="historyContainer">
                <p>Carregando histórico...</p>
            </div>
        </div>
    `;
    setupHistorySection();
}

// Setup Register Section functionality
function setupRegisterSection() {
    const video = document.getElementById('registerVideo');
    const startBtn = document.getElementById('startRegisterCamera');
    const captureBtn = document.getElementById('captureBtn');
    const stopBtn = document.getElementById('stopRegisterCamera');
    const nameInput = document.getElementById('registerName');
    const statusDiv = document.getElementById('registerStatus');

    if (!video || !startBtn || !captureBtn || !stopBtn) return;

    startBtn.onclick = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true });
            video.srcObject = stream;
            currentStream = stream;
            startBtn.disabled = true;
            captureBtn.disabled = false;
            statusDiv.innerHTML = '<p style="color: green;">✅ Câmera iniciada</p>';
        } catch (error) {
            console.error('Error accessing camera:', error);
            statusDiv.innerHTML = '<p style="color: red;">❌ Erro ao acessar câmera</p>';
        }
    };

    stopBtn.onclick = () => {
        if (currentStream) {
            currentStream.getTracks().forEach(track => track.stop());
            video.srcObject = null;
            currentStream = null;
            startBtn.disabled = false;
            captureBtn.disabled = true;
            statusDiv.innerHTML = '<p>📹 Câmera parada</p>';
        }
    };

    captureBtn.onclick = async () => {
        const name = nameInput.value.trim();
        if (!name) {
            statusDiv.innerHTML = '<p style="color: red;">❌ Por favor, digite um nome</p>';
            return;
        }

        if (!modelsLoaded) {
            statusDiv.innerHTML = '<p style="color: red;">❌ Modelos ainda carregando...</p>';
            return;
        }

        try {
            statusDiv.innerHTML = '<p>🔍 Capturando e analisando rosto...</p>';
            
            const detections = await faceapi
                .detectSingleFace(video, new faceapi.TinyFaceDetectorOptions())
                .withFaceLandmarks()
                .withFaceDescriptor();

            if (!detections) {
                statusDiv.innerHTML = '<p style="color: red;">❌ Nenhum rosto detectado</p>';
                return;
            }

            // Save to database
            const result = await window.dbManager.registerFace(name, detections.descriptor);
            
            statusDiv.innerHTML = `<p style="color: green;">✅ ${result.message}</p>`;
            nameInput.value = '';
            
            // Reload face descriptors
            await loadFaceDescriptors();
            
            // Show success toast
            showSuccessToast(`${name} cadastrado com sucesso!`);
            
        } catch (error) {
            console.error('Registration error:', error);
            statusDiv.innerHTML = `<p style="color: red;">❌ Erro: ${error.message}</p>`;
        }
    };
}

// Setup Recognize Section functionality - CORRIGIDO
function setupRecognizeSection() {
    const video = document.getElementById('recognizeVideo');
    const canvas = document.getElementById('recognizeCanvas');
    const startBtn = document.getElementById('startRecognizeCamera');
    const stopBtn = document.getElementById('stopRecognizeCamera');
    const resultsDiv = document.getElementById('recognizeResults');

    if (!video || !canvas || !startBtn || !stopBtn) return;

    let recognitionInterval;

    startBtn.onclick = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true });
            video.srcObject = stream;
            currentStream = stream;

            video.addEventListener('loadedmetadata', () => {
                // Set canvas dimensions to match video
                canvas.width = video.videoWidth;
                canvas.height = video.videoHeight;
                
                // Start recognition loop
                recognitionInterval = setInterval(async () => {
                    if (modelsLoaded && labeledFaceDescriptors.length > 0) {
                        await performRecognition(video, canvas, resultsDiv);
                    }
                }, 1000);
            });

            startBtn.disabled = true;
            stopBtn.disabled = false;
            
        } catch (error) {
            console.error('Error starting recognition:', error);
            resultsDiv.innerHTML = '<p style="color: red;">❌ Erro ao iniciar reconhecimento</p>';
        }
    };

    stopBtn.onclick = () => {
        if (recognitionInterval) {
            clearInterval(recognitionInterval);
        }
        if (currentStream) {
            currentStream.getTracks().forEach(track => track.stop());
            video.srcObject = null;
            currentStream = null;
        }
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        startBtn.disabled = false;
        stopBtn.disabled = true;
        resultsDiv.innerHTML = '<p>🔍 Reconhecimento parado</p>';
    };
}

// Perform face recognition
async function performRecognition(video, canvas, resultsDiv) {
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

        const faceMatcher = new faceapi.FaceMatcher(labeledFaceDescriptors, 0.6);
        const results = detections.map(d => faceMatcher.findBestMatch(d.descriptor));

        // Draw results
        results.forEach((result, i) => {
            const box = detections[i].detection.box;
            const drawOptions = {
                label: result.toString(),
                lineWidth: 2
            };
            
            if (result.label !== 'unknown') {
                drawOptions.boxColor = 'green';
                // Update recognition count
                window.dbManager.updateRecognition(result.label).catch(console.error);
            } else {
                drawOptions.boxColor = 'red';
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

// Setup Users Section functionality
function setupUsersSection() {
    const refreshBtn = document.getElementById('refreshUsersBtn');
    if (refreshBtn) {
        refreshBtn.onclick = refreshUsersList;
    }
    refreshUsersList();
}

// Setup History Section functionality
function setupHistorySection() {
    const refreshBtn = document.getElementById('refreshHistoryBtn');
    if (refreshBtn) {
        refreshBtn.onclick = loadHistory;
    }
    loadHistory();
}

// Refresh users list
async function refreshUsersList() {
    try {
        const faces = await window.dbManager.getAllFaces();
        const container = document.getElementById('usersListContainer');
        
        if (faces.length === 0) {
            container.innerHTML = '<p>👥 Nenhum usuário cadastrado</p>';
            return;
        }
        
        let html = '<ul style="list-style: none; padding: 0;">';
        faces.forEach(face => {
            const lastSeen = new Date(face.lastSeen).toLocaleString('pt-BR');
            html += `
                <li style="background: #f8f9fa; margin: 10px 0; padding: 15px; border-radius: 8px; display: flex; justify-content: space-between; align-items: center;">
                    <div>
                        <strong>${face.name}</strong><br>
                        <small>Reconhecido: ${face.recognitionCount} vezes | Último: ${lastSeen}</small>
                    </div>
                    <button onclick="deleteUser('${face.name}')" style="background: #dc3545; color: white; border: none; padding: 8px 15px; border-radius: 5px; cursor: pointer;">
                        🗑️ Excluir
                    </button>
                </li>
            `;
        });
        html += '</ul>';
        
        container.innerHTML = html;
    } catch (error) {
        console.error('Error loading users:', error);
        const container = document.getElementById('usersListContainer');
        container.innerHTML = '<p style="color: red;">❌ Erro ao carregar usuários</p>';
    }
}

// Load history
async function loadHistory() {
    try {
        const history = await window.dbManager.getHistory();
        const container = document.getElementById('historyContainer');
        
        if (history.length === 0) {
            container.innerHTML = '<p>📊 Nenhum histórico encontrado</p>';
            return;
        }
        
        let html = '<ul style="list-style: none; padding: 0;">';
        history.forEach(record => {
            const lastSeen = new Date(record.lastSeen).toLocaleString('pt-BR');
            const registered = new Date(record.registeredAt).toLocaleString('pt-BR');
            html += `
                <li style="background: #f8f9fa; margin: 10px 0; padding: 15px; border-radius: 8px;">
                    <strong>${record.name}</strong><br>
                    <small>
                        Reconhecimentos: ${record.recognitionCount} | 
                        Último: ${lastSeen} | 
                        Cadastrado: ${registered}
                    </small>
                </li>
            `;
        });
        html += '</ul>';
        
        container.innerHTML = html;
    } catch (error) {
        console.error('Error loading history:', error);
        const container = document.getElementById('historyContainer');
        container.innerHTML = '<p style="color: red;">❌ Erro ao carregar histórico</p>';
    }
}

// Delete user
async function deleteUser(name) {
    if (!confirm(`Tem certeza que deseja deletar ${name}?`)) return;
    
    try {
        const result = await window.dbManager.deleteFace(name);
        showSuccessToast(result.message);
        await refreshUsersList();
        await loadFaceDescriptors();
    } catch (error) {
        console.error('Error deleting user:', error);
        alert(`Erro ao deletar ${name}: ${error.message}`);
    }
}

// Show section helper
function showSection(sectionName) {
    const menuItems = document.querySelectorAll('.menu li');
    const targetItem = document.querySelector(`[data-section="${sectionName}"]`);
    
    if (targetItem) {
        targetItem.click();
    }
}

// Show success toast
function showSuccessToast(message) {
    const toast = document.getElementById('successToast');
    const msgElement = document.getElementById('successToastMsg');
    
    if (toast && msgElement) {
        msgElement.textContent = message;
        toast.classList.add('show');
        
        setTimeout(() => {
            toast.classList.remove('show');
        }, 3000);
    }
}

// Initialize everything when DOM is loaded
document.addEventListener('DOMContentLoaded', async () => {
    console.log('🚀 Initializing Face ID System...');
    
    setupNavigation();
    setupTheme();
    loadDashboardSection(); // Load dashboard by default
    
    await loadModels();
    await loadFaceDescriptors();
    
    console.log('✅ Face ID System initialized');
});