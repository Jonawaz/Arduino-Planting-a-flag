class ActionButton extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
    }

    connectedCallback() {
        const theme = this.getAttribute('theme') || 'default';
        
        this.shadowRoot.innerHTML = `
            <style>
                * { box-sizing: border-box; }
                :host {
                    display: inline-block;
                    width: 100%;
                    max-width: 16rem; 
                }
                button {
                    width: 100%;
                    padding: 1rem;
                    font-size: 0.9rem;
                    font-weight: 700;
                    text-transform: uppercase;
                    letter-spacing: 0.1rem;
                    color: #f3f4f6;
                    background: rgba(255, 255, 255, 0.05);
                    border: 0.0625rem solid rgba(255, 255, 255, 0.1);
                    border-radius: 0.75rem;
                    cursor: pointer;
                    transition: all 0.3s ease;
                    backdrop-filter: blur(0.5rem);
                    -webkit-backdrop-filter: blur(0.5rem);
                    white-space: nowrap; /* Keeps text on one line */
                }
                button:hover {
                    background: rgba(255, 255, 255, 0.15);
                    transform: translateY(-0.1rem);
                }
                button:active { transform: translateY(0); }
                button:disabled {
                    opacity: 0.4;
                    cursor: not-allowed;
                    transform: none;
                }
                .theme-primary { border-bottom: 0.15rem solid #9ca3af; }
                .theme-success { border-bottom: 0.15rem solid #4ade80; }
                .theme-danger { border-bottom: 0.15rem solid #f87171; }
                
                .theme-primary:hover { box-shadow: 0 0.5rem 1rem rgba(156, 163, 175, 0.15); }
                .theme-success:hover { box-shadow: 0 0.5rem 1rem rgba(74, 222, 128, 0.15); }
                .theme-danger:hover { box-shadow: 0 0.5rem 1rem rgba(248, 113, 113, 0.15); }
            </style>
            <button class="theme-${theme}">
                <slot></slot>
            </button>
        `;
    }

    set disabled(val) {
        const btn = this.shadowRoot.querySelector('button');
        if (val) {
            this.setAttribute('disabled', 'true');
            if(btn) btn.setAttribute('disabled', 'true');
        } else {
            this.removeAttribute('disabled');
            if(btn) btn.removeAttribute('disabled');
        }
    }

    get disabled() { return this.hasAttribute('disabled'); }
}
customElements.define('action-button', ActionButton);