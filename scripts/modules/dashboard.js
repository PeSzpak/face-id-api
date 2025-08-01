// Dashboard section management
export class DashboardManager {
  loadSection() {
    const section = document.getElementById("dashboard");
    section.innerHTML = `
            <div class="welcome-message">
                <h2>Bem-vindo ao Face ID</h2>
                <p>Sistema de reconhecimento facial inteligente com tecnologia avançada</p>
                <div class="dashboard-buttons">
                    <button onclick="window.navigationManager.showSection('register')" class="dashboard-btn btn-register">
                        <i class="fas fa-user-plus"></i>
                        <span>Cadastrar Novo Usuário</span>
                    </button>
                    <button onclick="window.navigationManager.showSection('recognize')" class="dashboard-btn btn-recognize">
                        <i class="fas fa-search"></i>
                        <span>Reconhecer Rosto</span>
                    </button>
                    <button onclick="window.navigationManager.showSection('users')" class="dashboard-btn btn-users">
                        <i class="fas fa-users"></i>
                        <span>Ver Usuários</span>
                    </button>
                </div>
            </div>
        `;
  }
}
