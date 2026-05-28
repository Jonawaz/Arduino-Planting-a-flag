class Dashboard extends HTMLElement {
    constructor() {
        super();
        this.state = {
            connectionStatus: "disconnected",
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
        this.state = { ...this.state, ...newState };
        this.render();
    }

    render() {
        const validCount = this.state.measurements.filter(item => item.isValid).length;
        const currentDistance = this.state.currentMeasurement ? this.state.currentMeasurement.distanceText : "-- cm";
        const currentStatus = this.state.currentMeasurement ? this.state.currentMeasurement.status : "Waiting";
        const averageDistanceText = this.getAverageDistanceText();
        
        const readyText = this.state.isReadyToPlant ? "Ready to Plant" : "Not Ready";
        const readyHighlight = this.state.isReadyToPlant ? "success" : "danger";

        this.innerHTML = `
            <style>
                .dashboard-panel {
                    width: 100%;
                    margin-bottom: 2rem;
                }
                
                /* 3x2 Grid for the 6 dynamic cards */
                .status-grid {
                    display: grid;
                    grid-template-columns: repeat(3, 1fr);
                    gap: 1.5rem;
                    margin-bottom: 2rem;
                }

                /* Table Section */
                .table-card {
                    background: rgba(255, 255, 255, 0.03);
                    border: 0.0625rem solid rgba(255, 255, 255, 0.08);
                    border-radius: 1rem;
                    padding: 1.5rem;
                    width: 100%;
                    overflow-x: auto;
                }

                .table-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 1.5rem;
                }

                .table-header h3 {
                    color: #f3f4f6;
                    font-size: 1.2rem;
                    font-weight: 600;
                    margin: 0;
                }

                .mini-badge {
                    background: rgba(255, 255, 255, 0.1);
                    color: #f3f4f6;
                    padding: 0.4rem 0.8rem;
                    border-radius: 1rem;
                    font-size: 0.8rem;
                    font-weight: bold;
                }

                table {
                    width: 100%;
                    border-collapse: collapse;
                    text-align: left;
                }

                th, td {
                    padding: 1rem;
                    border-bottom: 0.0625rem solid rgba(255, 255, 255, 0.05);
                    color: #9ca3af;
                    font-size: 0.9rem;
                }

                th {
                    color: #f3f4f6;
                    font-weight: 600;
                    text-transform: uppercase;
                    letter-spacing: 0.05rem;
                    font-size: 0.8rem;
                }

                tr:last-child td { border-bottom: none; }
                
                .valid-text { color: #4ade80; font-weight: bold; }
                .invalid-text { color: #f87171; font-weight: bold; }
                .empty-row { text-align: center; color: #6b7280; font-style: italic; }

                /* Responsive Grid */
                @media (max-width: 60rem) {
                    .status-grid { grid-template-columns: repeat(2, 1fr); }
                }
                @media (max-width: 40rem) {
                    .status-grid { grid-template-columns: 1fr; }
                }
            </style>

            <section class="dashboard-panel">
                <div class="status-grid">
                    <!-- Using your new reusable StatusCard component! -->
                    <status-card title="Current Distance" value="${currentDistance}" text="Latest sensor value"></status-card>
                    <status-card title="Average Distance" value="${averageDistanceText}" text="Target: 20 cm or less"></status-card>
                    <status-card title="Plant Permission" value="${readyText}" text="${validCount}/5 valid measurements" highlight="${readyHighlight}"></status-card>
                    <status-card title="Measurement Status" value="${this.escapeText(currentStatus)}" text="Current measurement state"></status-card>
                    <status-card title="Last Command" value="${this.escapeText(this.state.lastCommand)}" text="Latest command action"></status-card>
                    <status-card title="Last Update" value="${this.getLastUpdateTime()}" text="Dashboard update time"></status-card>
                </div>

                <div class="table-card">
                    <div class="table-header">
                        <h3>Last 5 Measurements</h3>
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
                </div>
            </section>
        `;
    }

    renderMeasurementRows() {
        if (this.state.measurements.length === 0) {
            return `<tr><td colspan="4" class="empty-row">No measurements yet. Press Start Measurement.</td></tr>`;
        }
        return this.state.measurements.map((measurement, index) => {
            const statusClass = measurement.isValid ? "valid-text" : "invalid-text";
            return `
                <tr>
                    <td>${index + 1}</td>
                    <td>${measurement.distanceText}</td>
                    <td class="${statusClass}">${measurement.isValid ? "Valid" : "Invalid"}</td>
                    <td>${measurement.timeString}</td>
                </tr>
            `;
        }).join("");
    }

    getAverageDistanceText() {
        if (this.state.measurements.length === 0) return "-- cm";
        if (!Number.isFinite(this.state.averageDistance)) return "-- cm";
        return `${this.state.averageDistance.toFixed(1)} cm`;
    }

    getLastUpdateTime() {
        if (!(this.state.lastUpdateTime instanceof Date)) return "--";
        return this.state.lastUpdateTime.toLocaleTimeString();
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