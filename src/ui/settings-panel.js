export class SettingsPanel {
  constructor(options = {}) {
    this.options = {
      showReading: true,
      showPronunciation: false,
      colorizationStrength: 1,  // default to full strength
      ...options
    };
    
    this.onChange = () => {};
  }

  render() {
    const container = document.createElement('div');
    container.className = 'settings-panel';
    
    container.innerHTML = `
      <div class="settings-group">
        <h3>Display Options</h3>
        
        <label class="settings-option">
          <input type="checkbox" name="showReading" ${this.options.showReading ? 'checked' : ''}>
          Show furigana readings
        </label>
        
        <label class="settings-option">
          <input type="checkbox" name="showPronunciation" ${this.options.showPronunciation ? 'checked' : ''}>
          Show pronunciation (when different)
        </label>
      </div>
      
      <div class="settings-group">
        <h3>Colorization</h3>
        
        <label class="settings-option">
          <span>Colorization Strength: <output name="colorStrengthValue">${this.options.colorizationStrength.toFixed(2)}</output></span>
          <input type="range" name="colorizationStrength" min="0" max="1" step="0.01" 
                 value="${this.options.colorizationStrength}">
        </label>
      </div>
    `;
    
    // Add event listeners for checkboxes
    container.querySelectorAll('input[type="checkbox"]').forEach(input => {
      input.addEventListener('change', (e) => {
        this.options[e.target.name] = e.target.checked;
        this.onChange(this.options);
      });
    });
    
    // Add event listener for the slider
    const strengthSlider = container.querySelector('input[name="colorizationStrength"]');
    const strengthValue = container.querySelector('output[name="colorStrengthValue"]');
    
    strengthSlider.addEventListener('input', (e) => {
      const value = parseFloat(e.target.value);
      this.options.colorizationStrength = value;
      strengthValue.textContent = value.toFixed(2);
      
      // Update CSS variable
      document.documentElement.style.setProperty('--mecab-token-coloring', value.toString());
      
      this.onChange(this.options);
    });
    
    // Initialize the CSS variable
    document.documentElement.style.setProperty(
      '--mecab-token-coloring', 
      this.options.colorizationStrength.toString()
    );
    
    return container;
  }
}
