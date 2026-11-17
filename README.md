# RestTime

**RestTime** és una extensió per al navegador **Mozilla Firefox** (basada en **Manifest V3**) dissenyada per gestionar períodes de descans.

Aquestes pauses es visualitzen com animacions mitjançant un temporitzador interactiu amb un fluid de colors i alertes en segon pla.

---

## Característiques principals

* **Temporitzador visual amb animació de fluid:** Representació gràfica en temps real mitjançant HTML5 `<canvas>` d'una ona sinusoidal que descendeix proporcionalment al temps restant i s'atura visualment en pausar el cronòmetre.
* **Gestió personalitzada de *presets*:** Permet crear, seleccionar i eliminar intervals de descans configurant-ne el nom, la durada (en minuts) i el color identificatiu del fluid. Inclou quatre perfils predefinits per defecte (*Pausa Desenvolupament*, *Cuina*, *Descans* i *Dinar*).
* **Execució i notificacions en segon pla:** Utilitza les APIs `browser.alarms`, `browser.storage.local` i `browser.notifications` per mantenir el compte enrere actiu encara que es tanqui la finestra emergent (*popup*), reproduint un avís sonor (`pup_alert.mp3`) i mostrant una notificació nativa del sistema en finalitzar.
* **Suport multi-idioma:** Interfície i notificacions disponibles en **Català** (per defecte), **Espanyol** i **Anglès**, amb canvi dinàmic en temps real.
* **Principi de mínim privilegi:** Sol·licita únicament els permisos estrictament necessaris (`storage`, `alarms`, `notifications`).

---

## Estructura del projecte

```text
RestTime/
├── manifest.json                 # Configuració de l'extensió (Manifest V3 per a Firefox)
├── main.js                       # Content script injectat a les pestanyes web
├── LICENSE                       # Llicència Creative Commons CC0 1.0 Universal
├── README.md                     # Documentació del repositori
├── assets/
│   ├── JetBrainsMono_Crono.woff2 # Tipografia monoespaiada per al cronòmetre
│   ├── PlusJakartaSans_Principal.woff2 # Tipografia principal de la interfície
│   └── pup_alert.mp3             # Efecte sonor d'alerta de finalització
├── background/
│   └── background.js             # Service worker / script de fons (alarmes, àudio i notificacions)
├── icons/
│   └── count_down_48.png         # Icona de l'extensió i de les notificacions
└── popup/
    ├── rest_time.html            # Estructura HTML de la finestra emergent (vista principal i configuració)
    ├── rest_time.css             # Full d'estils i variables de disseny
    ├── rest_time_variables.js    # Declaració de variables globals, referències DOM i diccionari de les traduccions
    ├── rest_time_utils.js        # Funcions auxiliars, renderitzat del fluid i gestió de la UI
    └── rest_time.js              # Lògica principal, inicialització d'estat i gestió d'esdeveniments
```

---

## Instal·lació i prova en local (Firefox)

Per carregar i provar l'extensió en mode desenvolupador a Mozilla Firefox:

1. Clona o descarrega aquest repositori:
   ```bash
   git clone https://github.com/joborrasg-uoc/RestTime.git
   ```
2. Obre Mozilla Firefox i accedeix a la barra d'adreces a:
   ```text
   about:debugging#/runtime/this-firefox
   ```
3. Fes clic al botó **Carrega un complement temporal...** (*Load Temporary Add-on...*).
4. Navega fins a la carpeta del projecte i selecciona el fitxer `manifest.json`.
5. Fes clic a la icona de **RestTime** a la barra d'eines del navegador per obrir el temporitzador.

---

## Ús

1. **Seleccionar una pausa:** Tria un dels *presets* disponibles al desplegable inferior.
2. **Controlar el temps:** Prem **Iniciar** per començar el compte enrere (pots pausar-lo o reiniciar-lo en qualsevol moment). Pots tancar la finestra emergent i continuar navegant; l'avís sonor i la notificació saltaran automàticament en acabar.
3. **Personalitzar *presets* i idioma:** Prem la icona de configuració (roda dentada) per afegir o eliminar intervals personalitzats, canviar l'idioma de la interfície i desar els canvis amb **Acceptar**.

---

## Llicència

Aquest projecte es distribueix sota la llicència **Creative Commons CC0 1.0 Universal (Public Domain Dedication)**. 
Pots copiar, modificar, distribuir i utilitzar el codi lliurement, fins i tot per a fins comercials, sense necessitat de demanar permís. Consulta el fitxer `LICENSE` per a més detalls.