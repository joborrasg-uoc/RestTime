/**
* CARREGA EN MEMORIA DELS PRESETS
*/
// Carrega i omple el selector de la pantalla principal des de storage (o per defecte)
async function carregaPresets() {
  const data = await browser.storage.local.get(["presets"]);
  const presets = (data.presets && data.presets.length > 0) ? data.presets : DEFAULT_PRESETS;

  // Si és el primer inici i no hi havia res guardat, inicialitzem el storage
  if (!data.presets) {
    await browser.storage.local.set({ presets: DEFAULT_PRESETS });
  }

  // Guardem la selecció actual si encara existeix a la nova llista
  const idAnteriorSeleccionat = quickPresetSelect.value;
  quickPresetSelect.innerHTML = "";

  presets.forEach((preset) => {
    const option = document.createElement("option");
    option.value = preset.id;
    option.textContent = `${preset.name} (${preset.minutes} min)`;
    option.dataset.minutes = preset.minutes;
    option.dataset.color = preset.color;
    option.dataset.name = preset.name;
    quickPresetSelect.appendChild(option);
  });

  // Restaura el preset seleccionat prèviament o selecciona el primer de la llista
  const stillExists = presets.some((p) => p.id === idAnteriorSeleccionat);
  if (stillExists) {
    quickPresetSelect.value = idAnteriorSeleccionat;
  }

  actualitzaPresetActiu(false);
}

// Restaura el comptador i el preset seleccionat quan s'obre el popup
async function reiniciaEstatTimer() {
  //Carrega del idioma per defecte
  const langData = await browser.storage.local.get(["language"]);
  if (!langData.language) {
    await browser.storage.local.set({ language: "ca" });
  }
  assignaIdiomaSeleccionat(langData.language || "ca");
  
  //Carrega dels presets
  await carregaPresets();
  const data = await browser.storage.local.get(["timerState"]);

  if (data.timerState) {
    // Si hi havia un preset actiu guardat i encara existeix, el seleccionem
    if (data.timerState.presetId) {
      const exists = Array.from(quickPresetSelect.options).some(
        (opt) => opt.value === data.timerState.presetId
      );
      if (exists) {
        quickPresetSelect.value = data.timerState.presetId;
        const selectedOption = quickPresetSelect.options[quickPresetSelect.selectedIndex];
        activePresetLabel.textContent = selectedOption.dataset.name;
      }
    }

    totalSeconds = data.timerState.totalSeconds || remainingSeconds;
    isRunning = data.timerState.isRunning || false;
    endTime = data.timerState.endTime || null;

    if (isRunning && endTime) {
      const diff = Math.ceil((endTime - Date.now()) / 1000);
      if (diff > 0) {
        remainingSeconds = diff;
        iniciaCompteEnrera();
      } else {
        isRunning = false;
        remainingSeconds = 0;
        endTime = null;
      }
    } else {
      remainingSeconds = data.timerState.remainingSeconds ?? totalSeconds;
    }
	//Actualitzem el compte enrer
    actualitzaUITimer();
  }
  
  //Actualitzem l'animacio del fluid
  requestAnimationFrame(generaFluidAnimatBucle);
}

// Passem explícitament 'true' per evitar rebre l'objecte Event com a paràmetre
quickPresetSelect.addEventListener("change", () => actualitzaPresetActiu(true));

// Substitueix l'antic listener de DOMContentLoaded per aquest:
document.addEventListener("DOMContentLoaded", reiniciaEstatTimer);

/**
* EVENTS DELS BOTONS
*/
// Obrir la vista de configuració
settingsBtn.addEventListener("click", async () => {
  const data = await browser.storage.local.get(["presets", "language"]);
  draftPresets = data.presets ? [...data.presets] : [...DEFAULT_PRESETS];
  languageSelect.value = data.language || "ca";

  carregaConfiguracioPresets();
  mainView.classList.add("hidden");
  settingsView.classList.remove("hidden");
});

// Afegir un nou preset a la llista temporal
addPresetBtn.addEventListener("click", () => {
  const name = newPresetName.value.trim();
  const minutes = parseInt(newPresetMinutes.value, 10);
  const color = newPresetColor.value;

  if (!name || isNaN(minutes) || minutes <= 0) return;

  draftPresets.push({
    id: Date.now().toString(),
    name,
    minutes,
    color
  });

  newPresetName.value = "";
  newPresetMinutes.value = "";
  carregaConfiguracioPresets();
});

// Desar canvis (Acceptar) i tornar a la vista principal
saveSettingsBtn.addEventListener("click", async () => {
  const selectedLang = languageSelect.value;
  const idAnteriorSeleccionat = quickPresetSelect.value;
  const presetsToSave = draftPresets.length > 0 ? draftPresets : [...DEFAULT_PRESETS];

  await browser.storage.local.set({
    presets: presetsToSave,
    language: selectedLang
  });
  assignaIdiomaSeleccionat(selectedLang);

  await carregaPresets();

  const presetStillExists = presetsToSave.some(
    (p) => String(p.id) === String(idAnteriorSeleccionat)
  );

  if (!isRunning && !presetStillExists) {
    await actualitzaPresetActiu(true);
  }

  settingsView.classList.add("hidden");
  mainView.classList.remove("hidden");
});

// Descartar canvis (Cancel·lar) i tornar a la vista principal
cancelSettingsBtn.addEventListener("click", () => {
  settingsView.classList.add("hidden");
  mainView.classList.remove("hidden");
});

// Esdeveniment del botó Iniciar / Pausar
playPauseBtn.addEventListener("click", async () => {
  if (isRunning) {
    // PAUSAR
    clearInterval(timerInterval);
    isRunning = false;
    remainingSeconds = Math.max(0, Math.ceil((endTime - Date.now()) / 1000));
    endTime = null;
  } else {
    // INICIAR (o reprendre)
    if (remainingSeconds <= 0) {
      remainingSeconds = totalSeconds;
    }
    isRunning = true;
    endTime = Date.now() + remainingSeconds * 1000;
    iniciaCompteEnrera();
  }

  actualitzaUITimer();

  // Desem l'estat a storage perquè background.js i main.js el coneguin
  await browser.storage.local.set({
    timerState: {
	  presetId: quickPresetSelect.value,
      isRunning,
      remainingSeconds,
      totalSeconds,
      endTime
    }
  });
});

// Esdeveniment del botó Reiniciar
resetBtn.addEventListener("click", async () => {
  clearInterval(timerInterval);
  isRunning = false;
  endTime = null;
  remainingSeconds = totalSeconds;
  actualitzaUITimer();

  await browser.storage.local.set({
    timerState: {
	  presetId: quickPresetSelect.value,
      isRunning: false,
      remainingSeconds,
      totalSeconds,
      endTime: null
    }
  });
});

/**
* EVENTS DEL NAVEGADOR
*/
// Escolta si ha finalitzat l'alarma mentre el popup estava obert
browser.storage.onChanged.addListener((changes, areaName) => {
  if (areaName !== "local" || !changes.timerState) return;

  const newState = changes.timerState.newValue;
  if (newState && !newState.isRunning && newState.remainingSeconds === 0) {
    clearInterval(timerInterval);
    isRunning = false;
    remainingSeconds = 0;
    endTime = null;
    actualitzaUITimer();
  }
});