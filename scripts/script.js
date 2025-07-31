// Main application file - now much smaller and cleaner!
import { NavigationManager } from './modules/navigation.js';
import { ModelsManager } from './modules/models.js';
import { DashboardManager } from './modules/dashboard.js';
import { RegisterManager } from './modules/register.js';
import { RecognitionManager } from './modules/recognition.js';
import { UsersManager } from './modules/users.js';
import { HistoryManager } from './modules/history.js';
import { Utils } from './modules/utils.js';

class FaceIDApp {
    constructor() {
        this.utils = new Utils();
        this.modelsManager = new ModelsManager();
        this.navigationManager = new NavigationManager();
        this.dashboardManager = new DashboardManager();
        this.registerManager = new RegisterManager(this.modelsManager, this.utils);
        this.recognitionManager = new RecognitionManager(this.modelsManager);
        this.usersManager = new UsersManager(this.modelsManager, this.utils);
        this.historyManager = new HistoryManager();
        
        this.setupEventListeners();
        this.exposeGlobalReferences();
    }

    setupEventListeners() {
        // Listen for section changes
        window.addEventListener('sectionChanged', (event) => {
            const section = event.detail.section;
            this.loadSection(section);
        });

        // Listen for page unload to cleanup streams
        window.addEventListener('beforeunload', () => {
            this.cleanup();
        });
    }

    exposeGlobalReferences() {
        // Make managers globally available for HTML onclick handlers
        window.navigationManager = this.navigationManager;
        window.modelsManager = this.modelsManager;
        window.utils = this.utils;
        window.usersManager = this.usersManager;
        window.historyManager = this.historyManager;
    }

    loadSection(sectionName) {
        try {
            switch(sectionName) {
                case 'dashboard':
                    this.dashboardManager.loadSection();
                    break;
                case 'register':
                    this.registerManager.loadSection();
                    break;
                case 'recognize':
                    this.recognitionManager.loadSection();
                    break;
                case 'users':
                    this.usersManager.loadSection();
                    break;
                case 'history':
                    this.historyManager.loadSection();
                    break;
                default:
                    console.warn(`Unknown section: ${sectionName}`);
                    this.dashboardManager.loadSection();
            }
        } catch (error) {
            console.error(`Error loading section ${sectionName}:`, error);
            this.utils.showError(`Erro ao carregar seção: ${sectionName}`);
        }
    }

    cleanup() {
        // Clean up any active streams
        if (this.registerManager.currentStream) {
            this.registerManager.currentStream.getTracks().forEach(track => track.stop());
        }
        if (this.recognitionManager.currentStream) {
            this.recognitionManager.currentStream.getTracks().forEach(track => track.stop());
        }
    }

    async initialize() {
        console.log('🚀 Initializing Face ID System...');
        
        try {
            // Load dashboard by default
            this.dashboardManager.loadSection();
            
            // Load AI models in background
            await this.modelsManager.loadModels();
            await this.modelsManager.loadFaceDescriptors();
            
            console.log('✅ Face ID System initialized successfully');
            
            // Show success message
            this.utils.showSuccessToast('Sistema inicializado com sucesso!');
            
        } catch (error) {
            console.error('❌ Error initializing Face ID System:', error);
            this.utils.showError('Erro ao inicializar o sistema. Verifique o console para mais detalhes.');
        }
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', async () => {
    const app = new FaceIDApp();
    await app.initialize();
});

// Export for debugging purposes
window.FaceIDApp = FaceIDApp;