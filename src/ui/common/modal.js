class Modal {
  constructor(options = {}) {
    this.options = {
      title: 'Modal Title',
      content: 'Default modal content',
      showCloseButton: true,
      buttons: [],
      onClose: () => {},
      ...options,
    };

    this.dialog = document.createElement('dialog');
    this.#render();
    document.body.appendChild(this.dialog);
  }

  #render() {
    this.dialog.innerHTML = '';

    // Header with title and close button
    const header = document.createElement('div');
    header.className = 'modal-header';

    const title = document.createElement('h2');
    title.className = 'modal-title';
    title.textContent = this.options.title;
    header.appendChild(title);

    if (this.options.showCloseButton) {
      const closeBtn = document.createElement('button');
      closeBtn.className = 'close-btn';
      closeBtn.innerHTML = '&times;';
      closeBtn.addEventListener('click', () => this.close());
      header.appendChild(closeBtn);
    }

    this.dialog.appendChild(header);

    // Content
    const content = document.createElement('div');
    content.className = 'modal-content';

    if (typeof this.options.content === 'string') {
      content.innerHTML = this.options.content;
    } else if (this.options.content instanceof HTMLElement) {
      content.appendChild(this.options.content);
    }

    this.dialog.appendChild(content);

    // Footer with buttons
    if (this.options.buttons.length > 0) {
      const footer = document.createElement('div');
      footer.className = 'modal-footer';

      this.options.buttons.forEach((btnConfig) => {
        const btn = document.createElement('button');
        btn.textContent = btnConfig.text;

        if (btnConfig.className) {
          btn.className = btnConfig.className;
        }

        btn.addEventListener('click', (e) => {
          if (btnConfig.onClick) {
            btnConfig.onClick(e, this);
          }

          if (btnConfig.closeOnClick !== false) {
            this.close();
          }
        });

        footer.appendChild(btn);
      });

      this.dialog.appendChild(footer);
    }
  }

  open() {
    this.dialog.showModal();
    return this;
  }

  close() {
    this.dialog.close();
    this.options.onClose();
    this.dialog.remove();
    return this;
  }

  setContent(content) {
    this.options.content = content;
    this.#render();
    return this;
  }
}

export { Modal as Modal };
