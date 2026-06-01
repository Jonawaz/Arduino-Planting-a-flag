// Socket Service for WebSocket or Mock Data
let mockInterval = null;

export function connectSocket({ url, onDataReceived, onStatusChange }) {
    let connection = null;
    let isClosed = false;
// test mock data generator 
    function generateMockData() {
        // Generate random distance between 12 and 32 cm
        const distance = Math.random() * (32 - 12) + 12;
        const measurement = {
            id: Date.now(),
            distance: distance,
            status: 'valid',
            timestamp: new Date().toISOString(),
            source: 'mock'
        };
        console.log("[Socket] Mock data:", measurement);
        onDataReceived(measurement);
    }

    function connect() {
        if (!url || url === "") {
            // Use mock data (test)
            console.log("[Socket] No WebSocket URL configured. Using mock data.");
            onStatusChange('connected');
            
            mockInterval = setInterval(() => {
                if (!isClosed) {
                    generateMockData();
                }
            }, 1500);
        } else {
            // Connect to real WebSocket
            try {
                console.log("[Socket] Connecting to:", url);
                connection = new WebSocket(url);

                connection.onopen = () => {
                    console.log("[Socket] Connected");
                    onStatusChange('connected');
                };

                connection.onmessage = (event) => {
                    try {
                        const data = JSON.parse(event.data);
                        console.log("[Socket] Received:", data);
                        onDataReceived(data);
                    } catch (e) {
                        console.error("[Socket] Error parsing message:", e);
                    }
                };

                connection.onerror = (error) => {
                    console.error("[Socket] Error:", error);
                    onStatusChange('error');
                };

                connection.onclose = () => {
                    console.log("[Socket] Disconnected");
                    onStatusChange('disconnected');
                };
            } catch (error) {
                console.error("[Socket] Connection error:", error);
                onStatusChange('error');
            }
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
            onStatusChange('disconnected');
        }
    };
}
