function getModalRoot() {
  return document.querySelector("#modal-root");
}

function getToastRoot() {
  return document.querySelector("#toast-container");
}

export function getInitials(name = "") {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((chunk) => chunk.charAt(0).toUpperCase())
    .join("");
}

export function formatSerieLabel(serie = "") {
  const labels = {
    EF: "Ensino Fundamental",
    EM: "Ensino Medio",
    ES: "Ensino Superior",
    Senior: "Senior",
    NemNem: "Nem nem",
    Desempregado: "Nem nem"
  };

  return labels[serie] || serie;
}

export function formatDateTime(value) {
  if (!value) return "Ainda nao realizado";
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short"
  }).format(new Date(value));
}

export function formatDuration(minutes) {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;

  if (!hours) return `${mins} min`;
  if (!mins) return `${hours}h`;
  return `${hours}h ${mins}min`;
}

export function showToast(message, type = "success") {
  const root = getToastRoot();
  if (!root) return;

  const toast = document.createElement("div");
  toast.className = `toast toast-${type}`;
  toast.textContent = message;
  root.appendChild(toast);

  window.setTimeout(() => {
    toast.classList.add("removing");
    window.setTimeout(() => toast.remove(), 300);
  }, 2800);
}

export function closeModal() {
  const root = getModalRoot();
  if (!root) return;
  root.innerHTML = "";
}

export function openModal({ title, body, size = "", actions = [] }) {
  const root = getModalRoot();
  if (!root) return;

  const overlay = document.createElement("div");
  overlay.className = "modal-overlay open";
  overlay.innerHTML = `
    <div class="modal ${size}" role="dialog" aria-modal="true" aria-label="${title}">
      <div class="modal-header">
        <h3>${title}</h3>
        <button class="modal-close" type="button" aria-label="Fechar modal">x</button>
      </div>
      <div class="modal-body">${body}</div>
      <div class="modal-footer"></div>
    </div>
  `;

  const footer = overlay.querySelector(".modal-footer");
  actions.forEach((action) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = `btn ${action.className || "btn-secondary"}`;
    button.textContent = action.label;
    button.addEventListener("click", () => {
      if (action.closeOnClick !== false) {
        closeModal();
      }

      if (typeof action.onClick === "function") {
        action.onClick();
      }
    });
    footer.appendChild(button);
  });

  overlay.addEventListener("click", (event) => {
    if (event.target === overlay) {
      closeModal();
    }
  });

  overlay.querySelector(".modal-close").addEventListener("click", closeModal);
  root.innerHTML = "";
  root.appendChild(overlay);
}
