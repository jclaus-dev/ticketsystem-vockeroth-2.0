/* Startseite: Zalando flow */

const eanFields = [
  { input: inputs.ean1, box: box1 },
  { input: inputs.ean2, box: box2 },
  { input: inputs.ean3, box: box3 },
  { input: inputs.ean4, box: box4 }
].filter(field => field.input && field.box);

let activeEanCount = 1;
const opt1Headline = document.querySelector("#containerBestellungOpt1 h2");

function resetZalandoStep2() {
  inputs.ean1.value = "";
  inputs.ean2.value = "";
  inputs.ean3.value = "";
  inputs.ean4.value = "";
  [box1, box2, box3, box4].forEach((box, idx) => {
    if (!box) return;
    box.style.borderColor = "black";
    if (idx > 0) box.style.display = "none";
  });
  buttons.addSecondEAN.style.display = "flex";
  if (box1) {
    box1.insertAdjacentElement("afterend", buttons.addSecondEAN);
  }
  confirmBtn.style.color = "white";
  activeEanCount = 1;
}

zalandoNext.addEventListener("click", () => {
  if (!inputs.best1.value.trim()) return;
  box1.style.borderColor = "green";
  showView("step2");
  focusDelayed(inputs.ean1);
});

inputs.best1.addEventListener("input", () => {
  inputs.best1.value = inputs.best1.value.replace(/\D/g, "");
  const ok = inputs.best1.value.trim();
  document.getElementById("box1").style.borderColor = ok ? "green" : "black";
  zalandoNext.style.color = ok ? "green" : "white";
});

inputs.best1.addEventListener("keydown", e => {
  if (e.key === "Enter") {
    e.preventDefault();
    zalandoNext.click();
  }
});

function updateConfirmState() {
  let allValid = true;
  eanFields.forEach((field, idx) => {
    if (idx >= activeEanCount) return;
    const val = field.input.value.trim();
    const valid = val !== "";
    field.box.style.borderColor = valid ? "green" : "black";
    if (!valid) allValid = false;
  });
  confirmBtn.style.color = allValid ? "green" : "white";
}

eanFields.forEach((field, idx) => {
  field.input.addEventListener("input", () => {
    field.input.value = field.input.value.replace(/\D/g, "");
    updateConfirmState();
  });
  field.input.addEventListener("keydown", e => {
    if (e.key !== "Enter") return;
    e.preventDefault();
    const nextIdx = idx + 1;
    if (nextIdx < activeEanCount) {
      eanFields[nextIdx].input.focus();
    } else if (confirmBtn.style.color === "green") {
      confirmBtn.click();
    }
  });
});

buttons.addSecondEAN.addEventListener("click", () => {
  if (activeEanCount >= eanFields.length) return;
  const nextField = eanFields[activeEanCount];
  nextField.box.style.display = "flex";
  nextField.box.insertAdjacentElement("afterend", buttons.addSecondEAN);
  activeEanCount += 1;
  if (activeEanCount >= eanFields.length) {
    buttons.addSecondEAN.style.display = "none";
  }
  nextField.input.focus();
  updateConfirmState();
});

if (backBtn) {
  backBtn.addEventListener("click", () => {
    resetZalandoStep2();
    showView("best1");
    focusDelayed(inputs.best1);
  });
}

function goBackToEanStep() {
  showView("step2");
  focusDelayed(inputs.ean1);
  updateConfirmState();
}

if (buttons.reasonPrev1) {
  buttons.reasonPrev1.addEventListener("click", goBackToEanStep);
}
if (buttons.reasonPrev2) {
  buttons.reasonPrev2.addEventListener("click", goBackToEanStep);
}

confirmBtn.addEventListener("click", () => {
  const eans = [];
  for (let i = 0; i < activeEanCount; i += 1) {
    const val = eanFields[i].input.value.trim();
    if (!val) return;
    eans.push(val);
  }

  resetZalandoStep2();
  hideAllViews();

  if (eans.length === 1) {
    if (opt1Headline) opt1Headline.textContent = "W\u00e4hle eine EAN aus:";
    showView("opt1");
    buildReasonGrid1(reasonGrid1, ZALANDO_REASONS, eans);
  } else {
    if (opt2Headline) {
      const mapText = {
        2: "W\u00e4hle zwei EANs aus:",
        3: "W\u00e4hle drei EANs aus:",
        4: "W\u00e4hle vier EANs aus:"
      };
      opt2Headline.textContent = mapText[eans.length] || "W\u00e4hle EANs aus:";
    }
    showView("opt2");
    buildReasonGrid2(reasonGrid2, ZALANDO_REASONS, eans);
  }
});

function resetZalandoFlowCompletely() {
  inputs.best1.value = "";
  document.getElementById("box1").style.borderColor = "black";
  zalandoNext.style.color = "white";

  inputs.ean1.value = "";
  inputs.ean2.value = "";
  inputs.ean3.value = "";
  inputs.ean4.value = "";
  box1.style.borderColor = "black";
  box2.style.borderColor = "black";
  box2.style.display = "none";
  if (box3) {
    box3.style.borderColor = "black";
    box3.style.display = "none";
  }
  if (box4) {
    box4.style.borderColor = "black";
    box4.style.display = "none";
  }

  confirmBtn.style.color = "white";

  activeEanCount = 1;

  reasonGrid1.innerHTML = "";
  reasonGrid2.innerHTML = "";

  buttons.confirmReason.disabled = true;
  buttons.confirmReason.style.color = "white";
  buttons.confirmReason.style.cursor = "not-allowed";

  buttons.confirmReason2.disabled = true;
  buttons.confirmReason2.style.color = "white";
  buttons.confirmReason2.style.cursor = "not-allowed";

  buttons.addSecondEAN.style.display = "flex";
  if (box1) {
    box1.insertAdjacentElement("afterend", buttons.addSecondEAN);
  }
}

function buildReasonGrid1(grid, reasons, eans) {
  const assignments = {};

  function isAssigned() {
    return assignments.hasOwnProperty(eans[0]);
  }

  function updateUI() {
    Array.from(grid.children).forEach(btn => {
      btn.classList.remove("selected", "keyboard-selected");
      btn.querySelector(".ean-tags")?.remove();
      btn.querySelector(".remove-tag")?.remove();
    });

    if (isAssigned()) {
      const currentEAN = eans[0];
      const currentReason = assignments[currentEAN];
      const btn = Array.from(grid.children)
        .find(b => b.textContent.trim() === currentReason);
      if (btn) {
        btn.classList.add("selected");
        const tagBox = document.createElement("div");
        tagBox.className = "ean-tags";
        tagBox.style.cssText = `
          margin-top: 4px;
          font-size: 12px;
          color: white;
          background-color: rgba(0, 150, 0, 0.7);
          border-radius: 4px;
          padding: 2px 4px;
          text-align: center;
        `;
        const idx = eans.indexOf(currentEAN);
        const label = idx >= 0 ? `${idx + 1}. ${currentEAN}` : currentEAN;
        tagBox.innerHTML = `<div>${label}</div>`;
        btn.appendChild(tagBox);
        const removeBtn = document.createElement("span");
        removeBtn.className = "remove-tag";
        removeBtn.innerHTML = "&times;";
        removeBtn.style.cssText = `
          position: absolute;
          top: 4px;
          right: 6px;
          color: white;
          cursor: pointer;
          user-select: none;
          text-shadow: 1px 1px 2px rgba(0,0,0,0.5);
        `;
        removeBtn.addEventListener("click", e => {
          e.stopPropagation();
          delete assignments[currentEAN];
          updateUI();
        });
        btn.appendChild(removeBtn);
      }
    }

    if (isAssigned()) {
      buttons.confirmReason.disabled = false;
      buttons.confirmReason.style.color = "#4caf50";
      buttons.confirmReason.style.cursor = "pointer";
      buttons.confirmReason.focus();
    } else {
      buttons.confirmReason.disabled = true;
      buttons.confirmReason.style.color = "white";
      buttons.confirmReason.style.cursor = "not-allowed";
    }
  }

  grid.innerHTML = "";
  buttons.confirmReason.disabled = true;
  buttons.confirmReason.style.display = "inline-block";
  buttons.confirmReason.style.color = "white";
  buttons.confirmReason.style.cursor = "not-allowed";

  reasons.forEach(grund => {
    const btn = document.createElement("button");
    btn.textContent = grund;
    btn.tabIndex = 0;
    btn.style.cssText = `
      padding: 10px;
      font-size: 14px;
      border: 2px solid black;
      border-radius: 6px;
      background: #eee;
      cursor: pointer;
      outline: none;
      position: relative;
      min-height: 60px;
      transition: transform 0.1s ease, border-color 0.1s ease, box-shadow 0.1s ease;
    `;

    btn.addEventListener("focus", () => btn.classList.add("keyboard-selected"));
    btn.addEventListener("blur", () => btn.classList.remove("keyboard-selected"));

    btn.addEventListener("click", () => {
      const currentEAN = eans[0];
      if (!isAssigned()) {
        assignments[currentEAN] = grund;
        updateUI();
      }
    });

    btn.addEventListener("keydown", e => {
      const btns = Array.from(grid.querySelectorAll("button"));
      const index = btns.indexOf(btn);
      if (e.key === "ArrowRight") {
        e.preventDefault();
        btns[(index + 1) % btns.length].focus();
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        btns[(index - 1 + btns.length) % btns.length].focus();
      } else if (e.key === "Enter") {
        e.preventDefault();
        if (!isAssigned()) {
          btn.click();
        }
      }
    });

    grid.appendChild(btn);
  });

  buttons.confirmReason.onclick = () => {
    const eanList = Object.keys(assignments);
    if (!eanList.length) return;
    const reasonList = eanList.map(ean => assignments[ean]);

    sendZalandoTicket({
      kachelname: currentTileName,
      orderId:    inputs.best1.value.trim(),
      eans:       eanList,
      reasons:    reasonList
    });

    resetZalandoFlowCompletely();
    Object.keys(assignments).forEach(key => delete assignments[key]);
    hideAllViews();
    showView("tile");
  };

  buttons.confirmReason.addEventListener("keydown", e => {
    if (e.key === "Enter" && !buttons.confirmReason.disabled) {
      e.preventDefault();
      e.stopImmediatePropagation();
      buttons.confirmReason.click();
    }
  });

  buttons.confirmReason.addEventListener("keydown", e => {
    if (e.key === "Enter" && !buttons.confirmReason.disabled) {
      e.preventDefault();
      buttons.confirmReason.click();
    }
  });

  setTimeout(() => {
    const firstBtn = grid.querySelector("button");
    if (firstBtn) firstBtn.focus();
  }, 50);
}

function buildReasonGrid2(grid, reasons, eans) {
  // allow duplicate EAN values by tracking via index keys
  const eanEntries = eans.map((ean, idx) => ({ key: `slot-${idx}`, label: ean }));
  const assignments = {}; // key -> grund

  function totalAssigned() {
    return Object.keys(assignments).length;
  }
  function nextFreeSlot() {
    return eanEntries.find(entry => !(entry.key in assignments));
  }

  function updateUI() {
    const usagePerReason = {};
    eanEntries.forEach((entry, index) => {
      const grund = assignments[entry.key];
      if (!grund) return;
      if (!usagePerReason[grund]) usagePerReason[grund] = [];
      usagePerReason[grund].push(`${index + 1}. ${entry.label}`);
    });

    Array.from(grid.children).forEach(btn => {
      btn.classList.remove("selected", "keyboard-selected");
      btn.querySelector(".ean-tags")?.remove();
      btn.querySelector(".remove-tag")?.remove();
    });

    Object.entries(usagePerReason).forEach(([grund, zugewieseneEANs]) => {
      const btn = Array.from(grid.children).find(b => b.textContent.trim() === grund);
      if (!btn) return;

      btn.classList.add("selected");

      const tagBox = document.createElement("div");
      tagBox.className = "ean-tags";
      tagBox.style.cssText = `
        margin-top: 4px;
        font-size: 12px;
        color: white;
        background-color: rgba(0, 150, 0, 0.7);
        border-radius: 4px;
        padding: 2px 4px;
        text-align: center;
      `;
      tagBox.innerHTML = zugewieseneEANs.map(ean => `<div>${ean}</div>`).join("");
      btn.appendChild(tagBox);

      const removeBtn = document.createElement("span");
      removeBtn.className = "remove-tag";
      removeBtn.innerHTML = "&times;";
      removeBtn.style.cssText = `
        position: absolute;
        top: 4px;
        right: 6px;
        font-size: 1rem;
        color: white;
        cursor: pointer;
        user-select: none;
        text-shadow: 1px 1px 2px rgba(0,0,0,0.5);
      `;
      removeBtn.addEventListener("click", e => {
        e.stopPropagation();
        Object.keys(assignments).forEach(key => {
          if (assignments[key] === grund) {
            delete assignments[key];
          }
        });
        updateUI();
      });
      btn.appendChild(removeBtn);
    });

    if (totalAssigned() === eanEntries.length) {
      buttons.confirmReason2.disabled = false;
      buttons.confirmReason2.style.color = "#4caf50";
      buttons.confirmReason2.style.cursor = "pointer";
      buttons.confirmReason2.focus();
    } else {
      buttons.confirmReason2.disabled = true;
      buttons.confirmReason2.style.color = "white";
      buttons.confirmReason2.style.cursor = "not-allowed";
    }
  }

  grid.innerHTML = "";
  buttons.confirmReason2.disabled = true;
  buttons.confirmReason2.style.display = "inline-block";
  buttons.confirmReason2.style.color = "white";
  buttons.confirmReason2.style.cursor = "not-allowed";

  reasons.forEach(grund => {
    const btn = document.createElement("button");
    btn.textContent = grund;
    btn.tabIndex = 0;
    btn.style.cssText = `
      padding: 10px;
      font-size: 14px;
      border: 2px solid black;
      border-radius: 6px;
      background: #eee;
      cursor: pointer;
      outline: none;
      position: relative;
      min-height: 60px;
      transition: transform 0.1s ease, border-color 0.1s ease, box-shadow 0.1s ease;
    `;

    btn.addEventListener("focus", () => btn.classList.add("keyboard-selected"));
    btn.addEventListener("blur", () => btn.classList.remove("keyboard-selected"));

    btn.addEventListener("click", () => {
      if (totalAssigned() >= eanEntries.length) return;
      const frei = nextFreeSlot();
      if (frei) {
        assignments[frei.key] = grund;
        updateUI();
      }
    });

    btn.addEventListener("keydown", e => {
      const btns = Array.from(grid.querySelectorAll("button"));
      const index = btns.indexOf(btn);
      if (e.key === "ArrowRight") {
        e.preventDefault();
        btns[(index + 1) % btns.length].focus();
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        btns[(index - 1 + btns.length) % btns.length].focus();
      } else if (e.key === "Enter") {
        e.preventDefault();
        btn.click();
        if (totalAssigned() === eanEntries.length) {
          buttons.confirmReason2.focus();
        }
      }
    });

    grid.appendChild(btn);
  });

  buttons.confirmReason2.onclick = () => {
    if (Object.keys(assignments).length < eanEntries.length) return;

    const eanList = eanEntries.map(e => e.label);
    const reasonList = eanEntries.map(e => assignments[e.key]);

    sendZalandoTicket({
      kachelname: currentTileName,
      orderId:    inputs.best1.value.trim(),
      eans:       eanList,
      reasons:    reasonList
    });

    resetZalandoFlowCompletely();
    Object.keys(assignments).forEach(key => delete assignments[key]);
    hideAllViews();
    showView("tile");
  };

  buttons.confirmReason2.addEventListener("keydown", e => {
    if (e.key === "Enter" && !buttons.confirmReason2.disabled) {
      e.preventDefault();
      e.stopImmediatePropagation();
      buttons.confirmReason2.click();
    }
  });

  buttons.confirmReason2.addEventListener("keydown", e => {
    if (e.key === "Enter" && !buttons.confirmReason2.disabled) {
      e.preventDefault();
      buttons.confirmReason2.click();
    }
  });

  setTimeout(() => {
    const firstBtn = grid.querySelector("button");
    if (firstBtn) firstBtn.focus();
  }, 50);
}

async function sendZalandoTicket({ kachelname, orderId, eans = [], reasons = [], ean1, ean2, reason }) {
  const eanList = Array.isArray(eans) && eans.length ? eans.filter(Boolean) : [ean1, ean2].filter(Boolean);
  const reasonList = Array.isArray(reasons) && reasons.length ? reasons.filter(r => r !== undefined) : (reason ? [reason] : []);
  const safeOrder = orderId || "-";
  const eansText = eanList.length ? eanList.join(", ") : "-";
  const reasonsText = reasonList.length ? reasonList.join(", ") : "-";
  const detailString = `Order: ${safeOrder} | EANs: ${eansText} | Grund: ${reasonsText}`;
  if (typeof recordTicket === "function") {
    recordTicket({
      kachelname,
      details: detailString,
      typeKey: "zalando-bestellung"
    });
  }
  try {
    if (hasSent) return;
    hasSent = true;
    await sendPlannerTicket({
      kachelname,
      orderId: safeOrder,
      eans: eanList,
      reasons: reasonList
    });
  } catch (err) {
    console.error("Fehler beim Erstellen des Tickets:", err);
    alert("Fehler beim Erstellen des Tickets: " + err.message);
  } finally {
    hasSent = false;
  }
}
