(function () {
  const CONFIG = {
    webhookUrl: "https://n8n.srv1072276.hstgr.cloud/webhook/170b2295-996c-486e-a949-098ecf8b88c8/chat",
    themeColor: "#0066FF",
    logoUrl: "https://www.redditstatic.com/shreddit/assets/snoo_wave.png",
    title: "Travel Assistant",
    welcomeMsg: "👋 Hi there! How can I help you plan your trip?",
    requiredFields: { name: true, email: true, phone: false },
  };

  const state = { user: null, botQueue: [], isProcessing: false };

  const addMsg = (text, from = "bot") => {
    const el = document.createElement("div");
    el.className = `msg ${from}`;
    el.textContent = text;
    messages.appendChild(el);
    messages.scrollTop = messages.scrollHeight;
  };

  const processQueue = () => {
    if (state.isProcessing || state.botQueue.length === 0) return;
    state.isProcessing = true;
    const msg = state.botQueue.shift();
    setTimeout(() => {
      addMsg(msg, "bot");
      state.isProcessing = false;
      processQueue();
    }, 600);
  };

  // Styles
  const style = document.createElement("style");
  style.textContent = `
    #chat-bubble {position:fixed;bottom:25px;right:25px;width:60px;height:60px;border-radius:50%;background:${CONFIG.themeColor};display:flex;align-items:center;justify-content:center;cursor:pointer;z-index:9999;}
    #chat-box {position:fixed;bottom:100px;right:25px;width:90%;max-width:360px;background:#fff;border-radius:12px;box-shadow:0 4px 20px rgba(0,0,0,0.2);display:none;flex-direction:column;z-index:9998;}
    .chat-header {background:${CONFIG.themeColor};color:#fff;padding:12px;display:flex;align-items:center;gap:8px;}
    #chat-close {margin-left:auto;cursor:pointer;font-size:20px;}
    .msg {padding:8px 12px;border-radius:10px;margin:5px;max-width:80%;word-wrap:break-word;}
    .msg.bot {background:#f3f3f3;}
    .msg.user {background:${CONFIG.themeColor};color:#fff;margin-left:auto;}
    #welcome-step {padding:16px;display:flex;flex-direction:column;gap:10px;}
    #welcome-step input {padding:8px;border:1px solid #ccc;border-radius:6px;}
    #welcome-step button {background:${CONFIG.themeColor};color:#fff;padding:8px;border:none;border-radius:6px;cursor:pointer;}
    #chat-step {display:none;flex-direction:column;height:400px;}
    #chat-messages {flex:1;overflow-y:auto;padding:10px;}
    #chat-input-container {display:flex;}
    #chat-input {flex:1;padding:8px;border:1px solid #ccc;border-radius:6px 0 0 6px;outline:none;}
    #send {padding:0 16px;background:${CONFIG.themeColor};border:none;color:#fff;border-radius:0 6px 6px 0;cursor:pointer;}
  `;
  document.head.appendChild(style);

  // Elements
  const bubble = document.createElement("div");
  bubble.id = "chat-bubble";
  bubble.innerHTML = CONFIG.logoUrl ? `<img src="${CONFIG.logoUrl}" style="width:32px;height:32px;border-radius:50%;">` : "💬";
  document.body.appendChild(bubble);

  const box = document.createElement("div");
  box.id = "chat-box";
  box.innerHTML = `
    <div class="chat-header">
      ${CONFIG.logoUrl ? `<img src="${CONFIG.logoUrl}" style="width:24px;height:24px;border-radius:50%;">` : ""}
      <span>${CONFIG.title}</span>
      <span id="chat-close">×</span>
    </div>
    <div id="welcome-step">
      <input id="name" placeholder="Name" ${CONFIG.requiredFields.name ? "required" : ""}>
      <input id="email" type="email" placeholder="Email" ${CONFIG.requiredFields.email ? "required" : ""}>
      <input id="phone" type="tel" placeholder="Phone" ${CONFIG.requiredFields.phone ? "required" : ""}>
      <button id="start-chat">Start Chat</button>
    </div>
    <div id="chat-step">
      <div id="chat-messages"></div>
      <div id="chat-input-container">
        <input id="chat-input" placeholder="Type a message..." type="text">
        <button id="send">Send</button>
      </div>
    </div>
  `;
  document.body.appendChild(box);

  // References
  const welcome = document.getElementById("welcome-step");
  const chat = document.getElementById("chat-step");
  const messages = document.getElementById("chat-messages");
  const chatInput = document.getElementById("chat-input");
  const send = document.getElementById("send");
  const closeBtn = document.getElementById("chat-close");
  const startBtn = document.getElementById("start-chat");

  // Functions
  const openChat = () => { box.style.display = "flex"; bubble.style.display = "none"; welcome.style.display = "flex"; chat.style.display = "none"; };
  const closeChat = () => { box.style.display = "none"; bubble.style.display = "flex"; };

  startBtn.onclick = () => {
    const nameVal = document.getElementById("name").value.trim();
    const emailVal = document.getElementById("email").value.trim();
    const phoneVal = document.getElementById("phone").value.trim();
    if ((CONFIG.requiredFields.name && !nameVal) || (CONFIG.requiredFields.email && !emailVal)) {
      return alert("Please fill required fields");
    }
    state.user = { name: nameVal, email: emailVal, phone: phoneVal };
    welcome.style.display = "none"; chat.style.display = "flex";
    state.botQueue.push(CONFIG.welcomeMsg);
    processQueue();
  };

  const sendMsg = (text) => {
    if (!text.trim()) return;
    addMsg(text, "user");
    chatInput.value = "";
    fetch(CONFIG.webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: text, user: state.user })
    })
      .then(res => res.json())
      .then(data => {
        state.botQueue.push(data.reply || "🤖 No response");
        processQueue();
      })
      .catch(() => {
        state.botQueue.push("⚠️ Connection failed.");
        processQueue();
      });
  };

  send.onclick = () => sendMsg(chatInput.value);
  chatInput.onkeydown = e => { if (e.key === "Enter") sendMsg(chatInput.value); };
  bubble.onclick = openChat;
  closeBtn.onclick = closeChat;

})();
