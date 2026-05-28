// Updated Imports to match your perfectly organized folder structure
import { Measurement } from "./models/Measurement.js";
import { sendCommand } from "./services/apiService.js";
import { connectSocket } from "./services/socketService.js";
import "./components/ActionButton.js";
import "./components/StatusCard.js";
import "./components/Dashboard.js";

const WEBSOCKET_URL = "";
const REQUIRED_MEASUREMENTS = 5;
const PLANT_DISTANCE_CM = 20;

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

    if (!dashboard || !btnStart || !btnPlant || !btnReset) {
        console.error("[App] Required DOM elements not found.");
        return;
    }

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
    const measurement = new Measurement({
        id: rawData.id,
        distance: rawData.distance,
        status: rawData.status || "valid",
        timestamp: rawData.timestamp ? new Date(rawData.timestamp) : new Date(),
        source: rawData.source || "sensor"
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

        if (appState.socketConnection) {
            appState.socketConnection.close();
            appState.socketConnection = null;
        }

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