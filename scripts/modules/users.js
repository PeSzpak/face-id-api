// Users section management
export class UsersManager {
  constructor(modelsManager, utils) {
    this.modelsManager = modelsManager;
    this.utils = utils;
  }

  loadSection() {
    const section = document.getElementById("users");
    section.innerHTML = `
            <div class="users-list">
                <div class="users-list-header">
                    <h2>Usuários Cadastrados</h2>
                    <button id="refreshUsersBtn" class="register-btn btn-info">
                        🔄 Atualizar Lista
                    </button>
                </div>
                <div id="usersListContainer">
                    <p>Carregando usuários...</p>
                </div>
            </div>
        `;
    this.setupSection();
  }

  setupSection() {
    const refreshBtn = document.getElementById("refreshUsersBtn");
    if (refreshBtn) {
      refreshBtn.onclick = () => this.refreshUsersList();
    }
    this.refreshUsersList();
  }

  async refreshUsersList() {
    try {
      const faces = await window.dbManager.getAllFaces();
      const container = document.getElementById("usersListContainer");

      if (faces.length === 0) {
        container.innerHTML = "<p>👥 Nenhum usuário cadastrado</p>";
        return;
      }

      let html = '<ul style="list-style: none; padding: 0;">';
      faces.forEach((face) => {
        const lastSeen = this.utils.formatDate(face.lastSeen);
        html += `
                    <li style="background: #f8f9fa; margin: 10px 0; padding: 15px; border-radius: 8px; display: flex; justify-content: space-between; align-items: center;">
                        <div>
                            <strong>${face.name}</strong><br>
                            <small>Reconhecido: ${face.recognitionCount} vezes | Último: ${lastSeen}</small>
                        </div>
                        <button onclick="window.usersManager.deleteUser('${face.name}')" class="register-btn btn-danger">
                            🗑️ Excluir
                        </button>
                    </li>
                `;
      });
      html += "</ul>";

      container.innerHTML = html;
    } catch (error) {
      console.error("Error loading users:", error);
      const container = document.getElementById("usersListContainer");
      container.innerHTML =
        '<p style="color: red;">❌ Erro ao carregar usuários</p>';
    }
  }

  async deleteUser(name) {
    if (!confirm(`Tem certeza que deseja deletar ${name}?`)) return;

    try {
      const result = await window.dbManager.deleteFace(name);
      this.utils.showSuccessToast(result.message);
      await this.refreshUsersList();
      await this.modelsManager.loadFaceDescriptors();
    } catch (error) {
      console.error("Error deleting user:", error);
      alert(`Erro ao deletar ${name}: ${error.message}`);
    }
  }
}
