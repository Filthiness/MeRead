class ReadProgressBar extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        
        // Create the progress bar structure
        this.shadowRoot.innerHTML = `
            <style>
                :host {
                    display: block;
                    position: relative;
                    top: 0;
                    left: 0;
                    right: 0;
                    padding: 1em 0;
                    height: 0.2em;
                    z-index: 1000;
                    cursor: pointer;
                }

                :host::before {
                    content: '';
                    position: absolute;
                    top: 1em;
                    left: 0;
                    right: 0;
                    height: 0.2em;
                    background-color: rgba(0, 0, 0, 0.1);
                }
                
                .progress-bar {
                    height: 100%;
                    width: 0;
                    background-color: #333;
                    position: relative;
                    transition: width 0.05s ease-out;
                }
                
                .progress-handle {
                    position: absolute;
                    right: -8px;
                    top: 50%;
                    transform: translateY(-50%);
                    width: 16px;
                    height: 16px;
                    background-color: #333;
                    border-radius: 50%;
                    cursor: pointer;
                    box-shadow: 0 0 5px rgba(0,0,0,0.3);
                    opacity: 0;
                    transition: opacity 0.2s ease;
                }
                
                :host(:hover) .progress-handle {
                    opacity: 1;
                }
            </style>
            <div class="progress-bar">
                <div class="progress-handle"></div>
            </div>
        `;
        
        this.progressBar = this.shadowRoot.querySelector('.progress-bar');
        this.progressHandle = this.shadowRoot.querySelector('.progress-handle');
        this.isDragging = false;
    }
    
    connectedCallback() {
        // Add event listeners
        window.addEventListener('scroll', this.updateProgress.bind(this));
        window.addEventListener('resize', this.updateProgress.bind(this));
        
        // Handle click on the progress bar
        this.addEventListener('click', this.handleClick.bind(this));
        
        // Handle drag on the progress handle
        this.progressHandle.addEventListener('mousedown', this.startDrag.bind(this));
        window.addEventListener('mousemove', this.handleDrag.bind(this));
        window.addEventListener('mouseup', this.endDrag.bind(this));
        
        // Initialize progress
        this.updateProgress();
    }
    
    disconnectedCallback() {
        // Clean up event listeners
        window.removeEventListener('scroll', this.updateProgress);
        window.removeEventListener('resize', this.updateProgress);
        this.removeEventListener('click', this.handleClick);
        this.progressHandle.removeEventListener('mousedown', this.startDrag);
        window.removeEventListener('mousemove', this.handleDrag);
        window.removeEventListener('mouseup', this.endDrag);
    }
    
    updateProgress() {
        if (this.isDragging) return;
        
        const scrollTop = window.scrollY || document.documentElement.scrollTop;
        const scrollHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
        const progress = scrollHeight > 0 ? (scrollTop / scrollHeight) : 0;
        
        this.progressBar.style.width = `${progress * 100}%`;
    }
    
    handleClick(e) {
        if (e.target !== this && e.target !== this.progressBar && e.target !== this.progressHandle) return;
        
        const rect = this.getBoundingClientRect();
        const clickPosition = e.clientX - rect.left;
        const progress = Math.min(Math.max(clickPosition / rect.width, 0), 1);
        
        this.scrollToProgress(progress);
    }
    
    startDrag(e) {
        e.preventDefault();
        this.isDragging = true;
        this.progressHandle.style.opacity = '1';
    }
    
    handleDrag(e) {
        if (!this.isDragging) return;
        
        const rect = this.getBoundingClientRect();
        let dragPosition = e.clientX - rect.left;
        const progress = Math.min(Math.max(dragPosition / rect.width, 0), 1);
        
        this.progressBar.style.width = `${progress * 100}%`;
        this.scrollToProgress(progress);
    }
    
    endDrag() {
        this.isDragging = false;
    }
    
    scrollToProgress(progress) {
        const scrollHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
        const targetScroll = progress * scrollHeight;
        
        window.scrollTo({
            top: targetScroll,
            behavior: this.isDragging ? 'auto' : 'smooth'
        });
    }
}

// Define the custom element
customElements.define('read-progress-bar', ReadProgressBar);
