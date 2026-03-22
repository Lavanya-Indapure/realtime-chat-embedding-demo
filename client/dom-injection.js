(function() {
    function injectChat(targetId) {
        const target = document.getElementById(targetId);
        if (!target) return;

        const chatHtml = `
            <div id="dom-chat-ui" style="
                font-family: 'Inter', sans-serif;
                background: #1a1a1a;
                color: #eee;
                border: 2px solid #4a90e2;
                border-radius: 12px;
                display: flex;
                flex-direction: column;
                height: 400px;
                overflow: hidden;
            ">
                <header style="background: #333; padding: 10px; display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #444;">
                    <div>
                        <h3 style="margin: 0; font-size: 1rem;">DOM Chat (Internal)</h3>
                        <span style="font-size: 0.7rem; color: #888;">Via: Direct DOM Injection</span>
                    </div>
                    <div id="dom-status-wrapper">
                        <span id="dom-status-indicator" style="width: 8px; height: 8px; border-radius: 50%; display: inline-block; background: #e74c3c;"></span>
                    </div>
                </header>
                <div id="dom-messages" style="flex-grow: 1; padding: 10px; overflow-y: auto; display: flex; flex-direction: column;"></div>
                <div style="padding: 10px; background: #222; border-top: 1px solid #444; display: flex;">
                    <input id="dom-input" type="text" placeholder="Type..." style="flex-grow: 1; background: #333; color: white; border: 1px solid #444; padding: 5px 10px; border-radius: 4px; margin-right: 5px;">
                    <button id="dom-send" style="background: #4a90e2; color: white; border: none; padding: 5px 15px; border-radius: 4px; cursor: pointer;">Send</button>
                </div>
            </div>
        `;

        target.innerHTML = chatHtml;

        // Initialize Socket.IO logic manually for the DOM injection
        // This is necessary because it's not in an iframe with chat-ui.html
        const script = document.createElement('script');
        script.src = '/socket.io/socket.io.js';
        script.onload = () => {
            const socket = io();
            const messages = document.getElementById('dom-messages');
            const input = document.getElementById('dom-input');
            const sendBtn = document.getElementById('dom-send');
            const statusInd = document.getElementById('dom-status-indicator');

            socket.on('connect', () => { statusInd.style.background = '#2ecc71'; });
            socket.on('disconnect', () => { statusInd.style.background = '#e74c3c'; });

            function sendMessage() {
                if (input.value) {
                    socket.emit('chat message', {
                        text: input.value,
                        source: 'Direct DOM',
                        timestamp: Date.now()
                    });
                    input.value = '';
                }
            }

            sendBtn.onclick = sendMessage;
            input.onkeypress = (e) => { if (e.key === 'Enter') sendMessage(); };

            socket.on('chat message', (msg) => {
                const item = document.createElement('div');
                item.style.marginBottom = '8px';
                item.style.padding = '5px 10px';
                item.style.borderRadius = '6px';
                item.style.maxWidth = '85%';
                item.style.fontSize = '0.9rem';

                if (msg.source === 'Direct DOM') {
                    item.style.background = '#4a90e2';
                    item.style.color = 'white';
                    item.style.alignSelf = 'flex-end';
                } else {
                    item.style.background = '#333';
                    item.style.color = '#eee';
                    item.style.alignSelf = 'flex-start';
                }

                item.innerHTML = `
                    <div style="font-size: 0.6rem; opacity: 0.6; margin-bottom: 2px;">${msg.source}</div>
                    <div>${msg.text}</div>
                `;

                messages.appendChild(item);
                messages.scrollTop = messages.scrollHeight;
            });
        };
        document.head.appendChild(script);
    }

    window.initDomChat = injectChat;
})();
