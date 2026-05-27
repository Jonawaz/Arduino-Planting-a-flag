# AAAdlander Command Center - Vlag Planten Dashboard

## Project Overview
This is the Blok 4 dashboard for the AAAdlander **Module 4 - Vlag Planten** assignment.
The application is built with HTML, CSS and vanilla JavaScript ES Modules. It does not use React, Vite or another framework.

The dashboard is made for Azure Static Web Apps and can already run with mock data. Later the mock data can be replaced by the real WebSocket and REST API connection.

## Assignment Fit
This dashboard supports the Blok 4 requirements:

- The web application can show measurement data from the module.
- The web application can send commands to the module.
- REST/API logic is separated in `apiService.js`.
- WebSocket/live-data logic is separated in `socketService.js`.
- The dashboard checks five distance measurements before allowing the plant command.
- The app has a space-themed design.
- The AASA logo/badge is visible in the header.

## Architecture

### Model Layer
- `Measurement.js`  
  Contains the data model for one distance measurement and validates if the distance is usable.

### Service Layer
- `apiService.js`  
  Handles outgoing REST/API commands such as `START_MEASUREMENT`, `PLANT_FLAG` and `RESET`.

- `socketService.js`  
  Handles incoming WebSocket/live measurement data. If no WebSocket URL is configured, it starts mock data.

### Component Layer
- `Dashboard.js`  
  Defines the custom element `<plant-dashboard>`. This file only renders HTML structure and data. It does not contain CSS styling.

### Controller Layer
- `app.js`  
  Connects the buttons, model, services and dashboard together.

### View/Style Layer
- `index.html`  
  Contains the page structure.

- `style.css`  
  Contains all visual styling, including the space theme, dashboard cards, buttons and responsive layout.

## Features

### Dashboard Display
- Current distance measurement
- Connection status
- Average distance
- Last five measurements
- Ready/not-ready plant status
- Last command
- Last update time
- Decision rules

### Planting Logic
The flag may only be planted when:

1. Five measurements have been collected.
2. All five measurements are valid.
3. The distance values are between 0 and 200 cm.
4. The average distance is 20 cm or less.

### Controls
- `Start Measurement` starts the measurement sequence.
- `Plant Flag` sends the plant command only when the conditions are valid.
- `Reset` clears the dashboard and closes the current mock/WebSocket connection.

### Mock Mode
The app works without Arduino or backend:

- If `WEBSOCKET_URL` is empty in `app.js`, mock measurements are generated.
- If `API_BASE_URL` is empty in `apiService.js`, API commands are logged as mock commands.

## File Structure

```text
Arduino-Planting-a-flag/
├── index.html
├── style.css
├── app.js
├── Measurement.js
├── Dashboard.js
├── apiService.js
├── socketService.js
└── README.md
```

## Technology Stack

- HTML5
- CSS3
- JavaScript ES Modules
- Custom Elements / Web Components
- Fetch API
- WebSocket API
- Azure Static Web Apps

## Production Configuration

### WebSocket URL
In `app.js`, replace:

```javascript
const WEBSOCKET_URL = "";
```

with the real WebSocket URL, for example:

```javascript
const WEBSOCKET_URL = "wss://your-websocket-url";
```

### REST API URL
In `apiService.js`, replace:

```javascript
const API_BASE_URL = "";
```

with the real API URL, for example:

```javascript
const API_BASE_URL = "https://your-api-url.azurewebsites.net/api";
```

## Expected WebSocket Data Format

```json
{
  "id": 1,
  "distance": 15.5,
  "status": "valid",
  "timestamp": "2026-05-27T12:00:00Z",
  "source": "sensor"
}
```

## Expected API Command Format

```json
{
  "name": "PLANT_FLAG",
  "timestamp": "2026-05-27T12:00:00Z"
}
```

## Local Testing
Use Live Server in VS Code.
Do not double-click `index.html`, because ES module imports work better through a local server.

## Azure Deployment
This project is ready for Azure Static Web Apps:

- Build preset: Custom
- App location: `/`
- Output location: leave empty
- No build command needed

## Notes for School Documentation
This application uses a simple MVC-style structure:

- Model: `Measurement.js`
- View/Component: `Dashboard.js` and `index.html`
- Controller: `app.js`
- Services: `apiService.js` and `socketService.js`

This makes the code easier to explain, test and maintain.
