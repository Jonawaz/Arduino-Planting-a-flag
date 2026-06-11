// Socket Service for WebSocket or Mock Data
let mockInterval = null;

function normalizeIncomingData(data) {
    let distance = null;
    let status = "valid";

    // Node-RED / AAAdlander format
    if (data.proximity_1 !== undefined) {
        // Node-RED sends proximity_1 in millimeters, so convert to centimeters
        distance = Number(data.proximity_1) / 10;
    }

    // Other possible formats
    else if (data.distance_1 !== undefined) {
        distance = Number(data.distance_1);
    }

    else if (data.distance !== undefined) {
        distance = Number(data.distance);
    }

    else if (data.distance_130 !== undefined) {
        distance = Number(data.distance_130);
    }

    else if (data.distanceMm !== undefined) {
        distance = Number(data.distanceMm);

        if (distance > 200) {
            distance = distance / 10;
        }
    }

    else if (data.distance_mm !== undefined) {
        distance = Number(data.distance_mm);

        if (distance > 200) {
            distance = distance / 10;
        }
    }

    if (data.status !== undefined) {
        status = data.status;
    } else if (data.status_1 !== undefined) {
        status = data.status_1;
    }

    return {
        id: Date.now(),
        distance: distance,
        status: status,
        timestamp: new Date().toISOString(),
        source: "websocket",
        raw: data
    };
}

export function connectSocket({ url, onDataReceived, onStatusChange }) {
    let connection = null;
    let isClosed = false;

    function generateMockData() {
        const distance = Math.random() * (32 - 12) + 12;

        const measurement = {
            id: Date.now(),
            distance: distance,
            status: "valid",
            timestamp: new Date().toISOString(),
            source: "mock"
        };

        console.log("[Socket] Mock data:", measurement);
        onDataReceived(measurement);
    }

    function connect() {
        if (!url || url === "") {
            console.log("[Socket] No WebSocket URL configured. Using mock data.");
            onStatusChange("connected");

            mockInterval = setInterval(() => {
                if (!isClosed) {
                    generateMockData();
                }
            }, 1500);

            return;
        }

        try {
            console.log("[Socket] Connecting to:", url);
            connection = new WebSocket(url);

            connection.onopen = () => {
                console.log("[Socket] Connected");
                onStatusChange("connected");
            };

            connection.onmessage = (event) => {
                try {
                    console.log("[Socket] Raw message:", event.data);

                    const data = JSON.parse(event.data);
                    console.log("[Socket] Parsed message:", data);

                    const measurement = normalizeIncomingData(data);
                    console.log("[Socket] Normalized measurement:", measurement);

                    if (measurement.distance !== null && !Number.isNaN(measurement.distance)) {
                        onDataReceived(measurement);
                    } else {
                        console.warn("[Socket] No usable distance found in message:", data);
                    }

                } catch (e) {
                    console.error("[Socket] Error parsing message:", e);
                    console.error("[Socket] Original message:", event.data);
                }
            };

            connection.onerror = (error) => {
                console.error("[Socket] Error:", error);
                onStatusChange("error");
            };

            connection.onclose = () => {
                console.log("[Socket] Disconnected");
                onStatusChange("disconnected");
            };

        } catch (error) {
            console.error("[Socket] Connection error:", error);
            onStatusChange("error");
        }
    }

    connect();

    return {
        close() {
            isClosed = true;

            if (mockInterval) {
                clearInterval(mockInterval);
                mockInterval = null;
            }

            if (connection) {
                connection.close();
            }

            onStatusChange("disconnected");
        }
    };
}