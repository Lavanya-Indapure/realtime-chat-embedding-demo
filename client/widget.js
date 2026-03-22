(function() {
    const container = document.createElement('div');
    container.id = 'chat-widget-container';
    container.style.position = 'fixed';
    container.style.bottom = '20px';
    container.style.right = '20px';
    container.style.width = '300px';
    container.style.height = '400px';
    container.style.zIndex = '10000';
    container.style.boxShadow = '0 5px 15px rgba(0,0,0,0.2)';
    container.style.borderRadius = '10px';
    container.style.overflow = 'hidden';

    const iframe = document.createElement('iframe');
    iframe.src = 'http://localhost:3000/chat-ui?source=Script+Widget';
    iframe.style.width = '100%';
    iframe.style.height = '100%';
    iframe.style.border = 'none';

    container.appendChild(iframe);
    document.body.appendChild(container);
})();
