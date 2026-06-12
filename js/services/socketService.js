// Socket Service for real WebSocket data from Node-RED

function normalizeIncomingData(data) {
    let distance = null;
    let status = "valid";

    // Node-RED / AAAdlander format:
    // proximity_1 is received in millimeters.
    // Example: proximity_1: 50 means 5 cm.
    if (data.proximity_1 !== undefined) {
        distance = Number(data.proximity_1) / 10;
    }

    // Fallback formats, in case Node-RED sends another name later.
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
        distance = Number(data.distanceMm) / 10;
    }

    else if (data.distance_mm !== undefined) {
        distance = Number(data.distance_mm) / 10;
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

    if (!url || url === "") {
        console.error("[Socket] No WebSocket URL configured.");
        onStatusChange("error");

        return {
            close() {
                isClosed = true;
                onStatusChange("disconnected");
            }
        };
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

            } catch (error) {
                console.error("[Socket] Error parsing message:", error);
                console.error("[Socket] Original message:", event.data);
            }
        };

        connection.onerror = (error) => {
            console.error("[Socket] Error:", error);
            onStatusChange("error");
        };

        connection.onclose = () => {
            console.log("[Socket] Disconnected");

            if (!isClosed) {
                onStatusChange("disconnected");
            }
        };

    } catch (error) {
        console.error("[Socket] Connection error:", error);
        onStatusChange("error");
    }

    return {
        close() {
            isClosed = true;

            if (connection) {
                connection.close();
            }

            onStatusChange("disconnected");
        }
    };
}