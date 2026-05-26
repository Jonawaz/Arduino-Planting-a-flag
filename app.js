console.log("App initialized - Ready for WebSockets and APIs");

const actionBtn = document.getElementById('actionBtn');
actionBtn.addEventListener('click', () => {
    alert("Sending command to Arduino...");
});
