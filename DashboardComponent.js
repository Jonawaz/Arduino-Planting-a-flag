class DashboardComponent extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
    }

    connectedCallback() {
        const title = this.getAttribute('title') || 'Dashboard';
        this.shadowRoot.innerHTML = `
            <style>
                div { border: 2px solid #2c3e50; padding: 20px; display: inline-block; background: white; }
                h2 { margin: 0; color: #2c3e50; }
            </style>
            <div>
                <h2>${title}</h2>
                <p id="status">Waiting for data...</p>
            </div>
        `;
    }
}
customElements.define('plant-dashboard', DashboardComponent);
