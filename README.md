# AAAdlander Command Center - Groep 14

Deze repository bevat het Frontend Dashboard voor het Blok 4 Interdisciplinair Project: **Vlag Planten**. 

Het dashboard is gebouwd om te communiceren met een Arduino-module om live afstandsmetingen uit te lezen en een commando te sturen om een vlag te planten zodra aan specifieke voorwaarden is voldaan.

## 🚀 Functies
* **Live Telemetrie:** Real-time afstands-updates via WebSockets.
* **Slimme Logica:** Berekent automatisch het gemiddelde van de laatste 5 metingen en valideert of de vlag geplant mag worden (Doel: <= 20cm).
* **Mock Data Modus:** Volledig functionele offline modus. Als de Arduino/WebSocket niet beschikbaar is, genereert het dashboard mock data voor testen en UI-ontwikkeling.
* **Custom Web Components:** Gebouwd met de Shadow DOM voor herbruikbare UI-elementen (`<status-card>` en `<action-button>`).
* **Glassmorphism UI:** Modern, responsief space-thema ontwerp met pure CSS (geen externe frameworks).

## 🛠️ Tech Stack
* **HTML5 & CSS3** (Flexbox, CSS Grid, CSS Variables, Animaties)
* **Vanilla JavaScript (ES6+)**
* **Web Components API** (Custom Elements, Shadow DOM)
* **Azure Static Web Apps** (Hosting & CI/CD)

## 📁 Projectarchitectuur
Het project volgt strikt het *Separation of Concerns* principe en maakt gebruik van een modulaire Vanilla JS architectuur:

```text
/
├── index.html                # Hoofdweergave
├── style.css                 # Globale styling en ruimte-achtergrond
├── assets/                   # Afbeeldingen en logo's
└── js/
    ├── app.js                # Hoofdcontroller (beheert state en events)
    ├── models/
    │   └── Measurement.js    # Datamodel voor sensormetingen
    ├── services/
    │   ├── apiService.js     # Verwerkt REST API POST commando's
    │   └── socketService.js  # Verwerkt live WebSocket verbinding
    └── components/
        ├── Dashboard.js      # Hoofdcomponent voor dashboard lay-out
        ├── StatusCard.js     # Herbruikbaar UI-kaart component
        └── ActionButton.js   # Herbruikbaar UI-knop component