// Dashboard Web Component
// This file contains only UI rendering logic.
// All styling is handled in style.css.

class Dashboard extends HTMLElement {
    constructor() {
        super();

        this.state = {
            connectionStatus: "Not started",
            currentMeasurement: null,
            measurements: [],
            averageDistance: null,
            isReadyToPlant: false,
            lastCommand: "None",
            lastUpdateTime: new Date()
        };
    }

    connectedCallback() {
        this.render();
    }

    updateState(newState) {
        this.state = {
            ...this.state,
            ...newState
        };

        this.render();
    }

    render() {
        const validCount = this.state.measurements.filter(item => item.isValid).length;

        const currentDistance = this.state.currentMeasurement
            ? this.state.currentMeasurement.distanceText
            : "-- cm";

        const currentStatus = this.state.currentMeasurement
            ? this.state.currentMeasurement.status
            : "Waiting";

        const averageDistanceText = this.getAverageDistanceText();
        const readyText = this.state.isReadyToPlant ? "Ready to Plant" : "Not Ready";
        const readyClass = this.state.isReadyToPlant ? "ready" : "not-ready";
        const connectionClass = this.getConnectionClass(this.state.connectionStatus);

        this.innerHTML = `
            <section class="dashboard-panel">
                <div class="dashboard-heading">
                    <div>
                        <p class="section-label">Live Telemetry</p>
                        <h2>Module Status Overview</h2>
                    </div>

                    <div class="status-pill ${connectionClass}">
                        <span class="status-dot"></span>
                        ${this.escapeText(this.state.connectionStatus)}
                    </div>
                </div>

                <div class="status-grid">
                    <article class="status-card highlight-card">
                        <p class="card-label">Current Distance</p>
                        <p class="card-value big-value">${currentDistance}</p>
                        <p class="card-text">Latest sensor value</p>
                    </article>

                    <article class="status-card">
                        <p class="card-label">Average Distance</p>
                        <p class="card-value">${averageDistanceText}</p>
                        <p class="card-text">Target: 20 cm or less</p>
                    </article>

                    <article class="status-card ${readyClass}">
                        <p class="card-label">Plant Permission</p>
                        <p class="card-value">${readyText}</p>
                        <p class="card-text">${validCount}/5 valid measurements</p>
                    </article>

                    <article class="status-card">
                        <p class="card-label">Measurement Status</p>
                        <p class="card-value">${this.escapeText(currentStatus)}</p>
                        <p class="card-text">Current measurement state</p>
                    </article>

                    <article class="status-card">
                        <p class="card-label">Last Command</p>
                        <p class="card-value small-value">${this.escapeText(this.state.lastCommand)}</p>
                        <p class="card-text">Latest command action</p>
                    </article>

                    <article class="status-card">
                        <p class="card-label">Last Update</p>
                        <p class="card-value small-value">${this.getLastUpdateTime()}</p>
                        <p class="card-text">Dashboard update time</p>
                    </article>

                    <article class="status-card">
                        <p class="card-label">Rule</p>
                        <p class="card-value">5 Checks</p>
                        <p class="card-text">Only the latest 5 values are used</p>
                    </article>

                    <article class="status-card">
                        <p class="card-label">Valid Range</p>
                        <p class="card-value">0-200 cm</p>
                        <p class="card-text">Invalid values are rejected</p>
                    </article>
                </div>

                <div class="data-grid">
                    <section class="table-card">
                        <div class="table-header">
                            <div>
                                <p class="section-label">Sensor Data</p>
                                <h3>Last 5 Measurements</h3>
                            </div>

                            <span class="mini-badge">${validCount}/5 valid</span>
                        </div>

                        <table>
                            <thead>
                                <tr>
                                    <th>#</th>
                                    <th>Distance</th>
                                    <th>Status</th>
                                    <th>Time</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${this.renderMeasurementRows()}
                            </tbody>
                        </table>
                    </section>

                    <section class="logic-card">
                        <p class="section-label">Planting Logic</p>
                        <h3>Decision Rules</h3>

                        <div class="logic-list">
                            <div class="logic-item">
                                <span class="logic-dot"></span>
                                <p>Collect five distance measurements.</p>
                            </div>

                            <div class="logic-item">
                                <span class="logic-dot"></span>
                                <p>Check that all measurements are valid.</p>
                            </div>

                            <div class="logic-item">
                                <span class="logic-dot"></span>
                                <p>Calculate the average distance.</p>
                            </div>

                            <div class="logic-item">
                                <span class="logic-dot"></span>
                                <p>Allow planting only when the average is 20 cm or less.</p>
                            </div>
                        </div>
                    </section>
                </div>
            </section>
        `;
    }

    renderMeasurementRows() {
        if (this.state.measurements.length === 0) {
            return `
                <tr>
                    <td colspan="4" class="empty-row">No measurements yet. Press Start Measurement.</td>
                </tr>
            `;
        }

        return this.state.measurements.map((measurement, index) => {
            const statusClass = measurement.isValid ? "valid-text" : "invalid-text";
            const statusText = measurement.isValid ? "Valid" : "Invalid";

            return `
                <tr>
                    <td>${index + 1}</td>
                    <td>${measurement.distanceText}</td>
                    <td class="${statusClass}">${statusText}</td>
                    <td>${measurement.timeString}</td>
                </tr>
            `;
        }).join("");
    }

    getAverageDistanceText() {
        if (this.state.measurements.length === 0) {
            return "-- cm";
        }

        if (!Number.isFinite(this.state.averageDistance)) {
            return "-- cm";
        }

        return `${this.state.averageDistance.toFixed(1)} cm`;
    }

    getLastUpdateTime() {
        const time = this.state.lastUpdateTime;

        if (time instanceof Date) {
            return time.toLocaleTimeString();
        }

        const parsedDate = new Date(time);

        if (Number.isNaN(parsedDate.getTime())) {
            return "--";
        }

        return parsedDate.toLocaleTimeString();
    }

    getConnectionClass(status) {
        const value = String(status).toLowerCase();

        if (value.includes("mock")) {
            return "connection-mock";
        }

        if (value.includes("connected") || value.includes("complete")) {
            return "connection-connected";
        }

        if (value.includes("error")) {
            return "connection-error";
        }

        if (value.includes("disconnect") || value.includes("stopped") || value.includes("reset")) {
            return "connection-disconnected";
        }

        return "connection-idle";
    }

    escapeText(value) {
        return String(value ?? "")
            .replaceAll("&", "&amp;")
            .replaceAll("<", "&lt;")
            .replaceAll(">", "&gt;")
            .replaceAll('"', "&quot;")
            .replaceAll("'", "&#039;");
    }
}

customElements.define("plant-dashboard", Dashboard);

export { Dashboard };
