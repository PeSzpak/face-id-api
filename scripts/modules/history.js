// History section management
export class HistoryManager {
  constructor() {
    // Constructor can be empty for now
  }

  loadSection() {
    const section = document.getElementById("history");
    section.innerHTML = `
            <div class="history-container">
                <h2>Histórico de Reconhecimentos</h2>
                <button id="refreshHistoryBtn" class="register-btn btn-info">
                    🔄 Atualizar Histórico
                </button>
                <div id="historyContainer">
                    <p>Carregando histórico...</p>
                </div>
            </div>
        `;
    this.setupSection();
  }

  setupSection() {
    const refreshBtn = document.getElementById("refreshHistoryBtn");
    if (refreshBtn) {
      refreshBtn.onclick = () => this.loadHistory();
    }
    this.loadHistory();
  }

  async loadHistory() {
    try {
      const history = await window.dbManager.getHistory();
      const container = document.getElementById("historyContainer");

      if (history.length === 0) {
        container.innerHTML = "<p>📊 Nenhum histórico encontrado</p>";
        return;
      }

      let html = '<ul style="list-style: none; padding: 0;">';
      history.forEach((record) => {
        const lastSeen = this.formatDate(record.lastSeen);
        const registered = this.formatDate(record.registeredAt);
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
      html += "</ul>";

      container.innerHTML = html;
    } catch (error) {
      console.error("Error loading history:", error);
      const container = document.getElementById("historyContainer");
      container.innerHTML =
        '<p style="color: red;">❌ Erro ao carregar histórico</p>';
    }
  }

  formatDate(dateString) {
    return new Date(dateString).toLocaleString("pt-BR");
  }
}
