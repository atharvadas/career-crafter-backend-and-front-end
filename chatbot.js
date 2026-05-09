/**
 * Career Crafter — AI chatbot (calls Netlify function; no API keys in the browser)
 * Add before </body>: <script src="chatbot.js"></script>
 * Deploy: set ANTHROPIC_API_KEY in Netlify site env. Local: `netlify dev`
 */
(function () {
  'use strict';
  if (document.getElementById('cc-chatbot-root')) return;

  function resolveApiUrl() {
    try {
      var base = window.location.origin && window.location.origin !== 'null' ? window.location.origin : '';
      if (base) return new URL('/.netlify/functions/chat', base).href;
    } catch (_) {}
    return '/.netlify/functions/chat';
  }

  var API_URL = resolveApiUrl();
  var REQUEST_MS = 28000;

  var KNOWLEDGE = [
    {
      keys: ['hello', 'hi', 'hey', 'namaste', 'good morning', 'good evening'],
      reply:
        'Hi! I’m **Career Crafter’s** assistant. Ask about careers, roadmaps, signing up, logging in, or features on the site.',
    },
    {
      keys: ['what is career crafter', 'about career crafter', 'what do you do', 'who are you'],
      reply:
        '**Career Crafter** maps your skills, interests, and goals into a personalized career roadmap so your next step stays clear.',
    },
    {
      keys: ['how it works', 'how does it work', 'steps', 'process'],
      reply:
        'Roughly: (1) Tell us about yourself, (2) get matched paths, (3) follow your roadmap with skills and milestones, (4) track and adapt as you grow.',
    },
    {
      keys: ['price', 'pricing', 'cost', 'free', 'pay', 'subscription'],
      reply:
        'Career Crafter is **100% free** — assessment, roadmaps, skill gap tools, and this assistant (when hosted with AI) cost nothing. No credit card.',
    },
    {
      keys: ['signup', 'sign up', 'register', 'create account', 'account'],
      reply:
        'Open **signup.html**. You’ll choose a **role** (Student, Counsellor, College, or Parent), then name, email, academic context, and password (8+ characters). Your **dashboard** layout matches that role.',
    },
    {
      keys: ['parent', 'counsellor', 'counselor', 'college staff', 'different dashboard', 'who is this for', 'interface'],
      reply:
        'At sign-up you pick **Student**, **Career counsellor**, **College**, or **Parent**. Each gets its own **dashboard** cards, colours, and shortcuts. After login, use **Change interface** on the dashboard to switch your saved role.',
    },
    {
      keys: ['login', 'log in', 'forgot password', 'sign in'],
      reply:
        'Use **login.html** with your email and password. There’s a “Forgot password?” link on the form (demo).',
    },
    {
      keys: ['roadmap', 'career path', 'steps to', 'ai engineer', 'web developer', 'data analyst'],
      reply:
        'Open **roadmap.html** — pick a career (AI, web, data, UX, etc.) and see skills, certifications, courses, and a timeline.',
    },
    {
      keys: ['emerging', 'careers page', 'career list', 'explore careers', 'which career', 'all careers'],
      reply:
        'Open **careers.html** for 10+ structured roadmaps, or **emerging_careers.html** for future-facing roles and trends. Deep plans live on **roadmap.html**.',
    },
    {
      keys: ['assessment', 'test', 'quiz', '40 question', 'riasec', 'holland'],
      reply:
        'Take the psychometric test on **assessment.html** (40 questions, RIASEC / multiple-intelligences style). Results help suggest career directions.',
    },
    {
      keys: ['dashboard', 'home page app', 'after login'],
      reply:
        'After sign-in, **dashboard.html** is your hub — goals, progress, and links to assessment, roadmaps, and profile.',
    },
    {
      keys: ['profile', 'my profile', 'edit profile', 'skills on profile'],
      reply:
        'Update background and skills on **profile.html**. That feeds skill-gap views and keeps your roadmap relevant.',
    },
    {
      keys: ['skill', 'gap', 'learn'],
      reply:
        'Career Crafter focuses on **skills gap** ideas: what you need for a role and structured steps to build those skills.',
    },
    {
      keys: ['mentor', 'mentorship'],
      reply:
        'The product mentions **mentor matching** with vetted mentors. See **Features** and **FAQ** on the home page.',
    },
    {
      keys: ['fresher', 'student', 'beginner'],
      reply:
        'Yes — the FAQ says Career Crafter works for **freshers and students** and for people pivoting mid-career.',
    },
    {
      keys: ['linkedin', 'naukri', 'job board'],
      reply:
        'Job boards help you apply; Career Crafter helps you decide **which** roles fit and **what to learn** first.',
    },
    {
      keys: ['faq', 'question', 'help'],
      reply:
        'The home page has an **FAQ** section. Scroll to **#faq** or ask something specific here.',
    },
    {
      keys: ['thank', 'thanks', 'bye', 'goodbye'],
      reply: 'You’re welcome! Good luck with your career journey.',
    },
  ];

  function normalize(text) {
    return String(text).toLowerCase().replace(/\s+/g, ' ').trim();
  }

  function findFallbackAnswer(question) {
    var q = normalize(question);
    if (!q) {
      return 'Ask me about **roadmaps**, **login/signup**, **pricing**, or **Career Crafter** features.';
    }
    for (var i = 0; i < KNOWLEDGE.length; i++) {
      var row = KNOWLEDGE[i];
      for (var j = 0; j < row.keys.length; j++) {
        if (q.indexOf(row.keys[j]) !== -1) return row.reply;
      }
    }
    if (q.indexOf('?') !== -1 || q.split(' ').length >= 3) {
      return (
        'I can answer best about **roadmaps**, **assessment**, **signup/login**, and **Career Crafter** pages. ' +
        'For full AI career coaching, run **`netlify dev`** locally or deploy to **Netlify** with **ANTHROPIC_API_KEY** set.'
      );
    }
    return 'Ask me about **roadmaps**, **account**, **pricing**, or how Career Crafter works!';
  }

  /* ── CSS ── */
  var css = `
    #cc-chatbot-root {
      position: fixed; bottom: max(1.25rem, env(safe-area-inset-bottom, 0px)); right: max(1.25rem, env(safe-area-inset-right, 0px));
      z-index: 99999; font-family: 'Plus Jakarta Sans', system-ui, -apple-system, sans-serif;
      display: flex; flex-direction: column; align-items: flex-end; gap: 0.75rem;
    }
    #cc-chatbot-root * { box-sizing: border-box; margin: 0; padding: 0; }

    #cc-toggle {
      width: 62px; height: 62px; border-radius: 18px; border: none; cursor: pointer;
      background: linear-gradient(145deg, #1a6b4a, #2ecc8a 50%, #3aa8d8);
      display: flex; align-items: center; justify-content: center;
      box-shadow: 0 6px 24px rgba(46,204,138,0.45);
      transition: transform 0.3s cubic-bezier(.34,1.56,.64,1), box-shadow 0.25s;
      animation: cc-float 3.5s ease-in-out infinite;
      position: relative;
    }
    #cc-toggle:hover { box-shadow: 0 10px 32px rgba(46,204,138,0.6); filter: brightness(1.07); }
    #cc-toggle:active { transform: scale(0.95) !important; }
    @keyframes cc-float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-7px)} }

    .cc-toggle-icon { font-size: 28px; transition: transform 0.3s ease; line-height:1; }
    #cc-chatbot-root.open #cc-toggle .cc-toggle-icon { transform: rotate(90deg); }

    #cc-badge {
      position: absolute; top: -5px; right: -5px;
      width: 18px; height: 18px; border-radius: 50%;
      background: #ef4444; color: #fff;
      font-size: 10px; font-weight: 700;
      display: flex; align-items: center; justify-content: center;
      border: 2px solid #fff; display: none;
    }

    #cc-panel {
      width: min(380px, calc(100vw - 2rem));
      background: #fff; border-radius: 20px;
      border: 1px solid rgba(26,26,46,0.1);
      box-shadow: 0 20px 60px rgba(26,26,46,0.18);
      display: none; flex-direction: column; overflow: hidden;
      transform-origin: bottom right;
    }
    #cc-chatbot-root.open #cc-panel {
      display: flex;
      animation: cc-panel-in 0.35s cubic-bezier(.34,1.56,.64,1) both;
    }
    @keyframes cc-panel-in {
      from { opacity:0; transform: scale(0.88) translateY(12px); }
      to   { opacity:1; transform: scale(1) translateY(0); }
    }

    #cc-header {
      background: linear-gradient(135deg, #1a6b4a, #2ecc8a 45%, #5B4FE8);
      padding: 1rem 1.1rem;
      display: flex; align-items: center; justify-content: space-between;
    }
    .cc-header-left { display: flex; align-items: center; gap: 0.65rem; }
    .cc-avatar {
      width: 38px; height: 38px; border-radius: 12px;
      background: rgba(255,255,255,0.2);
      display: flex; align-items: center; justify-content: center;
      font-size: 20px; flex-shrink: 0;
    }
    .cc-header-name {
      font-size: 0.92rem; font-weight: 700;
      color: #fff; letter-spacing: -0.01em;
    }
    .cc-header-status {
      display: flex; align-items: center; gap: 0.3rem;
      font-size: 0.72rem; color: rgba(255,255,255,0.85);
    }
    .cc-status-dot {
      width: 6px; height: 6px; border-radius: 50%;
      background: #a7f3d0; animation: cc-pulse 2s infinite;
    }
    @keyframes cc-pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }

    #cc-close-btn {
      background: rgba(255,255,255,0.2); border: none; cursor: pointer;
      width: 30px; height: 30px; border-radius: 9px; color: #fff;
      font-size: 1.1rem; display: flex; align-items: center; justify-content: center;
      transition: background 0.2s, transform 0.2s;
    }
    #cc-close-btn:hover { background: rgba(255,255,255,0.35); transform: rotate(90deg); }

    #cc-chips {
      display: flex; gap: 0.4rem; padding: 0.65rem 0.75rem 0;
      overflow-x: auto; scrollbar-width: none; flex-shrink: 0;
    }
    #cc-chips::-webkit-scrollbar { display: none; }
    .cc-chip {
      background: #f0fdf4; border: 1px solid #bbf7d0;
      color: #166534; border-radius: 100px;
      padding: 0.3rem 0.75rem; font-size: 0.73rem; font-weight: 600;
      white-space: nowrap; cursor: pointer;
      transition: background 0.2s, border-color 0.2s;
      font-family: inherit;
    }
    .cc-chip:hover { background: #dcfce7; border-color: #86efac; }

    #cc-messages {
      flex: 1; overflow-y: auto; padding: 0.75rem;
      display: flex; flex-direction: column; gap: 0.6rem;
      min-height: 240px; max-height: 360px;
      background: #fafbfc;
      scroll-behavior: smooth;
    }
    #cc-messages::-webkit-scrollbar { width: 4px; }
    #cc-messages::-webkit-scrollbar-thumb { background: #e5e7eb; border-radius: 4px; }

    .cc-msg {
      max-width: 88%; padding: 0.65rem 0.9rem;
      border-radius: 14px; font-size: 0.86rem; line-height: 1.55;
      animation: cc-msg-in 0.3s cubic-bezier(.34,1.56,.64,1) both;
    }
    @keyframes cc-msg-in {
      from { opacity:0; transform: translateY(8px) scale(0.96); }
      to   { opacity:1; transform: translateY(0) scale(1); }
    }
    .cc-msg-bot {
      align-self: flex-start;
      background: #fff; color: #1a1a2e;
      border: 1px solid #e5e7eb;
      border-bottom-left-radius: 4px;
    }
    .cc-msg-user {
      align-self: flex-end;
      background: linear-gradient(135deg, #5B4FE8, #7B6FF0);
      color: #fff; border-bottom-right-radius: 4px;
    }
    .cc-msg strong { font-weight: 700; }
    .cc-msg a { color: #2ecc8a; text-decoration: underline; }

    #cc-typing {
      align-self: flex-start; display: none;
      background: #fff; border: 1px solid #e5e7eb;
      border-radius: 14px; border-bottom-left-radius: 4px;
      padding: 0.65rem 0.9rem; gap: 4px; align-items: center;
    }
    #cc-typing.show { display: flex; animation: cc-msg-in 0.3s ease both; }
    .cc-dot {
      width: 7px; height: 7px; border-radius: 50%;
      background: #2ecc8a; animation: cc-bounce 1.2s ease-in-out infinite;
    }
    .cc-dot:nth-child(2) { animation-delay: 0.15s; }
    .cc-dot:nth-child(3) { animation-delay: 0.3s; }
    @keyframes cc-bounce { 0%,60%,100%{transform:translateY(0);opacity:0.4} 30%{transform:translateY(-5px);opacity:1} }

    #cc-form {
      display: flex; gap: 0.45rem;
      padding: 0.65rem 0.75rem;
      border-top: 1px solid #f0f0f0;
      background: #fff;
    }
    #cc-input {
      flex: 1; border: 1.5px solid #e5e7eb; border-radius: 12px;
      padding: 0.6rem 0.85rem; font-size: 0.86rem;
      font-family: inherit; outline: none; color: #1a1a2e;
      background: #fff; resize: none;
      transition: border-color 0.2s, box-shadow 0.2s;
    }
    #cc-input:focus {
      border-color: #5B4FE8;
      box-shadow: 0 0 0 3px rgba(91,79,232,0.12);
    }
    #cc-input::placeholder { color: #bbb; }
    #cc-send {
      background: #1a1a2e; color: #fff; border: none;
      border-radius: 12px; padding: 0 1rem;
      font-family: inherit; font-size: 0.85rem; font-weight: 600;
      cursor: pointer; white-space: nowrap;
      transition: background 0.2s, transform 0.2s;
      display: flex; align-items: center; gap: 0.3rem;
    }
    #cc-send:hover { background: #2ecc8a; transform: translateY(-1px); }
    #cc-send:active { transform: scale(0.97); }
    #cc-send:disabled { background: #ccc; cursor: not-allowed; transform: none; }

    #cc-footer {
      text-align: center; font-size: 0.68rem; color: #bbb;
      padding: 0.4rem; background: #fff;
      border-top: 1px solid #f5f5f5;
    }

    @media (max-width: 480px) {
      #cc-chatbot-root { bottom: 1rem; right: 1rem; }
      #cc-panel { width: calc(100vw - 2rem); }
      #cc-toggle { width: 56px; height: 56px; }
    }
  `;

  var style = document.createElement('style');
  style.textContent = css;
  document.head.appendChild(style);

  var root = document.createElement('div');
  root.id = 'cc-chatbot-root';
  root.innerHTML = `
    <div id="cc-panel">
      <div id="cc-header">
        <div class="cc-header-left">
          <div class="cc-avatar">🎯</div>
          <div class="cc-header-info">
            <div class="cc-header-name">Career Assistant</div>
            <div class="cc-header-status">
              <span class="cc-status-dot"></span>
              <span>AI-powered · Here to help</span>
            </div>
          </div>
        </div>
        <button type="button" id="cc-close-btn" aria-label="Close">✕</button>
      </div>

      <div id="cc-chips">
        <button type="button" class="cc-chip" data-q="What careers can I explore?">🚀 Explore careers</button>
        <button type="button" class="cc-chip" data-q="How do I sign up or log in?">🔐 Account</button>
        <button type="button" class="cc-chip" data-q="How do I get started as a beginner?">🎓 Beginner</button>
        <button type="button" class="cc-chip" data-q="Where is the career roadmap?">🗺 Roadmap</button>
        <button type="button" class="cc-chip" data-q="What skills should I learn first?">📚 Skills</button>
      </div>

      <div id="cc-messages" role="log" aria-live="polite" aria-relevant="additions" aria-label="Chat messages">
        <div class="cc-msg cc-msg-bot">
          👋 Hi! I’m your <strong>Career Crafter</strong> assistant.<br><br>
          Ask about career paths, skills, roadmaps, or how to use the site. What would you like to know?
        </div>
      </div>

      <div id="cc-typing" aria-hidden="true">
        <span class="cc-dot"></span>
        <span class="cc-dot"></span>
        <span class="cc-dot"></span>
      </div>

      <form id="cc-form" action="#" method="post">
        <input id="cc-input" type="text" placeholder="Ask about careers, skills, roadmaps…" maxlength="400" autocomplete="off"/>
        <button type="submit" id="cc-send">Send ↗</button>
      </form>

      <div id="cc-footer">Career Crafter · AI on Netlify · Smart tips offline</div>
    </div>

    <button type="button" id="cc-toggle" aria-label="Open career assistant" aria-expanded="false">
      <span id="cc-badge">1</span>
      <span class="cc-toggle-icon">🎯</span>
    </button>
  `;
  document.body.appendChild(root);

  var footerEl = document.getElementById('cc-footer');
  if (footerEl && window.location.protocol === 'file:') {
    footerEl.textContent = 'Offline tips mode · Use Netlify / netlify dev for AI';
  }

  var panel = document.getElementById('cc-panel');
  var toggle = document.getElementById('cc-toggle');
  var closeBtn = document.getElementById('cc-close-btn');
  var messages = document.getElementById('cc-messages');
  var input = document.getElementById('cc-input');
  var sendBtn = document.getElementById('cc-send');
  var typing = document.getElementById('cc-typing');
  var badge = document.getElementById('cc-badge');
  var chips = document.querySelectorAll('#cc-chips .cc-chip');

  var isOpen = false;
  var isLoading = false;
  var history = [];

  async function fetchAssistantReply(userMessage) {
    if (window.location.protocol === 'file:') {
      var localErr = new Error('LOCAL_FILE');
      localErr.code = 'CC_LOCAL_FILE';
      throw localErr;
    }
    var messagesForApi = history.concat([{ role: 'user', content: userMessage }]);
    var controller = new AbortController();
    var tid = setTimeout(function () {
      controller.abort();
    }, REQUEST_MS);
    var response;
    try {
      response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: messagesForApi }),
        signal: controller.signal,
      });
    } finally {
      clearTimeout(tid);
    }

    var data = {};
    try {
      data = await response.json();
    } catch (_) {}

    if (!response.ok) {
      var errMsg = data.error || 'Chat request failed';
      var httpErr = new Error(errMsg);
      httpErr.httpStatus = response.status;
      throw httpErr;
    }
    if (!data.reply || typeof data.reply !== 'string') {
      throw new Error('Invalid response');
    }
    history = messagesForApi.concat([{ role: 'assistant', content: data.reply }]);
    if (history.length > 20) history = history.slice(-20);
    return data.reply;
  }

  function addMessage(text, isBot) {
    var div = document.createElement('div');
    div.className = 'cc-msg ' + (isBot ? 'cc-msg-bot' : 'cc-msg-user');
    if (isBot) {
      div.innerHTML = String(text)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
        .replace(/\n/g, '<br>');
    } else {
      div.textContent = text;
    }
    messages.appendChild(div);
    messages.scrollTop = messages.scrollHeight;
  }

  async function sendMessage(text) {
    text = text.trim();
    if (!text || isLoading) return;

    addMessage(text, false);
    input.value = '';
    isLoading = true;
    sendBtn.disabled = true;
    sendBtn.textContent = '...';
    typing.classList.add('show');
    messages.scrollTop = messages.scrollHeight;

    var reply;
    try {
      reply = await fetchAssistantReply(text);
    } catch (err) {
      reply = findFallbackAnswer(text);
      var hint = '';
      if (err && err.code === 'CC_LOCAL_FILE') {
        hint =
          '**You opened this page as a local file.** Double-clicking HTML cannot call Netlify functions.\n\n' +
          '**Fix:** In the project folder run **`netlify dev`** and open the URL it shows (usually `http://localhost:8888`).\n\n';
      } else if (err && err.name === 'AbortError') {
        hint =
          '**Request timed out** — check your connection or try again.\n\n';
      } else if (err && err.httpStatus === 404) {
        hint =
          '**AI endpoint not found (404).** Live Server, `python -m http.server`, or opening a folder in the browser **do not** run Netlify Functions.\n\n' +
          '**Fix:** Run **`netlify dev`** from this project, **or** use your **published Netlify site URL** (not a raw file path).\n\n';
      } else if (err && err.httpStatus === 503) {
        hint =
          '**Chat is not configured on the server.** Netlify needs your Anthropic key.\n\n' +
          '**Fix:** Netlify → **Site configuration** → **Environment variables** → add **`ANTHROPIC_API_KEY`**, then **Redeploy**.\n\n';
      } else if (err && err.httpStatus === 502) {
        hint =
          '**AI provider returned an error** (often invalid key, billing, or model). Check Netlify **Functions** logs and your Anthropic console.\n\n';
      } else if (
        err &&
        (/Failed to fetch|NetworkError|Load failed|network/i.test(String(err.message)) ||
          err.code === 'CC_FETCH_NETWORK')
      ) {
        hint =
          '**Could not reach the chat API.** You may be offline, blocking the request, or not on a Netlify-served URL.\n\n' +
          '**Fix:** Deploy to Netlify and use that URL, or run **`netlify dev`** locally.\n\n';
      } else if (err && err.message && err.message !== 'LOCAL_FILE') {
        hint = '**Details:** ' + String(err.message).replace(/</g, '') + '\n\n';
      }
      reply = hint + reply;
      var messagesForApi = history.concat([{ role: 'user', content: text }]);
      history = messagesForApi.concat([{ role: 'assistant', content: reply }]);
      if (history.length > 20) history = history.slice(-20);
      console.warn('Chatbot fallback:', err && err.message ? err.message : err);
    }

    typing.classList.remove('show');
    addMessage(reply, true);

    isLoading = false;
    sendBtn.disabled = false;
    sendBtn.textContent = 'Send ↗';
    input.focus();
  }

  function openChat() {
    isOpen = true;
    root.classList.add('open');
    toggle.setAttribute('aria-expanded', 'true');
    badge.style.display = 'none';
    setTimeout(function () {
      input.focus();
    }, 300);
  }

  function closeChat() {
    isOpen = false;
    root.classList.remove('open');
    toggle.setAttribute('aria-expanded', 'false');
  }

  toggle.addEventListener('click', function () {
    if (isOpen) closeChat();
    else openChat();
  });
  closeBtn.addEventListener('click', closeChat);

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && isOpen) closeChat();
  });

  document.getElementById('cc-form').addEventListener('submit', function (e) {
    e.preventDefault();
    sendMessage(input.value);
  });

  input.addEventListener('keydown', function (e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input.value);
    }
  });

  chips.forEach(function (chip) {
    chip.addEventListener('click', function () {
      var q = chip.getAttribute('data-q');
      if (q) sendMessage(q);
    });
  });

  setTimeout(function () {
    if (!isOpen) badge.style.display = 'flex';
  }, 3000);
})();
