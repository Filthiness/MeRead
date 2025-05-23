class FloatingBottomBar extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this.shadowRoot.innerHTML = `
            <style>
            :host {
                position: fixed;
                bottom: 0;
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
                transform: translateY(100%);
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
        this.showing = true;
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
        if (this.showing){
            this.hide();
        }
        else{
            this.show();
        }
        this.showing = !this.showing;
    }
}

customElements.define('floating-bottom-bar', FloatingBottomBar);
const barElement = document.querySelector('floating-bottom-bar');

// no-ops should toggle the bar
document.addEventListener('click', (e) => {
    const cl = e.target.classList;
    const noop = cl.contains('mecab-analysis')
        || cl.contains('reader-content')
        || e.target.id === "container"
        || e.target.id === "outarea"
        || e.target === document.body
        || e.target === document.documentElement
    
    if (noop) {
        barElement.toggle();
    }
});

export default FloatingBottomBar;

