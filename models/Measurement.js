// Measurement Model
// Represents one distance measurement from the Vlag Planten module.

class Measurement {
    constructor({ id, distance, status = "valid", timestamp = new Date(), source = "sensor" }) {
        this.id = id ?? Date.now();
        this.distance = Number(distance);
        this.status = status;
        this.timestamp = timestamp instanceof Date ? timestamp : new Date(timestamp);
        this.source = source;
    }

    get isValid() {
        const statusValue = String(this.status).toLowerCase();
        const statusAllowsMeasurement = !statusValue.includes("invalid") && !statusValue.includes("error");

        return (
            Number.isFinite(this.distance) &&
            this.distance >= 0 &&
            this.distance <= 200 &&
            statusAllowsMeasurement
        );
    }

    get distanceText() {
        if (!Number.isFinite(this.distance)) {
            return "-- cm";
        }

        return `${this.distance.toFixed(1)} cm`;
    }

    get timeString() {
        if (this.timestamp instanceof Date && !Number.isNaN(this.timestamp.getTime())) {
            return this.timestamp.toLocaleTimeString();
        }

        return "--";
    }

    toJSON() {
        return {
            id: this.id,
            distance: this.distance,
            status: this.status,
            timestamp: this.timestamp instanceof Date && !Number.isNaN(this.timestamp.getTime())
                ? this.timestamp.toISOString()
                : null,
            source: this.source,
            isValid: this.isValid
        };
    }
}

export { Measurement };
