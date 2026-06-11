//  Imports
import { Measurement } from "./models/Measurement.js";
import { sendCommand } from "./services/apiService.js";
import { connectSocket } from "./services/socketService.js";
import "./components/ActionButton.js";
import "./components/StatusCard.js";
import "./components/Dashboard.js";

const WEBSOCKET_URL = "ws://145.49.127.250:1880/ws/groep14";
const REQUIRED_MEASUREMENTS = 5;
const PLANT_DISTANCE_CM = 20;

// LED Test buttons 
let btnLedOn = null;
let btnLedOff = null;

let dashboard = null;
let btnStart = null;
let btnPlant = null;
let btnReset = null;

let appState = {
    measurements: [],
    socketConnection: null,
    isRunning: false,
    lastCommand: "None",
    connectionStatus: "Not started",
    lastUpdateTime: new Date()
};

function init() {
    dashboard = document.querySelector("plant-dashboard");
    btnStart = document.getElementById("btn-start");
    btnPlant = document.getElementById("btn-plant");
    btnReset = document.getElementById("btn-reset");

    // 1. Locate the new LED buttons:
    btnLedOn = document.getElementById("btn-led-on");
    btnLedOff = document.getElementById("btn-led-off");

    // 2. Updated safety check to prevent null errors [5]:
    if (!dashboard || !btnStart || !btnPlant || !btnReset || !btnLedOn || !btnLedOff) {
        console.error("[App] Required DOM elements or LED buttons not found.");
        return;
    }

    // 3. Bind click listeners:
    btnLedOn.addEventListener("click", turnLedOn);
    btnLedOff.addEventListener("click", turnLedOff);

    btnStart.addEventListener("click", startMeasurement);
    btnPlant.addEventListener("click", plantFlag);
    btnReset.addEventListener("click", resetDashboard);

    updateDashboard();
    console.log("[App] Initialized successfully.");
}

function startMeasurement() {
    resetMeasurementsOnly();

    appState.isRunning = true;
    appState.lastCommand = "START_MEASUREMENT";
    appState.connectionStatus = "Starting measurement";
    appState.lastUpdateTime = new Date();

    btnStart.disabled = true;

    sendCommand("START_MEASUREMENT", {}).then(response => {
        recordCommand("START_MEASUREMENT", response.success);
    });

    if (appState.socketConnection) {
        appState.socketConnection.close();
        appState.socketConnection = null;
    }

    appState.socketConnection = connectSocket({
        url: WEBSOCKET_URL,
        onDataReceived: handleIncomingMeasurement,
        onStatusChange: status => {
            appState.connectionStatus = status;
            appState.lastUpdateTime = new Date();
            updateDashboard();
        }
    });

    updateDashboard();
}

function handleIncomingMeasurement(rawData) {
    console.log("[App] Raw incoming data:", rawData);

    const data = rawData.payload ? rawData.payload : rawData;

    let extractedDistance =
        data.proximity_1 !== undefined ? data.proximity_1 :
        data.distance_1 !== undefined ? data.distance_1 :
        data.distance !== undefined ? data.distance :
        data.distance_130 !== undefined ? data.distance_130 :
        data.distanceMm !== undefined ? data.distanceMm :
        data.distance_mm !== undefined ? data.distance_mm :
        undefined;

    if (extractedDistance === undefined || extractedDistance === null) {
        console.warn("[App] Received payload without distance/proximity data:", rawData);
        return;
    }

    extractedDistance = Number(extractedDistance);

    const measurement = new Measurement({
        id: data.id || `m_${Date.now()}`,
        distance: extractedDistance,
        status: data.status || data.status_1 || "valid",
        timestamp: data.timestamp ? new Date(data.timestamp) : new Date(),
        source: data.source || "live-sensor"
    });

    appState.measurements.push(measurement);

    if (appState.measurements.length > REQUIRED_MEASUREMENTS) {
        appState.measurements = appState.measurements.slice(-REQUIRED_MEASUREMENTS);
    }

    appState.lastUpdateTime = new Date();
    updateDashboard();

    if (appState.measurements.length >= REQUIRED_MEASUREMENTS && appState.isRunning) {
        appState.isRunning = false;
        btnStart.disabled = false;
        appState.connectionStatus = "Measurement complete";
        appState.lastUpdateTime = new Date();
        updateDashboard();
    }
}

function calculateAverageDistance() {
    const validMeasurements = appState.measurements.filter(item => item.isValid);
    if (validMeasurements.length === 0) return null;
    const total = validMeasurements.reduce((sum, item) => sum + item.distance, 0);
    return total / validMeasurements.length;
}

function checkReadyToPlant() {
    if (appState.measurements.length < REQUIRED_MEASUREMENTS) return false;
    const validMeasurements = appState.measurements.filter(item => item.isValid);
    if (validMeasurements.length < REQUIRED_MEASUREMENTS) return false;
    const averageDistance = calculateAverageDistance();
    if (averageDistance === null) return false;
    return averageDistance <= PLANT_DISTANCE_CM;
}

function plantFlag() {
    if (!checkReadyToPlant()) {
        alert(
            "Not ready to plant.\n\n" +
            "Requirements:\n" +
            "- 5 valid measurements\n" +
            "- distance must be between 0 and 200 cm\n" +
            "- average distance must be 20 cm or less"
        );
        return;
    }

    appState.lastCommand = "PLANT_FLAG";
    appState.lastUpdateTime = new Date();

    sendCommand("PLANT_FLAG", {
        averageDistance: calculateAverageDistance(),
        measurements: appState.measurements.map(item => item.toJSON())
    }).then(response => {
        recordCommand("PLANT_FLAG", response.success);
        if (response.success) {
            alert("Plant command sent successfully.");
        } else {
            alert("Plant command failed. Check the console.");
        }
    });

    updateDashboard();
}

function resetDashboard() {
    if (appState.socketConnection) {
        appState.socketConnection.close();
        appState.socketConnection = null;
    }

    appState.measurements = [];
    appState.isRunning = false;
    appState.connectionStatus = "Reset";
    appState.lastCommand = "RESET";
    appState.lastUpdateTime = new Date();

    btnStart.disabled = false;

    sendCommand("RESET", {}).then(response => {
        recordCommand("RESET", response.success);
    });

    updateDashboard();
}

function resetMeasurementsOnly() {
    if (appState.socketConnection) {
        appState.socketConnection.close();
        appState.socketConnection = null;
    }
    appState.measurements = [];
    appState.lastUpdateTime = new Date();
    updateDashboard();
}

function recordCommand(commandName, success) {
    appState.lastCommand = `${commandName} (${success ? "success" : "failed"})`;
    appState.lastUpdateTime = new Date();
    updateDashboard();
}

function updateDashboard() {
    if (!dashboard) return;

    dashboard.updateState({
        measurements: [...appState.measurements],
        averageDistance: calculateAverageDistance(),
        isReadyToPlant: checkReadyToPlant(),
        currentMeasurement: appState.measurements.length > 0
            ? appState.measurements[appState.measurements.length - 1]
            : null,
        connectionStatus: appState.connectionStatus,
        lastCommand: appState.lastCommand,
        lastUpdateTime: appState.lastUpdateTime
    });
}

if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
} else {
    init();
}

console.log("[App] Module loaded.");


// led control functions for testing
function turnLedOn() {
    console.log("[App] Sending LED ON command...");
    appState.lastCommand = "LED_ON";
    appState.lastUpdateTime = new Date();

    sendCommand("LED_ON", {}).then(response => {
        recordCommand("LED_ON", response.success);
    });
}

function turnLedOff() {
    console.log("[App] Sending LED OFF command...");
    appState.lastCommand = "LED_OFF";
    appState.lastUpdateTime = new Date();

    sendCommand("LED_OFF", {}).then(response => {
        recordCommand("LED_OFF", response.success);
    });
}