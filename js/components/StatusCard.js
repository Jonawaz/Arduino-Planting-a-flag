class StatusCard extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
    }

    static get observedAttributes() {
        return ['title', 'value', 'text', 'highlight'];
    }

    attributeChangedCallback(name, oldValue, newValue) {
        if (oldValue !== newValue) this.render();
    }

    connectedCallback() {
        this.render();
    }

    render() {
        const title = this.getAttribute('title') || 'Unknown';
        const value = this.getAttribute('value') || '--';
        const text = this.getAttribute('text') || '';
        const highlight = this.getAttribute('highlight') || 'none';
        
        this.shadowRoot.innerHTML = `
            <style>
                /* THIS FIXES THE OVERLAPPING */
                * { box-sizing: border-box; }
                
                :host {
                    display: block;
                    width: 100%;
                    height: 100%;
                }
                .card {
                    background: rgba(255, 255, 255, 0.03);
                    border: 0.0625rem solid rgba(255, 255, 255, 0.08);
                    border-radius: 0.75rem;
                    padding: 1.25rem;
                    height: 100%;
                    display: flex;
                    flex-direction: column;
                    justify-content: center;
                    transition: background 0.3s ease;
                }
                .card:hover { background: rgba(255, 255, 255, 0.06); }
                .title {
                    color: #9ca3af;
                    font-size: 0.75rem;
                    font-weight: 700;
                    text-transform: uppercase;
                    letter-spacing: 0.1rem;
                    margin-bottom: 0.5rem;
                }
                .value {
                    color: #f3f4f6;
                    font-size: 1.5rem;
                    font-weight: 800;
                    margin-bottom: 0.25rem;
                    word-break: break-word;
                }
                .text { color: #6b7280; font-size: 0.85rem; }
                
                .highlight-success .value { color: #4ade80; }
                .highlight-danger .value { color: #f87171; }
            </style>
            <div class="card highlight-${highlight}">
                <div class="title">${title}</div>
                <div class="value">${value}</div>
                <div class="text">${text}</div>
            </div>
        `;
    }
}
customElements.define('status-card', StatusCard);