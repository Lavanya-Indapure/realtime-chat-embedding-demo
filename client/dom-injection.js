(function() {
    function injectChat(targetId) {
        const target = document.getElementById(targetId);
        if (!target) return;

        const chatHtml = `
            <div id="dom-chat-ui" style="
                font-family: 'Inter', sans-serif;
                background: hsl(220, 15%, 10%);
                color: hsl(0, 0%, 95%);
                border: 1px solid rgba(255, 255, 255, 0.1);
                border-radius: 16px;
                display: flex;
                flex-direction: column;
                height: 450px;
                overflow: hidden;
                box-shadow: 0 10px 30px rgba(0,0,0,0.5);
                position: relative;
            ">
                <header style="
                    background: rgba(255, 255, 255, 0.05);
                    backdrop-filter: blur(10px);
                    padding: 14px 18px;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
                ">
                    <div>
                        <h3 style="margin: 0; font-size: 1rem; background: linear-gradient(135deg, #4a90e2, #a855f7); -webkit-background-clip: text; background-clip: text; -webkit-text-fill-color: transparent; font-weight: 600;">Gemini Dom Widget</h3>
                        <span style="font-size: 0.65rem; color: #888; text-transform: uppercase; letter-spacing: 0.05em;">Direct Injection</span>
                    </div>
                    <div id="dom-status-wrapper">
                        <span id="dom-status-indicator" style="width: 8px; height: 8px; border-radius: 50%; display: inline-block; background: #e74c3c; box-shadow: 0 0 8px #e74c3c;"></span>
                    </div>
                </header>
                <div id="dom-messages" style="
                    flex-grow: 1;
                    padding: 16px;
                    overflow-y: auto;
                    display: flex;
                    flex-direction: column;
                    gap: 12px;
                    background: radial-gradient(circle at top right, rgba(168, 85, 247, 0.03), transparent);
                "></div>
                <div style="padding: 16px; background: hsl(220, 15%, 15%); border-top: 1px solid rgba(255, 255, 255, 0.1);">
                    <div style="display: flex; gap: 8px; background: rgba(255, 255, 255, 0.05); padding: 4px; border-radius: 12px; border: 1px solid rgba(255, 255, 255, 0.1);">
                        <input id="dom-input" type="text" placeholder="Ask Gemini..." style="
                            flex-grow: 1;
                            background: transparent;
                            color: white;
                            border: none;
                            padding: 8px 12px;
                            outline: none;
                            font-size: 0.9rem;
                        ">
                        <button id="dom-send" style="
                            background: #4a90e2;
                            color: white;
                            border: none;
                            padding: 0 16px;
                            border-radius: 8px;
                            cursor: pointer;
                            font-weight: 500;
                            transition: all 0.2s;
                        ">Send</button>
                    </div>
                </div>
            </div>
        `;

        target.innerHTML = chatHtml;

        // Initialize Socket.IO logic manually for the DOM injection
        const script = document.createElement('script');
        script.src = '/socket.io/socket.io.js';
        script.onload = () => {
            const socket = io();
            const messages = document.getElementById('dom-messages');
            const input = document.getElementById('dom-input');
            const sendBtn = document.getElementById('dom-send');
            const statusInd = document.getElementById('dom-status-indicator');

            let activeStreams = {};

            socket.on('connect', () => { 
                statusInd.style.background = '#2ecc71'; 
                statusInd.style.boxShadow = '0 0 8px #2ecc71';
            });
            socket.on('disconnect', () => { 
                statusInd.style.background = '#e74c3c'; 
                statusInd.style.boxShadow = '0 0 8px #e74c3c';
            });

            function createMsg(text, isUser, isStreaming = false) {
                const item = document.createElement('div');
                item.style.padding = '10px 14px';
                item.style.borderRadius = '14px';
                item.style.maxWidth = '85%';
                item.style.fontSize = '0.9rem';
                item.style.lineHeight = '1.4';
                item.style.animation = 'fadeIn 0.2s ease forwards';

                if (isUser) {
                    item.style.background = '#4a90e2';
                    item.style.color = 'white';
                    item.style.alignSelf = 'flex-end';
                    item.style.borderBottomRightRadius = '4px';
                } else {
                    item.style.background = 'hsl(220, 15%, 20%)';
                    item.style.color = '#eee';
                    item.style.alignSelf = 'flex-start';
                    item.style.borderBottomLeftRadius = '4px';
                    item.style.border = '1px solid rgba(255, 255, 255, 0.1)';
                    if (isStreaming) {
                        item.style.borderStyle = 'dashed';
                        item.style.borderColor = '#4a90e2';
                    }
                }

                item.innerHTML = `
                    <div style="font-size: 0.6rem; opacity: 0.6; margin-bottom: 4px; text-transform: uppercase;text-align: left;">${isUser ? 'You' : 'Gemini AI'}</div>
                    <div class="msg-content" style="text-align: left;">${text}</div>
                `;
                return item;
            }

            function sendMessage() {
                if (input.value.trim()) {
                    const text = input.value.trim();
                    socket.emit('chat message', {
                        text: text,
                        source: 'Direct DOM',
                        timestamp: Date.now()
                    });
                    
                    const el = createMsg(text, true);
                    messages.appendChild(el);
                    messages.scrollTop = messages.scrollHeight;
                    input.value = '';
                }
            }

            sendBtn.onclick = sendMessage;
            input.onkeypress = (e) => { if (e.key === 'Enter') sendMessage(); };

            socket.on('stream-chunk', (data) => {
                let item = activeStreams[data.streamId];
                if (!item) {
                    item = createMsg('', false, true);
                    messages.appendChild(item);
                    activeStreams[data.streamId] = item;
                }
                item.querySelector('.msg-content').textContent = data.text;
                messages.scrollTop = messages.scrollHeight;
            });

            socket.on('stream-end', (data) => {
                const item = activeStreams[data.streamId];
                if (item) {
                    item.style.borderStyle = 'solid';
                    delete activeStreams[data.streamId];
                }
            });

            socket.on('chat message', (msg) => {
                if (msg.source !== 'Direct DOM') {
                    const item = createMsg(msg.text, false);
                    messages.appendChild(item);
                    messages.scrollTop = messages.scrollHeight;
                }
            });
        };
        document.head.appendChild(script);

        // Add fade-in animation
        const style = document.createElement('style');
        style.textContent = '@keyframes fadeIn { from { opacity: 0; transform: translateY(5px); } to { opacity: 1; transform: translateY(0); } }';
        document.head.appendChild(style);
    }

    window.initDomChat = injectChat;
})();
