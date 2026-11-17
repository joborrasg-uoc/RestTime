/**
* DECLARACIO DE VARIABLES I CONSTANTS
*/
// Identificadors de navegació entre vistes
const mainView = document.getElementById("mainView");
const settingsView = document.getElementById("settingsView");
const settingsBtn = document.getElementById("settingsBtn");
const saveSettingsBtn = document.getElementById("saveSettingsBtn");
const cancelSettingsBtn = document.getElementById("cancelSettingsBtn");

// Identificadors del formulari de configuració
const newPresetName = document.getElementById("newPresetName");
const newPresetMinutes = document.getElementById("newPresetMinutes");
const newPresetColor = document.getElementById("newPresetColor");
const addPresetBtn = document.getElementById("addPresetBtn");
const presetsList = document.getElementById("presetsList");
const languageSelect = document.getElementById("languageSelect");

// Presets inicials per defecte si encara no n'hi ha a storage
const DEFAULT_PRESETS = [
  { id: "1", name: "Pausa Desenvolupament", minutes: 5, color: "#00d2ff" },
  { id: "2", name: "Cuina", minutes: 10, color: "#eab308" },
  { id: "3", name: "Descans", minutes: 15, color: "#1e293b" },
  { id: "4", name: "Dinar", minutes: 50, color: "#f97316" }
];

let draftPresets = [];

// Identificadors de la vista principal
const quickPresetSelect = document.getElementById("quickPresetSelect");
const activePresetLabel = document.getElementById("activePresetLabel");
const timerDisplay = document.getElementById("timerDisplay");

// Identificadors als botons de control del temporitzador
const playPauseBtn = document.getElementById("playPauseBtn");
const playPauseText = document.getElementById("playPauseText");
const resetBtn = document.getElementById("resetBtn");

// Variables d'estat local del cronòmetre
let timerInterval = null;
let isRunning = false;
let remainingSeconds = 300; // 5 minuts per defecte
let totalSeconds = 300;
let endTime = null;

// Identificadors al Canvas
const fluidCanvas = document.getElementById("fluidCanvas");
const ctx = fluidCanvas.getContext("2d");

// Variables d'estat de l'animació del fluid
let wavePhase = 0;

const TRANSLATIONS = {
  ca: {
    timerTooltip: "Cronòmetre",
    settingsTooltip: "Configuració",
    startBtn: "Iniciar",
    pauseBtn: "Pausar",
    resetBtn: "Reiniciar",
    settingsTitle: "Configuració",
    presetsLabel: "Presets",
    presetNamePlaceholder: "Nom",
    presetMinutesPlaceholder: "Min",
    fluidColorTooltip: "Color del fluid",
    addPresetTooltip: "Afegir preset",
    deletePresetTooltip: "Eliminar",
    languageLabel: "Idioma",
    langCa: "Català",
    langEs: "Espanyol",
    langEn: "Anglès",
    saveBtn: "Acceptar",
    cancelBtn: "Cancel·lar"
  },
  es: {
    timerTooltip: "Cronómetro",
    settingsTooltip: "Configuración",
    startBtn: "Iniciar",
    pauseBtn: "Pausar",
    resetBtn: "Reiniciar",
    settingsTitle: "Configuración",
    presetsLabel: "Presets",
    presetNamePlaceholder: "Nombre",
    presetMinutesPlaceholder: "Min",
    fluidColorTooltip: "Color del fluido",
    addPresetTooltip: "Añadir preset",
    deletePresetTooltip: "Eliminar",
    languageLabel: "Idioma",
    langCa: "Catalán",
    langEs: "Español",
    langEn: "Inglés",
    saveBtn: "Aceptar",
    cancelBtn: "Cancelar"
  },
  en: {
    timerTooltip: "Timer",
    settingsTooltip: "Settings",
    startBtn: "Start",
    pauseBtn: "Pause",
    resetBtn: "Reset",
    settingsTitle: "Settings",
    presetsLabel: "Presets",
    presetNamePlaceholder: "Name",
    presetMinutesPlaceholder: "Min",
    fluidColorTooltip: "Fluid color",
    addPresetTooltip: "Add preset",
    deletePresetTooltip: "Delete",
    languageLabel: "Language",
    langCa: "Catalan",
    langEs: "Spanish",
    langEn: "English",
    saveBtn: "Save",
    cancelBtn: "Cancel"
  }
};

let currentLang = "ca";