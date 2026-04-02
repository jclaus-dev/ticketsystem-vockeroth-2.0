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
  if (typeof loadTickets === "function" && typeof updateTicketsTabLabel === "function") {
    const openCount = loadTickets().filter(t => !t.done).length;
    updateTicketsTabLabel(openCount);
  }

  if (!inputs.persNr.value.trim()) {
    inputs.persNr.focus();
  }
}

const thisScript = document.querySelector('script[src*="Startseite.de-DE.customjs.js"]');
const pageUrl = new URL(window.location.href);
pageUrl.search = "";
pageUrl.hash = "";
const indexUrl = pageUrl.pathname.endsWith("/")
  ? new URL("index.html", pageUrl).toString()
  : pageUrl.toString();
const INFO_BANNER_CONFIG_URLS = Array.from(new Set([
  indexUrl,
  new URL("index.html", window.location.href).toString(),
  thisScript && thisScript.src ? new URL("index.html", thisScript.src).toString() : "",
  new URL("info-banner.json", window.location.href).toString(),
  thisScript && thisScript.src ? new URL("info-banner.json", thisScript.src).toString() : ""
].filter(Boolean)));
const INFO_BANNER_POLL_MS = 15000;
const DAILY_RELOAD_KEY = "dailyReloadDate";
const MORNING_RELOAD_HOUR = 5;
const INFO_BANNER_SYNC_KEY = "infoBannerMessage";
const INFO_BANNER_SYNC_TS_KEY = "infoBannerMessageUpdatedAt";

let lastInfoBannerText = "";
let infoBannerRefreshInFlight = false;

function getTodayLocalDate() {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function applyInfoBannerText(text) {
  if (!infoText || typeof text !== "string") return;
  const cleanText = text.trim();
  if (!cleanText || cleanText === lastInfoBannerText) return;
  infoText.textContent = cleanText;
  lastInfoBannerText = cleanText;
}

async function refreshInfoBannerText() {
  if (!infoText || infoBannerRefreshInFlight) return;
  infoBannerRefreshInFlight = true;
  try {
    for (const baseUrl of INFO_BANNER_CONFIG_URLS) {
      const url = `${baseUrl}${baseUrl.includes("?") ? "&" : "?"}t=${Date.now()}`;
      const res = await fetch(url, { cache: "no-store" });
      if (!res.ok) continue;
      const contentType = (res.headers.get("content-type") || "").toLowerCase();

      if (contentType.includes("application/json")) {
        const data = await res.json();
        if (data && typeof data.message === "string") {
          const msg = data.message.trim();
          applyInfoBannerText(msg);
          localStorage.setItem(INFO_BANNER_SYNC_KEY, msg);
          localStorage.setItem(INFO_BANNER_SYNC_TS_KEY, String(Date.now()));
          break;
        }
        continue;
      }

      const html = await res.text();
      if (!html) continue;
      const doc = new DOMParser().parseFromString(html, "text/html");
      const remoteInfoEl = doc.getElementById("infoText");
      const remoteText = remoteInfoEl ? remoteInfoEl.textContent : "";
      if (typeof remoteText === "string" && remoteText.trim()) {
        const msg = remoteText.trim();
        applyInfoBannerText(msg);
        localStorage.setItem(INFO_BANNER_SYNC_KEY, msg);
        localStorage.setItem(INFO_BANNER_SYNC_TS_KEY, String(Date.now()));
        break;
      }
    }
  } catch (_) {
  } finally {
    infoBannerRefreshInFlight = false;
  }
}

function scheduleDailyReload() {
  const now = new Date();
  const next = new Date(now);
  next.setHours(MORNING_RELOAD_HOUR, 0, 0, 0);
  if (next <= now) {
    next.setDate(next.getDate() + 1);
  }
  const delay = next.getTime() - now.getTime();
  setTimeout(() => {
    const today = getTodayLocalDate();
    localStorage.setItem(DAILY_RELOAD_KEY, today);
    window.location.reload();
  }, delay);
}

function enforceDailyReload() {
  const now = new Date();
  const today = getTodayLocalDate();
  const lastReloadDate = localStorage.getItem(DAILY_RELOAD_KEY);
  if (now.getHours() >= MORNING_RELOAD_HOUR && lastReloadDate !== today) {
    localStorage.setItem(DAILY_RELOAD_KEY, today);
    window.location.reload();
    return;
  }
  scheduleDailyReload();
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
  if (buttons.reset) {
    buttons.reset.style.display = "inline-block";
  }
  refreshInfoBannerText();
  setInterval(refreshInfoBannerText, INFO_BANNER_POLL_MS);
  window.addEventListener("focus", refreshInfoBannerText);
  window.addEventListener("online", refreshInfoBannerText);
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible") {
      refreshInfoBannerText();
    }
  });
  window.addEventListener("storage", e => {
    if (e.key === INFO_BANNER_SYNC_KEY && typeof e.newValue === "string") {
      applyInfoBannerText(e.newValue);
    }
  });
  enforceDailyReload();
  initializeApp();
});
