/* Startseite: session handling and user identification */

function expireSession() {
  [SESSION_KEYS.persNr, SESSION_KEYS.filNr, SESSION_KEYS.expiresAt].forEach(k => localStorage.removeItem(k));
  disableAllTiles();
  alert("Deine Session ist abgelaufen. Bitte Personal- und Filialnummer erneut eingeben.");
}

function initSessionTimer() {
  const now = new Date();
  const exp = localStorage.getItem(SESSION_KEYS.expiresAt);
  if (!exp) return;

  const expiresAt = new Date(exp);
  if (expiresAt > now) {
    setTimeout(expireSession, expiresAt - now);
  } else {
    expireSession();
  }
}

function validatePersonalFilial() {
  const bothFilled = inputs.persNr.value.trim() && inputs.filNr.value.trim();
  buttons.save.disabled = !bothFilled;
  if (buttons.ticketsTab) {
    buttons.ticketsTab.disabled = !bothFilled;
  }
}

[inputs.persNr, inputs.filNr].forEach(inp => {
  inp.addEventListener("input", e => {
    e.target.value = e.target.value.replace(/\D/g, "");
    validatePersonalFilial();
    if (!inputs.persNr.value.trim() || !inputs.filNr.value.trim()) {
      disableAllTiles();
      if (buttons.ticketsTab) buttons.ticketsTab.disabled = true;
    }
  });
});

inputs.persNr.addEventListener("keydown", e => {
  if (e.key === "Enter") {
    e.preventDefault();
    inputs.filNr.focus();
  }
});

inputs.filNr.addEventListener("keydown", e => {
  if (e.key === "Enter" && !buttons.save.disabled) {
    e.preventDefault();
    e.stopPropagation();
    buttons.save.click();
  }
});

buttons.save.addEventListener("click", () => {
  if (!(inputs.persNr.value.trim() && inputs.filNr.value.trim())) {
    [inputs.persNr, inputs.filNr].forEach(i => {
      if (!i.value.trim()) i.style.border = "2px solid red";
    });
    return;
  }
  localStorage.setItem(SESSION_KEYS.persNr, inputs.persNr.value.trim());
  localStorage.setItem(SESSION_KEYS.filNr, inputs.filNr.value.trim());
  const expiresAt = new Date(Date.now() + 12 * 3600 * 1000);
  localStorage.setItem(SESSION_KEYS.expiresAt, expiresAt.toISOString());
  setTimeout(expireSession, expiresAt - new Date());

  updateFilialPlaceholder();
  enableAllTiles();
  if (buttons.ticketsTab) buttons.ticketsTab.disabled = false;
  document.getElementById("savedNotice").style.display = "block";
  setTimeout(() => document.getElementById("savedNotice").style.display = "none", 4000);
  showView("tile");
});
