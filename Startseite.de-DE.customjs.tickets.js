/* Startseite: local ticket overview */

function getTicketStorageKey() {
  const fil = inputs.filNr?.value.trim() || localStorage.getItem(SESSION_KEYS.filNr) || "unknown";
  return `tickets:${fil}`;
}

function loadTickets() {
  try {
    const raw = localStorage.getItem(getTicketStorageKey());
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function getTypeKeyFromName(name) {
  if (!name) return "other";
  const normalized = name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/gi, "")
    .toLowerCase();

  if (normalized.includes("zalandobestellungnicht")) return "zalando-bestellung";
  if (normalized.includes("onlinegutscheine")) return "online-gutscheine";
  if (normalized.includes("zalandopasswort")) return "zalando-passwort";
  if (normalized.includes("sonstigesanliegen")) return "sonstiges";
  if (normalized.includes("mboardprobleme")) return "mboard";
  return "other";
}

function saveTickets(tickets) {
  localStorage.setItem(getTicketStorageKey(), JSON.stringify(tickets));
}

function recordTicket(entry) {
  const tickets = loadTickets();
  tickets.unshift({
    id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
    createdAt: new Date().toISOString(),
    personalnummer: inputs.persNr?.value.trim() || "",
    filialnummer: inputs.filNr?.value.trim() || "",
    done: false,
    typeKey: entry.typeKey || getTypeKeyFromName(entry.kachelname),
    ...entry
  });
  saveTickets(tickets);
  const openCount = tickets.filter(t => !t.done).length;
  updateTicketsTabLabel(openCount);
}

function formatDate(iso) {
  const d = new Date(iso);
  if (isNaN(d)) return iso;
  return d.toLocaleString("de-DE");
}

const currentTicketFilters = {
  status: "all",
  type: "all",
  favorite: "all",
  search: ""
};

let filtersInitialized = false;

function updateFilterButtons(group, value) {
  const buttons = document.querySelectorAll(`[data-filter-group="${group}"]`);
  buttons.forEach(btn => {
    const isActive = btn.dataset.filterValue === value && !(group === "favorite" && value === "all");
    btn.classList.toggle("is-active", isActive);
  });
}

function initTicketFilters() {
  if (filtersInitialized) return;
  filtersInitialized = true;
  const filterButtons = document.querySelectorAll(".filter-button");
  filterButtons.forEach(btn => {
    btn.addEventListener("click", () => {
      const group = btn.dataset.filterGroup;
      const value = btn.dataset.filterValue;
      if (!group || !value) return;
      if (group === "favorite") {
        currentTicketFilters.favorite = currentTicketFilters.favorite === "fav" ? "all" : "fav";
        currentTicketFilters.status = "all";
        updateFilterButtons("favorite", currentTicketFilters.favorite);
        updateFilterButtons("status", currentTicketFilters.status);
      } else {
        currentTicketFilters[group] = value;
        currentTicketFilters.favorite = "all";
        updateFilterButtons("status", currentTicketFilters.status);
        updateFilterButtons("favorite", currentTicketFilters.favorite);
      }
      renderTickets();
    });
  });

  const searchInput = document.getElementById("ticketSearchInput");
  if (searchInput) {
    searchInput.addEventListener("input", () => {
      currentTicketFilters.search = searchInput.value.trim().toLowerCase();
      renderTickets();
    });
  }

  const exportLink = document.getElementById("ticketExportLink");
  if (exportLink) {
    exportLink.addEventListener("click", (event) => {
      event.preventDefault();
      downloadTicketsExcel();
    });
  }
}

function updateTicketsTabLabel(openCount) {
  if (!buttons.ticketsTab) return;
  buttons.ticketsTab.textContent = openCount > 0 ? `Tickets (${openCount})` : "Tickets";
}

function renderTickets() {
  const listEl = document.getElementById("ticketsList");
  const emptyEl = document.getElementById("ticketsEmpty");
  if (!listEl || !emptyEl) return;

  const tickets = loadTickets();
  const statusFilter = currentTicketFilters.status;
  const typeFilter = currentTicketFilters.type;
  const search = currentTicketFilters.search;
  const favFilter = currentTicketFilters.favorite;
  const openCount = tickets.filter(t => !t.done).length;
  updateTicketsTabLabel(openCount);
  const filtered = tickets.filter(ticket => {
    const typeKey = ticket.typeKey || getTypeKeyFromName(ticket.kachelname);
    if (statusFilter === "done" && !ticket.done) return false;
    if (statusFilter === "open" && ticket.done) return false;
    if (typeFilter !== "all" && typeKey !== typeFilter) return false;
    if (favFilter === "fav" && !ticket.isFav) return false;
    if (favFilter === "nonfav" && ticket.isFav) return false;
    if (search) {
      const haystack = [
        ticket.kachelname,
        ticket.details,
        ticket.personalnummer,
        ticket.filialnummer
      ].filter(Boolean).join(" ").toLowerCase();
      if (!haystack.includes(search)) return false;
    }
    return true;
  });

  listEl.innerHTML = "";

  if (!filtered.length) {
    emptyEl.style.display = "block";
    return;
  }

  emptyEl.style.display = "none";
  filtered.forEach((ticket, idx) => {
    const card = document.createElement("div");
    card.className = `ticket-card${ticket.done ? " done" : ""} is-animated`;
    card.style.animationDelay = `${Math.min(200 * idx, 800)}ms`;
    card.dataset.id = ticket.id;

    const info = document.createElement("div");
    info.className = "ticket-info";

    const title = document.createElement("div");
    title.className = "ticket-title";
    title.textContent = ticket.kachelname || "Ticket";

    const detailsBlock = document.createElement("div");
    detailsBlock.className = "ticket-details-list";
    const detailLines = (ticket.details || "").split("|").map(s => s.trim()).filter(Boolean);
    if (detailLines.length) {
      detailLines.forEach(line => {
        const row = document.createElement("div");
        row.textContent = line;
        detailsBlock.appendChild(row);
      });
    }

    const meta = document.createElement("div");
    meta.className = "ticket-meta";
    meta.textContent = `Datum: ${formatDate(ticket.createdAt)} | Personalnummer ${ticket.personalnummer || "-"} | Filiale: ${ticket.filialnummer || "-"}`;

    info.appendChild(title);
    if (detailLines.length) info.appendChild(detailsBlock);
    info.appendChild(meta);

    const actions = document.createElement("div");
    actions.className = "ticket-actions";
    const fav = document.createElement("span");
    fav.className = `ticket-fav${ticket.isFav ? " is-fav" : ""}`;
    fav.textContent = ticket.isFav ? "★" : "☆";
    fav.title = ticket.isFav ? "Favorit entfernen" : "Als Favorit markieren";
    fav.addEventListener("click", () => {
      const all = loadTickets();
      const ticketIndex = all.findIndex(t => t.id === ticket.id);
      if (ticketIndex >= 0) {
        all[ticketIndex].isFav = !all[ticketIndex].isFav;
        saveTickets(all);
        renderTickets();
      }
    });
    const toggleBtn = document.createElement("button");
    toggleBtn.type = "button";
    toggleBtn.className = "ticket-toggle";
    toggleBtn.textContent = ticket.done ? "Nicht erledigt" : "Erledigt";
    toggleBtn.addEventListener("click", () => {
      const all = loadTickets();
      const ticketIndex = all.findIndex(t => t.id === ticket.id);
      if (ticketIndex >= 0) {
        all[ticketIndex].done = !all[ticketIndex].done;
        saveTickets(all);
        renderTickets();
      }
    });
    actions.appendChild(toggleBtn);
    actions.appendChild(fav);

    card.appendChild(info);
    card.appendChild(actions);
    listEl.appendChild(card);
  });
}

function downloadTicketsExcel() {
  const tickets = loadTickets();
  const header = [
    "Datum",
    "Ticket",
    "Details",
    "Personalnummer",
    "Filiale",
    "Favorit",
    "Status"
  ];

  const rows = tickets.map(ticket => [
    formatDate(ticket.createdAt),
    ticket.kachelname || "Ticket",
    (ticket.details || "").replace(/\s*\|\s*/g, " | "),
    ticket.personalnummer || "",
    ticket.filialnummer || "",
    ticket.isFav ? "Ja" : "Nein",
    ticket.done ? "Erledigt" : "Nicht erledigt"
  ]);

  const csv = [header, ...rows]
    .map(cols => cols.map(value => `"${String(value).replace(/"/g, '""')}"`).join(";"))
    .join("\n");

  const bom = "\uFEFF";
  const blob = new Blob([bom, csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  const fil = inputs.filNr?.value.trim() || localStorage.getItem(SESSION_KEYS.filNr) || "unknown";
  const dateStamp = new Date().toISOString().slice(0, 10);
  link.href = url;
  link.download = `tickets_${fil}_${dateStamp}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

if (buttons.homeTab) {
  buttons.homeTab.addEventListener("click", () => showView("tile"));
}
if (buttons.ticketsTab) {
  buttons.ticketsTab.addEventListener("click", () => {
    if (buttons.ticketsTab.disabled) return;
    showView("tickets");
    initTicketFilters();
    renderTickets();
  });
}


