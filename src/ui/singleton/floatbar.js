class FloatingBar extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        
        // Default to 'bottom' if no position attribute is set
        this.position = this.getAttribute('position') || 'bottom';
        
        this.shadowRoot.innerHTML = `
            <style>
            :host {
                position: fixed;
                ${this.position}: 0;
                left: 0;
                right: 0;
                z-index: 1000;
                transition: z-index 0.3s ease;
            }
            :host(.hidden-host) {
                z-index: -1;
            }
            .bar {
                display: flex;
                justify-content: center;
                align-items: center;
                transition: transform 0.3s ease;
                width: 100%;
            }
            .hidden {
                transform: translateY(${this.position === 'bottom' ? '100%' : '-100%'});
            }
            ::slotted(*) {
                width: 100%;
                height: 100%;
            }
            </style>
            <div class="bar">
                <slot></slot>
            </div>
        `;
        this.bar = this.shadowRoot.querySelector('.bar');
    }

    static get observedAttributes() {
        return ['position'];
    }

    attributeChangedCallback(name, oldValue, newValue) {
        if (name === 'position' && oldValue !== newValue) {
            this.position = newValue;
            this.updatePosition();
        }
    }

    updatePosition() {
        const host = this.shadowRoot.host;
        host.style.bottom = this.position === 'bottom' ? '0' : '';
        host.style.top = this.position === 'top' ? '0' : '';
        
        // Update the transform direction for hiding
        const hiddenClass = this.shadowRoot.querySelector('.hidden');
        if (hiddenClass) {
            hiddenClass.style.transform = `translateY(${this.position === 'bottom' ? '100%' : '-100%'})`;
        }
    }

    hide() {
        this.bar.classList.add('hidden');
        this.classList.add('hidden-host');
    }

    show() {
        this.bar.classList.remove('hidden');
        this.classList.remove('hidden-host');
    }

    toggle() {
        if (this.bar.classList.contains('hidden')) {
            this.show();
        } else {
            this.hide();
        }
    }
}

// Define both variants for convenience
customElements.define('floating-bar', FloatingBar);
customElements.define('floating-bottom-bar', class extends FloatingBar {
    constructor() {
        super();
        this.position = 'bottom';
        this.updatePosition();
    }
});
customElements.define('floating-top-bar', class extends FloatingBar {
    constructor() {
        super();
        this.position = 'top';
        this.updatePosition();
    }
});

export default FloatingBar;
