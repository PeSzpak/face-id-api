// Utility functions
export class Utils {
  showSuccessToast(message) {
    // Try to find existing toast first
    let toast = document.getElementById("successToast");

    // If toast doesn't exist, create it
    if (!toast) {
      toast = this.createToast();
    }

    const msgElement = toast.querySelector(".toast-message");

    if (toast && msgElement) {
      msgElement.textContent = message;
      toast.classList.add("show");

      setTimeout(() => {
        toast.classList.remove("show");
      }, 3000);
    }
  }

  createToast() {
    const toast = document.createElement("div");
    toast.id = "successToast";
    toast.className = "success-toast";
    toast.innerHTML = `
            <i class="fas fa-check-circle"></i>
            <span class="toast-message"></span>
        `;
    document.body.appendChild(toast);
    return toast;
  }

  formatDate(dateString) {
    return new Date(dateString).toLocaleString("pt-BR");
  }

  createButton(text, className, onclick) {
    const button = document.createElement("button");
    button.textContent = text;
    button.className = className;
    button.onclick = onclick;
    return button;
  }

  showError(message) {
    console.error(message);
    alert(message); // You can replace this with a better error display
  }

  showLoading(element, message = "Carregando...") {
    if (element) {
      element.innerHTML = `<p><i class="fas fa-spinner fa-spin"></i> ${message}</p>`;
    }
  }

  validateName(name) {
    return name && name.trim().length > 0;
  }

  debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }
}
