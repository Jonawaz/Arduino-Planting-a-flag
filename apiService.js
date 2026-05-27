// API Service for REST Commands
const API_BASE_URL = "";

export async function sendCommand(commandName, payload = {}) {
    const command = {
        name: commandName,
        timestamp: new Date().toISOString(),
        ...payload
    };

    console.log("[API] Sending command:", command);

    if (!API_BASE_URL || API_BASE_URL === "") {
        // Mock response
        console.log("[API] No API_BASE_URL configured. Using mock response.");
        return {
            success: true,
            message: `Mock: ${commandName} sent successfully`,
            command: command
        };
    }

    try {
        const response = await fetch(`${API_BASE_URL}/command`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(command)
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log("[API] Response:", data);
        return data;
    } catch (error) {
        console.error("[API] Error:", error);
        return {
            success: false,
            message: error.message,
            command: command
        };
    }
}
