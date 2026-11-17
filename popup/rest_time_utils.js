
/**
* FITXER D'UTILITATS
*/
// Actualitza l'etiqueta del badge i el marcador numèric segons l'opció seleccionada
async function actualitzaPresetActiu(resetTimer = false) {
  const selectedOption = quickPresetSelect.options[quickPresetSelect.selectedIndex];
  if (!selectedOption) return;

  const presetId = selectedOption.value;
  const name = selectedOption.dataset.name;
  const minutes = parseInt(selectedOption.dataset.minutes, 10);

  activePresetLabel.textContent = name;

  if (resetTimer) {
    clearInterval(timerInterval);
    isRunning = false;
    endTime = null;
    totalSeconds = minutes * 60;
    remainingSeconds = totalSeconds;
    actualitzaUITimer();

    await browser.storage.local.set({
      timerState: {
        presetId,
        isRunning: false,
        remainingSeconds,
        totalSeconds,
        endTime: null
      }
    });
  }
}

/**
* CARREGA DELS PRESETS
*/
//Es mostren els valors dels presets per defecte dins el llistat disponible
function carregaConfiguracioPresets() {
  presetsList.innerHTML = "";
  draftPresets.forEach((preset) => {
    const li = document.createElement("li");
    li.className = "preset-item";

    const infoDiv = document.createElement("div");
    infoDiv.className = "preset-item-info";

    const colorDot = document.createElement("span");
    colorDot.className = "preset-color-dot";
    colorDot.style.backgroundColor = preset.color;

    const nameSpan = document.createElement("span");
    nameSpan.className = "preset-item-name";
    nameSpan.textContent = preset.name;

    infoDiv.appendChild(colorDot);
    infoDiv.appendChild(nameSpan);

    const metaDiv = document.createElement("div");
    metaDiv.className = "preset-item-meta";

    const minSpan = document.createElement("span");
    minSpan.textContent = `${preset.minutes}m`;

    const delBtn = document.createElement("button");
    delBtn.className = "btn-delete-preset";
    delBtn.textContent = "×";
    const t = TRANSLATIONS[currentLang] || TRANSLATIONS.ca;
	delBtn.title = t.deletePresetTooltip;
    delBtn.addEventListener("click", () => {
      draftPresets = draftPresets.filter((item) => item.id !== preset.id);
      carregaConfiguracioPresets();
    });

    metaDiv.appendChild(minSpan);
    metaDiv.appendChild(delBtn);

    li.appendChild(infoDiv);
    li.appendChild(metaDiv);
    presetsList.appendChild(li);
  });
}

/**
* COMPTE ENRERE
*/
// Formata segons a MM:SS
function formatejaTempsCrono(seconds) {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
}

// Actualitza la pantalla numèrica i el text del botó Iniciar / Pausar
function actualitzaUITimer() {
  const t = TRANSLATIONS[currentLang] || TRANSLATIONS.ca;
  timerDisplay.textContent = formatejaTempsCrono(remainingSeconds);
  playPauseText.textContent = isRunning ? t.pauseBtn : t.startBtn;
}

// Inicia l'interval visual de compte enrere
function iniciaCompteEnrera() {
  clearInterval(timerInterval);
  timerInterval = setInterval(async () => {
    const now = Date.now();
    const diff = Math.ceil((endTime - now) / 1000);

    if (diff <= 0) {
      clearInterval(timerInterval);
      isRunning = false;
      remainingSeconds = 0;
      endTime = null;
      actualitzaUITimer();
      await browser.storage.local.set({
        timerState: { presetId: quickPresetSelect.value, isRunning: false, remainingSeconds: 0, totalSeconds, endTime: null }
      });
      return;
    }

    remainingSeconds = diff;
    actualitzaUITimer();
  }, 250); // Actualitzem cada 250ms per evitar salts visuals de segon
}

/**
* TRACTAMENT DEL FLUID
*/
// Converteix un color hexadecimal (#RRGGBB) a components RGB
function converteixColorFluid(hexColor) {
  const cleanHex = (hexColor || "#00d2ff").replace("#", "");
  const r = parseInt(cleanHex.substring(0, 2), 16);
  const g = parseInt(cleanHex.substring(2, 4), 16);
  const b = parseInt(cleanHex.substring(4, 6), 16);

  return `rgb(${r}, ${g}, ${b})`;
}

// Dibuixa un fotograma del fluid en funció del temps restant i el total
function dibuixaAnimacioFluid(currentRemainingMs, totalDurationMs, baseHexColor) {
  const width = fluidCanvas.width;
  const height = fluidCanvas.height;

  ctx.clearRect(0, 0, width, height);

  // Calculem la proporció restant (entre 0.0 i 1.0)
  const ratio = totalDurationMs > 0 ? Math.max(0, Math.min(1,currentRemainingMs / totalDurationMs)) : 0;

  if (ratio <= 0){
	return;
  }

  // Alçada base del líquid 
  const waterLevelY = height * (1 - ratio);

  // Amplitud i freqüència de l'ona 
  const maxAmplitude = 6;
  const amplitude = ratio < 0.05 ? maxAmplitude * (ratio / 0.05) : maxAmplitude;
  const frequency = 0.1;

  // Color actual enfosquit progressivament
  ctx.fillStyle = converteixColorFluid(baseHexColor);
  ctx.beginPath();
  ctx.moveTo(0, height); 

  // Recorrem l'amplada del canvas dibuixant la cresta sinusoidal
  for (let x = 0; x <= width; x += 2) {
    const y = waterLevelY + Math.sin(x * frequency + wavePhase) * amplitude;
    ctx.lineTo(x, y);
  }

  ctx.lineTo(width, height); // Cantonada inferior dreta
  ctx.closePath();
  ctx.fill();
}

// Bucle continu d'animació
function generaFluidAnimatBucle() {
  const selectedOption = quickPresetSelect.options[quickPresetSelect.selectedIndex];
  const baseColor = selectedOption ? selectedOption.dataset.color : "#00d2ff";
  const totalMs = totalSeconds * 1000;

  let currentRemainingMs;

  if (isRunning && endTime) {
    // Càlcul continu amb una baixada suau i constant
    currentRemainingMs = Math.max(0, endTime - Date.now());
    wavePhase += 0.01; // Desplaçament de fase de l'onada (molt suau)
  } else {
    // Si es pausa, mantenim el nivell de l'onada
    currentRemainingMs = remainingSeconds * 1000;
  }

  dibuixaAnimacioFluid(currentRemainingMs, totalMs, baseColor);
  requestAnimationFrame(generaFluidAnimatBucle);
}

/**
 * SISTEMA MULTI-IDIOMA
 */
// Aplica les traduccions a tots els elements de la interfície
function assignaIdiomaSeleccionat(lang) {
  currentLang = TRANSLATIONS[lang] ? lang : "ca";
  const t = TRANSLATIONS[currentLang];

  // Vista principal
  document.querySelector(".timer-box").title = t.timerTooltip;
  settingsBtn.title = t.settingsTooltip;
  resetBtn.textContent = t.resetBtn;
  resetBtn.title = t.resetBtn;
  playPauseText.textContent = isRunning ? t.pauseBtn : t.startBtn;

  // Vista de configuració
  document.querySelector(".settings-title").textContent = t.settingsTitle;
  const blockLabels = document.querySelectorAll(".block-label");
  if (blockLabels[0]) blockLabels[0].textContent = t.presetsLabel;
  if (blockLabels[1]) blockLabels[1].textContent = t.languageLabel;

  newPresetName.placeholder = t.presetNamePlaceholder;
  newPresetMinutes.placeholder = t.presetMinutesPlaceholder;
  newPresetColor.title = t.fluidColorTooltip;
  addPresetBtn.title = t.addPresetTooltip;

  // Opcions del desplegable d'idiomes
  const langOptions = languageSelect.options;
  if (langOptions[0]) langOptions[0].textContent = t.langCa;
  if (langOptions[1]) langOptions[1].textContent = t.langEs;
  if (langOptions[2]) langOptions[2].textContent = t.langEn;

  saveSettingsBtn.textContent = t.saveBtn;
  cancelSettingsBtn.textContent = t.cancelBtn;
}