/* Startseite: Passwort reset flow */

Array.from(containers.pass1.querySelectorAll(".passwort-reason")).forEach(btn => {
  btn.addEventListener("click", () => {
    passReason = btn.dataset.reason;

    if (passReason === "Sonstiges") {
      document.getElementById("passwortHeadline").textContent = `Grund: ${passReason}`;
      hideAllViews();
      showView("pass2");
      focusDelayed(inputs.newPassword);
    } else {
      if (hasSent) return;
      hasSent = true;
      if (typeof recordTicket === "function") {
        recordTicket({
          kachelname: "Zalando Passwort zurücksetzen",
          details: `Grund: ${passReason}`,
          typeKey: "zalando-passwort"
        });
      }

      sendPlannerTicket({
        kachelname: "Zalando Passwort zurücksetzen",
        reason:     passReason,
        password:   ""
      })
        .then(() => showView("tile"))
        .catch(err => {
          console.error("Fehler beim direkten Passwort-Reset-Ticket:", err);
          alert("Fehler beim Absenden: " + err.message);
        })
        .finally(() => {
          hasSent = false;
        });
    }
  });
});

const passButtons = Array.from(containers.pass1.querySelectorAll(".passwort-reason"));

passButtons.forEach((btn, idx) => {
  btn.addEventListener("keydown", e => {
    const btns = passButtons;
    const index = idx;

    if (e.key === "ArrowRight" || e.key === "ArrowDown") {
      e.preventDefault();
      const next = (index + 1) % btns.length;
      btns[next].focus();
    }
    else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
      e.preventDefault();
      const prev = (index - 1 + btns.length) % btns.length;
      btns[prev].focus();
    }
    else if (e.key === "Enter") {
      e.preventDefault();
      btn.click();
    }
  });
});

function focusFirstPasswortReason() {
  setTimeout(() => {
    if (passButtons.length > 0) {
      passButtons[0].focus();
    }
  }, 50);
}

inputs.newPassword.addEventListener("input", () => {
  buttons.passConfirm.style.color = inputs.newPassword.value.trim() ? "green" : "white";
});

inputs.newPassword.addEventListener("keydown", e => {
  if (e.key === "Enter" && inputs.newPassword.value.trim()) {
    e.preventDefault();
    buttons.passConfirm.click();
  }
});

buttons.passConfirm.addEventListener("click", async e => {
  e.preventDefault();
  const np = inputs.newPassword.value.trim();
  if (!np) return;
  if (!passReason) {
    alert("Bitte zuerst einen Grund auswählen.");
    return;
  }
  if (hasSent) return;

  hasSent = true;
  if (typeof recordTicket === "function") {
    recordTicket({
      kachelname: "Zalando Passwort zurücksetzen",
      details: `Grund: ${passReason}`,
      typeKey: "zalando-passwort"
    });
  }

  try {
    await sendPlannerTicket({
      kachelname: "Zalando Passwort zurücksetzen",
      reason:     passReason,
      password:   np
    });
    inputs.newPassword.value = "";
    buttons.passConfirm.style.color = "white";
    showView("tile");
  } catch (err) {
    console.error("Fehler beim Passwort-Reset:", err);
    alert("Fehler beim Passwort-Reset: " + err.message);
  } finally {
    hasSent = false;
  }
});
