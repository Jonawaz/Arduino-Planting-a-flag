const API_BASE_URL = "";

export async function sendCommand(commandName, payload = {}) {
    const command = {
        name: commandName,
        payload: payload,
        timestamp: new Date().toISOString()
    };

    console.log("[API] Sending command:", command);

    if (!API_BASE_URL) {
        console.log("[MOCK API] No API_BASE_URL configured. Mock command used.");

        return {
            success: true,
            mode: "mock",
            message: `Mock command ${commandName} sent successfully.`,
            command: command
        };
    }

    try {
        const response = await fetch(`${API_BASE_URL}/command`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(command)
        });

        const responseData = await response.json().catch(() => ({}));

        if (!response.ok) {
            throw new Error(responseData.message || `HTTP error: ${response.status}`);
        }

        return {
            success: true,
            mode: "real-api",
            data: responseData
        };

    } catch (error) {
        console.error("[API] Service error:", error);

        return {
            success: false,
            mode: "real-api",
            message: error.message,
            command: command
        };
    }
}