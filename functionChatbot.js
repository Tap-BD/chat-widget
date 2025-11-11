(function () {
  /**************************************************************
   * ⚙️ CONFIGURATION
   **************************************************************/
  const CONFIG = {
    webhookUrl: "https://n8n.srv1072276.hstgr.cloud/webhook/170b2295-996c-486e-a949-098ecf8b88c8/chat",
    themeColor: "#0066FF",
    logoUrl: "https://www.redditstatic.com/shreddit/assets/snoo_wave.png",
    title: "Travel Assistant",
    welcomeMsg: "👋 Hi there! How can I help you plan your trip?",
    idleMsg: "💬 Need any help?",
    soundPop: "https://cdn.jsdelivr.net/gh/naptha/tiny-sound@master/sounds/notify.mp3",
    soundClose: "https://cdn.jsdelivr.net/gh/naptha/tiny-sound@master/sounds/click.mp3",
    soundReply: "https://cdn.jsdelivr.net/gh/naptha/tiny-sound@master/sounds/pop.mp3",
    animationDelay: 5000,
    repeatAnimationInterval: 3 * 60 * 1000,
    requiredFields: { name: true, email: true, phone: false },
    devMode: true
  };

  /**************************************************************
   * 💾 STATE
   **************************************************************/
  const state = {
    user: null,
    greeted: false,
    hasConversation: false,
    botQueue: [],
    isProcessing: false
  };

  /**************************************************************
   * 💨 UTILITIES
   **************************************************************/
  const playSound = (url) => new Audio(url).play();

  const showTyping = () => {
    const typingEl = document.createElement("div");
    typingEl.id = "typing-indicator";
    typingEl.textContent = "🤖 Thinking...";
    typingEl.className = "msg bot fade-in";
    messages.appendChild(typingEl);
    messages.scrollTop = messages.scrollHeight;
  };

  const hideTyping = () => {
    const typingEl = document.getElementById("typing-indicator");
    if (typingEl) typingEl.remove();
  };

  const addMsg = (text, from = "bot") => {
    const el = document.createElement("div");
    el.className = `msg ${from} fade-in`;
    el.textContent = text;
    messages.appendChild(el);
    messages.scrollTop = messages.scrollHeight;
    if (from === "bot") playSound(CONFIG.soundReply);
  };

  const processQueue = () => {
    if(state.isProcessing || state.botQueue.length===0) return;
    state.isProcessing = true;
    const msg = state.botQueue.shift();
    showTyping();
    setTimeout(() => {
      hideTyping();
      addMsg(msg,"bot");
      state.isProcessing = false;
      processQueue();
    }, 800 + Math.random()*500);
  };

  /**************************************************************
   * 🎨 STYLES
   **************************************************************/
  const style = document.createElement("style");
  style.textContent = `
    @keyframes bubble-pop {0%{transform:scale(0.8);opacity:0;}60%{transform:scale(1.2);opacity:1;}100%{transform:scale(1);opacity:1;}}
    @keyframes zoom-in {0%{transform:scale(0);}100%{transform:scale(1);}}
    @keyframes slide-up {0%{transform:translateY(30px);opacity:0;}100%{transform:translateY(0);opacity:1;}}
    @keyframes fadeIn {0% {opacity:0; transform:translateY(5px);} 100% {opacity:1; transform:translateY(0);}}

    /* Bubble */
    #chat-bubble {position:fixed;bottom:25px;right:25px;width:60px;height:60px;border-radius:50%;background:${CONFIG.themeColor};
      display:flex;align-items:center;justify-content:center;cursor:pointer;box-shadow:0 0 8px rgba(0,0,0,0.2);
      z-index:9999;animation:bubble-pop .6s ease forwards;transition:transform .3s,bottom .3s;}
    #chat-bubble:hover {transform:scale(1.15);box-shadow:0 0 14px ${CONFIG.themeColor};}

    /* Chat Box */
    #chat-box {position:fixed;bottom:100px;right:25px;width:90%;max-width:360px;background:#fff;border-radius:14px;
      box-shadow:0 8px 28px rgba(0,0,0,0.25);overflow:hidden;display:none;flex-direction:column;animation:zoom-in .4s ease forwards;
      transform-origin:bottom right;z-index:9998;}

    .chat-header {background:${CONFIG.themeColor};color:#fff;padding:12px;font-weight:500;display:flex;align-items:center;gap:8px;}
    #chat-close {margin-left:auto;cursor:pointer;font-size:22px;font-weight:bold;}
    #chat-close:hover {color:#ddd;}

    .msg {padding:8px 12px;border-radius:10px;margin:5px;max-width:80%;word-wrap:break-word;opacity:1;transition:opacity 0.3s;}
    .msg.bot {background:#f3f3f3;}
    .msg.user {background:${CONFIG.themeColor};color:#fff;margin-left:auto;}
    .fade-in {animation:fadeIn 0.5s ease forwards;}

    #reaction-box {padding:16px;text-align:center;animation:slide-up .4s ease forwards;}

    /* Welcome page */
    #welcome-step {padding:12px;display:flex;flex-direction:column;gap:10px;width:100%;max-width:320px;box-sizing:border-box;background:#fff;border-radius:12px;box-shadow:0 4px 10px rgba(0,0,0,0.2);font-family:Arial,sans-serif;margin:20px auto 20px auto;}
    #welcome-step h4 {margin:0;color:#333;font-size:16px;text-align:center;}
    #welcome-step p {margin:0;color:#666;font-size:13px;text-align:center;}
    #welcome-step input.chat-input {padding:8px 10px;font-size:13px;border:1.5px solid #000;border-radius:8px;outline:none;transition:all 0.2s ease;}
    #welcome-step input.chat-input:focus,#welcome-step input.chat-input:hover {border-color:#0066FF;box-shadow:0 0 8px rgba(0,102,255,0.5);}
    .error-msg {color:red;font-size:11px;margin-top:-6px;margin-bottom:4px;}
    #welcome-step input.error {border-color:red !important;box-shadow:0 0 5px rgba(255,0,0,0.5) !important;}
    #welcome-step button.chat-btn {background-color:#0066FF;color:white;border:none;padding:8px 0;font-size:14px;font-weight:500;border-radius:8px;cursor:pointer;transition:all 0.2s ease;}
    #welcome-step button.chat-btn:hover {background-color:#0044AA;box-shadow:0 0 8px rgba(0,102,255,0.5);}

    /* Chat input + send button */
    #chat-step > div:last-child {display:flex;border-top:1px solid #ddd;border-radius:0 0 10px 10px;overflow:hidden;margin-top:auto;}
    #chat-step input {flex:1;padding:10px 12px;font-size:14px;border:none;outline:none;box-sizing:border-box;}
    #chat-step button#send {padding:0 16px;font-size:14px;border:none;background:${CONFIG.themeColor};color:#fff;cursor:pointer;border-radius:0 !important;transition:background 0.2s;}
    #chat-step button#send:hover {background:#0044aa;}

    /* Responsive */
    @media screen and (max-width:768px){#chat-box{bottom:60px;right:10px;width:95%;max-width:360px;}}
    @media screen and (max-width:480px){#chat-box{bottom:40px;right:5px;width:98%;}}
  `;
  document.head.appendChild(style);

  /**************************************************************
   * 🔗 CREATE ELEMENTS
   **************************************************************/
  const bubble = document.createElement("div");
  bubble.id = "chat-bubble";
  bubble.innerHTML = CONFIG.logoUrl ? `<img src="${CONFIG.logoUrl}" style="width:32px;height:32px;border-radius:50%;">` : "💬";
  document.body.appendChild(bubble);

  const box = document.createElement("div");
  box.id = "chat-box";
  box.innerHTML = `
    <div class="chat-header">
      ${CONFIG.logoUrl ? `<img src="${CONFIG.logoUrl}" style="width:26px;height:26px;border-radius:50%;">` : ""}
      <span>${CONFIG.title}</span>
      <span id="chat-close">×</span>
    </div>

    <!-- STEP 1: WELCOME FORM -->
    <div id="welcome-step">
      <h4>Welcome 👋</h4>
      <p>Please fill details to start chat</p>
      <input id="name" class="chat-input" placeholder="Name" ${CONFIG.requiredFields.name ? "required" : ""}>
      <input id="email" class="chat-input" placeholder="Email" type="email" ${CONFIG.requiredFields.email ? "required" : ""}>
      <input id="phone" class="chat-input" placeholder="Phone" type="tel" ${CONFIG.requiredFields.phone ? "required" : ""}>
      <button id="start-chat" class="chat-btn">Start Chat</button>
    </div>

    <!-- STEP 2: MAIN CHAT -->
    <div id="chat-step" style="display:none;flex-direction:column;height:420px;">
      <div id="chat-messages" style="flex:1;overflow-y:auto;padding:10px;"></div>
      <div>
        <input id="chat-input" placeholder="Type a message..." type="text">
        <button id="send">Send</button>
      </div>
    </div>

    <!-- STEP 3: CLOSE FEEDBACK -->
    <div id="reaction-step" style="display:none;">
      <div id="reaction-box">
        <p>Was this chat helpful?</p>
        <span class="emoji-btn" id="yes">👍</span>
        <span class="emoji-btn" id="no">👎</span>
      </div>
    </div>
  `;
  document.body.appendChild(box);

  /**************************************************************
   * 🔗 REFERENCES
   **************************************************************/
  const welcome = document.getElementById("welcome-step");
  const chat = document.getElementById("chat-step");
  const reaction = document.getElementById("reaction-step");
  const messages = document.getElementById("chat-messages");
  const chatInput = document.getElementById("chat-input");
  const send = document.getElementById("send");
  const closeBtn = document.getElementById("chat-close");
  const startBtn = document.getElementById("start-chat");

  /**************************************************************
   * 🎯 OPEN / CLOSE CHAT
   **************************************************************/
  const openChat = () => {
    box.style.display = "flex"; box.style.animation="zoom-in .4s ease";
    playSound(CONFIG.soundPop); bubble.style.display="none";
    welcome.style.display="flex"; chat.style.display="none"; reaction.style.display="none";
    state.hasConversation=false;
  };
  const closeChat = () => {box.style.display="none"; bubble.style.display="flex"; welcome.style.display="none"; chat.style.display="none"; reaction.style.display="none";};

  /**************************************************************
   * 🎯 SHOW CHAT
   **************************************************************/
  const showChat = () => {
    welcome.style.display="none"; chat.style.display="flex"; reaction.style.display="none";
    if(!state.greeted){state.greeted=true;state.botQueue.push(CONFIG.welcomeMsg);processQueue();}
  };

  /**************************************************************
   * ✨ WELCOME PAGE VALIDATION
   **************************************************************/
  startBtn.onclick = () => {
    const nameInput = document.getElementById("name");
    const emailInput = document.getElementById("email");
    const phoneInput = document.getElementById("phone");
    [nameInput,emailInput,phoneInput].forEach(i=>{i.classList.remove("error"); const err=i.nextElementSibling;if(err && err.classList.contains("error-msg")) err.remove();});
    let valid=true;
    if(CONFIG.requiredFields.name && !nameInput.value.trim()){nameInput.classList.add("error");const msg=document.createElement("div");msg.className="error-msg";msg.textContent="Name required";nameInput.after(msg);valid=false;}
    if(CONFIG.requiredFields.email){const regex=/^[^\s@]+@[^\s@]+\.[^\s@]+$/;if(!emailInput.value.trim()||!regex.test(emailInput.value.trim())){emailInput.classList.add("error");const msg=document.createElement("div");msg.className="error-msg";msg.textContent="Valid email required";emailInput.after(msg);valid=false;}}
    if(CONFIG.requiredFields.phone && !phoneInput.value.trim()){phoneInput.classList.add("error");const msg=document.createElement("div");msg.className="error-msg";msg.textContent="Phone required";phoneInput.after(msg);valid=false;}
    if(!valid) return;
    state.user={name:nameInput.value.trim(),email:emailInput.value.trim(),phone:phoneInput.value.trim()};
    if(!CONFIG.devMode)localStorage.setItem("chat_user",JSON.stringify(state.user));
    showChat();
  };

  /**************************************************************
   * ✨ SEND MESSAGE
   **************************************************************/
  const sendMsg = (text) => {
    if(!text) return;
    state.hasConversation=true; addMsg(text,"user"); chatInput.value="";
    fetch(CONFIG.webhookUrl,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({message:text,user:state.user})})
      .then(res=>res.json()).then(data=>{state.botQueue.push(data.reply||"🤖 No response");processQueue();})
      .catch(()=>{state.botQueue.push("⚠️ Connection failed.");processQueue();});
  };
  send.onclick = ()=>sendMsg(chatInput.value);
  chatInput.onkeydown = e => e.key==="Enter" && sendMsg(chatInput.value);

  /**************************************************************
   * 🔗 FEEDBACK REACTION
   **************************************************************/
  document.getElementById("yes").onclick = ()=>{
    addMsg("👍 Thanks for your feedback!","bot"); setTimeout(()=>{box.style.display="none";bubble.style.display="flex";},1000);
  };
  document.getElementById("no").onclick = ()=>{
    addMsg("🙏 We'll improve!","bot"); setTimeout(()=>{box.style.display="none";bubble.style.display="flex";},1000);
  };

  /**************************************************************
   * 🔗 BUBBLE HANDLERS
   **************************************************************/
  bubble.onclick = openChat;
  closeBtn.onclick = closeChat;
  setTimeout(()=>{bubble.style.animation="bubble-pop 0.6s ease";playSound(CONFIG.soundPop);},CONFIG.animationDelay);
  setInterval(()=>{bubble.style.animation="bubble-pop 0.6s ease";playSound(CONFIG.soundPop);},CONFIG.repeatAnimationInterval);

})();


