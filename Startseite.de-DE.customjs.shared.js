/* Startseite: shared config, state, and DOM references */

const API_URL = "https://defaultb586119017e044ea9a1ed1cb5bebf7.bd.environment.api.powerplatform.com:443/powerautomate/automations/direct/workflows/0e34948552214961ad12ebb48510599b/triggers/manual/paths/invoke?api-version=1&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=IJG9PPlNsm_vnisK1bMhs8CuUw5dPI-yygW1lRW3gOc";

const SESSION_KEYS = {
  persNr: "personalnummer",
  filNr: "filialnummer",
  expiresAt: "sessionExpiresAt",
  lastTileIndex: "lastSelectedTileIndex"
};

const FILIAL_MAP = {
  "1":  "Homberg",
  "0":  "Melsungen",
  "2":  "Melsungen",
  "3": "Jack & Jones",
  "4": "Fritzlar",
  "6": "Kassel",
  "9": "Arnsberg",
  "10": "Kassel",
  "11": "Kassel",
  "15": "Nordhausen",
  "16": "Hann. Münden",
  "18": "Eschwege",
  "20": "Eschwege",
  "22": "Homberg",
  "23": "Nordhausen",
  "24": "Goslar",
  "25": "Goslar",
  "27": "Soest",
  "29": "Bad Hersfeld",
  "40": "Bad Hersfeld",
  "43": "Bad Hersfeld",
  "47": "Bad Hersfeld",
  "51": "Bad Hersfeld",
  "52": "Bad Hersfeld",
  "55": "Bad Hersfeld",
  "30": "Kassel",
  "36": "Einbeck",
  "46": "Homberg",
  "49": "Schwalmstadt",
  "50": "Melsungen",
  "53": "Einbeck",
  "54": "Eschwege",
  "56": "Homberg",
  "57": "Eschwege",
};

const ZALANDO_REASONS = [
  "Artikel defekt",
  "Kein Bestand",
  "Nicht Auffindbar",
  "Bereits gepicked für andere Bestellung / bereits stationär verkauft",
  "Umlagerung",
  "Hersteller Retoure",
  "Kundenreservierung",
  "Personalauswahl",
  "Im Bestand"
];

let hasSent = false;
let currentTileName = "";
let selectedTileIndex = 0;
let twoEans = false;
let passReason = "";
let inputMode = "keyboard";

const tiles = Array.from(document.querySelectorAll("#tileContainer .tile.clickable"));
const popup = document.getElementById("customPopup");
const userFieldsWrapper = document.getElementById("user-fields-wrapper");
const userFields = document.querySelector(".user-fields");
const mainContainer = document.getElementById("main");
const navFilialPlaceholder = document.getElementById("filialnamePlaceholder");

const containers = {
  tile:      document.getElementById("tileContainer"),
  tickets:   document.getElementById("containerTickets"),
  handbuch:  document.getElementById("containerHandbuch"),
  handbuchDetail: document.getElementById("containerHandbuchDetail"),
  handbuchArticle: document.getElementById("containerHandbuchArticle"),
  gutschein: document.getElementById("gutscheinContainer"),
  best1:     document.getElementById("containerBestellungNichtErfuellbar"),
  step2:     document.getElementById("containerBestellungStep2"),
  opt1:      document.getElementById("containerBestellungOpt1"),
  opt2:      document.getElementById("containerBestellungOpt2"),
  pass1:     document.getElementById("containerPasswortResetStep1"),
  pass2:     document.getElementById("containerPasswortResetStep2"),
  sonstiges: document.getElementById("containerSonstiges"),
  mboard:    document.getElementById("containerMboard"),
  mboardRetoure: document.getElementById("containerMboardRetoure")
};

const inputs = {
  persNr:        document.getElementById("personalnummer"),
  filNr:         document.getElementById("filialnummer"),
  gutschein:     document.getElementById("gutscheinInput"),
  gutscheinWert: document.getElementById("gutscheinWertInput"),
  best1:         document.getElementById("input1"),
  ean1:          document.getElementById("step2Input1"),
  ean2:          document.getElementById("step2Input2"),
  ean3:          document.getElementById("step2Input3"),
  ean4:          document.getElementById("step2Input4"),
  newPassword:   document.getElementById("newPasswordInput"),
  sonstiges:     document.getElementById("sonstigesInput"),
  mboard:        document.getElementById("mboardInput"),
  mboardOrder:   document.getElementById("mboardRetoureOrder"),
  mboardEAN:     document.getElementById("mboardRetoureEAN"),
  mboardCustomer:document.getElementById("mboardRetoureCustomer"),
  mboardState:   document.getElementById("mboardRetoureState")
};

const buttons = {
  homeTab:        document.getElementById("homeTab"),
  ticketsTab:     document.getElementById("ticketsTab"),
  handbuchTab:    document.getElementById("handbuchTab"),
  popupYes:       document.getElementById("popupYes"),
  popupNo:        document.getElementById("popupNo"),
  save:           document.getElementById("saveBtn"),
  reset:          document.getElementById("resetBtn"),
  passPrev:       document.getElementById("passwordPrev"),
  passPrev1:      document.getElementById("passwordPrev1"),
  passConfirm:    document.getElementById("passwordConfirm"),
  sonstPrev:      document.getElementById("sonstigesPrev"),
  sonstConfirm:   document.getElementById("sonstigesConfirm"),
  addSecondEAN:   document.getElementById("addSecondEANBox"),
  confirmReason:  document.getElementById("confirmReasonBtn"),
  confirmReason2: document.getElementById("confirmReasonBtn2"),
  reasonPrev1:    document.getElementById("reasonPrev1"),
  reasonPrev2:    document.getElementById("reasonPrev2"),
  mboardPrev:     document.getElementById("mboardPrev"),
  zalandoPrev:    document.getElementById("zalandoPrev"),
  mboardConfirm:  document.getElementById("mboardConfirm"),
  mboardRetourePrev: document.getElementById("mboardRetourePrev"),
  mboardRetoureConfirm: document.getElementById("mboardRetoureConfirm")
};

const arrowPrev = document.getElementById("arrowPrev");
const arrowNext = document.getElementById("arrowNext");
const zalandoNext = document.getElementById("nextArrow");
const backBtn = document.getElementById("backBtn");
const step2Confirm = document.getElementById("step2Confirm");
const infoText = document.getElementById("infoText");

const reasonGrid1 = document.getElementById("reasonGrid1");
const reasonGrid2 = document.getElementById("reasonGrid2");
const containerOpt2 = document.getElementById("containerBestellungOpt2");
const opt2Headline = containerOpt2 ? containerOpt2.querySelector("h2") : null;
const box1 = document.getElementById("kachelEAN1");
const box2 = document.getElementById("kachelEAN2");
const box3 = document.getElementById("kachelEAN3");
const box4 = document.getElementById("kachelEAN4");
const confirmBtn = document.getElementById("step2Confirm");

async function sendPlannerTicket(data = {}) {
  const payload = {
    kachelname:     data.kachelname || currentTileName || "",
    personalnummer: data.personalnummer || inputs.persNr.value.trim(),
    filialnummer:   data.filialnummer || inputs.filNr.value.trim()
  };

  ["gutscheincode", "gutscheinwert", "orderId", "reason", "password", "text"].forEach(key => {
    if (data[key]) payload[key] = data[key];
  });

  if (Array.isArray(data.eans)) {
    payload.eans = data.eans;
  }
  if (Array.isArray(data.reasons)) {
    payload.reasons = data.reasons;
  }

  const res = await fetch(API_URL, {
    method:  "POST",
    headers: { "Content-Type": "application/json" },
    body:    JSON.stringify(payload)
  });
  const resText = await res.text();
  if (!res.ok) {
    throw new Error(`Status ${res.status}: ${resText}`);
  }
  return resText;
}

function showToast(message) {
  if (!message) return;
  let holder = document.getElementById("toastHolder");
  if (!holder) {
    holder = document.createElement("div");
    holder.id = "toastHolder";
    document.body.appendChild(holder);
  }
  const toast = document.createElement("div");
  toast.className = "toast-notice";
  toast.textContent = message;
  holder.appendChild(toast);
  requestAnimationFrame(() => toast.classList.add("is-visible"));
  setTimeout(() => {
    toast.classList.remove("is-visible");
    setTimeout(() => toast.remove(), 250);
  }, 4000);
}
