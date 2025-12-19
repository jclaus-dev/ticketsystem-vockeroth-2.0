/* Startseite: initialization */

function initializeApp() {
  hideAllViews();
  showView("tile");

  const idxZalando = tiles.findIndex(t => 
    t.dataset.kachelname === "Zalando Bestellung nicht erf\u00fcllbar" &&
    !t.classList.contains("disabled")
  );
  if (idxZalando >= 0) {
    selectedTileIndex = idxZalando;
  } else {
    const rawIndex = +localStorage.getItem(SESSION_KEYS.lastTileIndex);
    if (
      !isNaN(rawIndex) &&
      rawIndex < tiles.length &&
      !tiles[rawIndex].classList.contains("disabled") &&
      tiles[rawIndex].dataset.kachelname !== "Coming Soon"
    ) {
      selectedTileIndex = rawIndex;
    } else {
      selectedTileIndex = tiles.findIndex(t => {
        return (
          !t.classList.contains("disabled") &&
          t.dataset.kachelname !== "Coming Soon"
        );
      });
      if (selectedTileIndex < 0) selectedTileIndex = 0;
    }
  }

  updateTileSelection();

  disableAllTiles();

  const savedPers = localStorage.getItem(SESSION_KEYS.persNr);
  const savedFil  = localStorage.getItem(SESSION_KEYS.filNr);
  if (savedPers) inputs.persNr.value = savedPers;
  if (savedFil)  inputs.filNr.value  = savedFil;
  updateFilialPlaceholder();
  validatePersonalFilial();

  if (!inputs.persNr.value.trim()) {
    inputs.persNr.focus();
  }
}

document.addEventListener("DOMContentLoaded", () => {
  setupBlinkingPlaceholder(inputs.gutschein);
  setupBlinkingPlaceholder(inputs.gutscheinWert);
  setupBlinkingPlaceholder(inputs.best1);
  setupBlinkingPlaceholder(inputs.ean1);
  setupBlinkingPlaceholder(inputs.ean2);
  setupBlinkingPlaceholder(inputs.ean3);
  setupBlinkingPlaceholder(inputs.ean4);
  setupBlinkingPlaceholder(inputs.newPassword);
  setupBlinkingPlaceholder(inputs.sonstiges);

  Object.values(inputs).forEach(setupBlinkingPlaceholder);

  initSessionTimer();
  initializeApp();
});
