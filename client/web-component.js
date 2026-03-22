class ChatWidget extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
    }

    connectedCallback() {
        const container = document.createElement('div');
        container.style.width = '100%';
        container.style.height = '400px';
        container.style.border = '1px solid #ccc';
        container.style.borderRadius = '8px';
        container.style.overflow = 'hidden';

        const iframe = document.createElement('iframe');
        iframe.src = 'http://localhost:3000/chat-ui?source=Web+Component';
        iframe.style.width = '100%';
        iframe.style.height = '100%';
        iframe.style.border = 'none';

        container.appendChild(iframe);
        this.shadowRoot.appendChild(container);
    }
}

customElements.define('chat-widget', ChatWidget);
