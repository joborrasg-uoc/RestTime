/**
*	TASQUES DE FONS PER ACTIVAR LES NOTIFICACIONS
*/
const ALARM_NAME = "restTimeEndAlarm";
const NOTIFICATION_ID = "restTimeFinishedNotification";

// Funció per reproduir el so d'alerta des de la carpeta assets
function playAlertSound() {
  try {
    const soundUrl = browser.runtime.getURL("assets/pup_alert.mp3");
    const audio = new Audio(soundUrl);
    audio.volume = 1.0;
    audio.play().catch((err) => {
      console.warn("No s'ha pogut reproduir el so automàticament:", err);
    });
  } catch (error) {
    console.error("Error inicialitzant l'àudio d'alerta:", error);
  }
}

// Funció per mostrar la notificació nativa del sistema
async function showFinishNotification(presetId) {
  const data = await browser.storage.local.get(["presets", "language"]);
  const presets = data.presets || [];
  const lang = data.language || "ca"; //S'agafa el català com a idioma per defecte

  // Busquem el nom del preset que s'ha executat
  const finishedPreset = presets.find((p) => String(p.id) === String(presetId));
  const presetName = finishedPreset ? finishedPreset.name : "RestTime";

  // Textos adaptats segons l'idioma seleccionat
  const messages = {
    ca: {
      title: "RestTime - Temps finalitzat",
      message: `La pausa "${presetName}" ha acabat.`
    },
    es: {
      title: "RestTime - Tiempo finalizado",
      message: `La pausa "${presetName}" ha terminado.`
    },
    en: {
      title: "RestTime - Time is up",
      message: `Your "${presetName}" break has finished.`
    }
  };

  const text = messages[lang] || messages.ca;

  await browser.notifications.create(NOTIFICATION_ID, {
    type: "basic",
    iconUrl: browser.runtime.getURL("icons/count_down_48.png"),
    title: text.title,
    message: text.message
  });
}

// Detecta modificacions en memotia del storage.local per programar o cancel·lar l'alarma
browser.storage.onChanged.addListener((changes, areaName) => {
  if (areaName !== "local" || !changes.timerState) return;

  const newState = changes.timerState.newValue;
  if (!newState) return;

  if (newState.isRunning && newState.endTime) {
    // Programem l'alarma exacta per a l'instant de finalització
    browser.alarms.create(ALARM_NAME, {
      when: newState.endTime
    });
  } else {
    // Si s'ha pausat, reiniciat o aturat, netegem l'alarma activa
    browser.alarms.clear(ALARM_NAME);
  }
});

// Detecta modificacions quan salta l'alarma 
browser.alarms.onAlarm.addListener(async (alarm) => {
  if (alarm.name !== ALARM_NAME) return;

  const data = await browser.storage.local.get(["timerState"]);
  const currentState = data.timerState || {};

  // Actualitzem l'estat a storage mantenint el presetId actiu
  await browser.storage.local.set({
    timerState: {
      presetId: currentState.presetId || "1",
      isRunning: false,
      remainingSeconds: 0,
      totalSeconds: currentState.totalSeconds || 0,
      endTime: null
    }
  });

  // Disparem l'efecte sonor i la notificació del sistema
  playAlertSound();
  await showFinishNotification(currentState.presetId);
});