(function(window) {
    const ChatApp = {
        init: function(config) {
            console.log('ChatApp initialized with config:', config);
            this.config = config;
            this.container = null;
        },
        open: function() {
            if (this.container) return;

            this.container = document.createElement('div');
            this.container.id = 'chat-sdk-container';
            this.container.style.position = 'fixed';
            this.container.style.bottom = '100px';
            this.container.style.right = '20px';
            this.container.style.width = '300px';
            this.container.style.height = '400px';
            this.container.style.zIndex = '10001';
            this.container.style.boxShadow = '0 5px 15px rgba(0,0,0,0.3)';
            this.container.style.borderRadius = '10px';
            this.container.style.overflow = 'hidden';

            const iframe = document.createElement('iframe');
            iframe.src = `http://localhost:3000/chat-ui?source=JS+SDK+(${this.config.websiteId})`;
            iframe.style.width = '100%';
            iframe.style.height = '100%';
            iframe.style.border = 'none';

            this.container.appendChild(iframe);
            document.body.appendChild(this.container);
        },
        close: function() {
            if (this.container) {
                document.body.removeChild(this.container);
                this.container = null;
            }
        }
    };

    window.ChatApp = ChatApp;
})(window);
