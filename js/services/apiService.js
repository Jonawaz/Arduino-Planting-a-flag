// Exact IP and Port for CubeSat 4, Group 14
const API_BASE_URL = "http://145.49.127.250:1880/groep14";

// Maps the command names from your app.js to the LPP query parameters expected by the satellite.
// Update the channel numbers (e.g., digital_output_2, digital_output_3) here if your hardware wiring changes.
const COMMAND_MAPPING = {
    "START_MEASUREMENT": "digital_output_2=255", // Trigger sensor on channel 2
    "PLANT_FLAG": "digital_output_3=255",        // Trigger servo/motor on channel 3
    "RESET": "digital_output_2=0,digital_output_3=0" // Reset actuators to default states
};

export async function sendCommand(commandName, payload = {}) {
    const command = {
        name: commandName,
        payload: payload,
        timestamp: new Date().toISOString()
    };

    console.log("[API] Preparing command:", command);

    // Mock Mode Fallback: If you empty the API_BASE_URL string, it will run mock mode offline
    if (!API_BASE_URL) {
        console.log("[MOCK API] No API_BASE_URL configured. Mock command used.");

        return {
            success: true,
            mode: "mock",
            message: `Mock command ${commandName} sent successfully.`,
            command: command
        };
    }

    // Retrieve the matching query parameters for the command
    const queryParams = COMMAND_MAPPING[commandName];
    if (!queryParams) {
        console.error(`[API] Unknown command name: ${commandName}`);
        return {
            success: false,
            mode: "real-api",
            message: `Unknown command name: ${commandName}`,
            command: command
        };
    }

    // Assemble the clean GET downlink URL (e.g., http://145.49.127.250:1880/groep14?digital_output_2=255)
    const fullUrl = `${API_BASE_URL}?${queryParams}`;

    try {
        console.log(`[API] Transmitting GET request to: ${fullUrl}`);

        // Downlink control commands must be executed as GET requests
        const response = await fetch(fullUrl, {
            method: "GET"
        });

        const responseData = await response.json().catch(() => ({}));

        if (!response.ok) {
            throw new Error(responseData.message || `HTTP error: ${response.status}`);
        }

        // Returns success: true so your app.js's .then(response => response.success) functions correctly
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