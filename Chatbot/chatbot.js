/**
 * Career Crafter — page assistant (rule-based answers, no API key required)
 */
(function () {
  'use strict';

  var BOT_SVG =
    '<svg class="cc-bot-svg" viewBox="0 0 44 44" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">' +
    '<g class="cc-antenna">' +
    '<line x1="22" y1="10" x2="22" y2="4" stroke="rgba(255,255,255,0.95)" stroke-width="2" stroke-linecap="round"/>' +
    '<circle cx="22" cy="3" r="3" fill="#ffeb3b" stroke="rgba(255,255,255,0.5)" stroke-width="1"/>' +
    '</g>' +
    '<rect x="8" y="10" width="28" height="26" rx="10" fill="rgba(255,255,255,0.95)"/>' +
    '<ellipse class="cc-cheek" cx="13" cy="24" rx="3" ry="2" fill="#ffb4c0"/>' +
    '<ellipse class="cc-cheek" cx="31" cy="24" rx="3" ry="2" fill="#ffb4c0"/>' +
    '<g class="cc-eye-l"><circle cx="16" cy="20" r="3.5" fill="#1a1a2e"/><circle cx="17" cy="19" r="1.2" fill="#fff"/></g>' +
    '<g class="cc-eye-r"><circle cx="28" cy="20" r="3.5" fill="#1a1a2e"/><circle cx="29" cy="19" r="1.2" fill="#fff"/></g>' +
    '<path d="M 17 28 Q 22 32 27 28" fill="none" stroke="#1a1a2e" stroke-width="1.8" stroke-linecap="round"/>' +
    '<rect x="4" y="32" width="10" height="6" rx="2" fill="rgba(255,255,255,0.35)"/>' +
    '<rect x="30" y="32" width="10" height="6" rx="2" fill="rgba(255,255,255,0.35)"/>' +
    '</svg>';

  var MINI_BOT_SVG = BOT_SVG.replace('cc-bot-svg', 'cc-bot-svg cc-mini-bot');

  var KNOWLEDGE = [
    {
      keys: ['hello', 'hi', 'hey', 'namaste', 'good morning', 'good evening'],
      reply:
        'Hi! I’m **Career Crafter’s** little helper. Ask me about roadmaps, sign-up, login, pricing, mentors, or anything on this site.',
    },
    {
      keys: ['what is career crafter', 'about career crafter', 'what do you do', 'who are you'],
      reply:
        '**Career Crafter** helps you map skills, interests, and goals into a personalized career roadmap — so your next step stays clear.',
    },
    {
      keys: ['how it works', 'how does it work', 'steps', 'process'],
      reply:
        'Roughly: (1) Tell us about yourself, (2) get matched paths, (3) follow your roadmap with skills and milestones, (4) track and adapt as you grow.',
    },
    {
      keys: ['price', 'pricing', 'cost', 'free', 'pay', 'subscription'],
      reply:
        'The site highlights a **free** start. For exact plans or limits, check the **Pricing** section on the home page.',
    },
    {
      keys: ['signup', 'sign up', 'register', 'create account', 'account'],
      reply:
        'Open **signup.html** from the nav or home page. You’ll enter name, email, academic level, and a password (8+ characters).',
    },
    {
      keys: ['login', 'log in', 'forgot password', 'sign in'],
      reply:
        'Use **login.html** with your email and password. There’s a “Forgot password?” link on the form for recovery (demo).',
    },
    {
      keys: ['roadmap', 'career path', 'steps to', 'ai engineer', 'web developer', 'data analyst'],
      reply:
        '**roadmap.html** lets you pick a career (AI, web, data, etc.) and see skills, certs, courses, and a step-by-step timeline.',
    },
    {
      keys: ['skill', 'gap', 'learn'],
      reply:
        'Career Crafter focuses on **skills gap** ideas: see what you need for a role and follow structured steps to build them.',
    },
    {
      keys: ['mentor', 'mentorship'],
      reply:
        'The product mentions **mentor matching** with vetted mentors. Details are in the **Features** and **FAQ** sections on the home page.',
    },
    {
      keys: ['fresher', 'student', 'beginner'],
      reply:
        'Yes — the FAQ says Career Crafter works for **freshers and students** as well as people pivoting mid-career.',
    },
    {
      keys: ['linkedin', 'naukri', 'job board'],
      reply:
        'Job boards help you apply; Career Crafter helps you decide **which** roles fit you and **what to learn** first.',
    },
    {
      keys: ['faq', 'question', 'help'],
      reply:
        'The home page has an **FAQ** with mentors, subscriptions, changing paths, and more. Scroll to **#faq** or ask me something specific!',
    },
    {
      keys: ['thank', 'thanks', 'bye', 'goodbye'],
      reply: 'You’re welcome! Good luck with your career journey.',
    },
  ];

  function normalize(text) {
    return text.toLowerCase().replace(/\s+/g, ' ').trim();
  }

  function findAnswer(question) {
    var q = normalize(question);
    if (!q) {
      return 'Type a question and I’ll do my best to help with **Career Crafter**.';
    }

    for (var i = 0; i < KNOWLEDGE.length; i++) {
      var row = KNOWLEDGE[i];
      for (var j = 0; j < row.keys.length; j++) {
        if (q.indexOf(row.keys[j]) !== -1) {
          return row.reply;
        }
      }
    }

    if (q.indexOf('?') !== -1 || q.split(' ').length >= 3) {
      return (
        'I’m not sure about that yet — I answer best about **roadmaps**, **login/signup**, **pricing**, and **features** on this site. ' +
        'Try rephrasing or browse **index.html** sections: How it works, Features, FAQ.'
      );
    }

    return 'Ask me about **roadmaps**, **account**, **pricing**, or how Career Crafter works!';
  }

  function injectWidget() {
    if (document.getElementById('cc-career-chatbot')) return;

    var root = document.createElement('div');
    root.id = 'cc-career-chatbot';
    root.setAttribute('role', 'dialog');
    root.setAttribute('aria-label', 'Career assistant chat');
    root.innerHTML =
      '<div class="cc-bot-inner">' +
      '<div class="cc-bot-panel" id="ccBotPanel">' +
      '<div class="cc-bot-header">' +
      '<div class="cc-bot-header-title">' +
      MINI_BOT_SVG +
      '<span>Career helper</span></div>' +
      '<button type="button" class="cc-bot-close" id="ccBotClose" aria-label="Close chat">×</button>' +
      '</div>' +
      '<div class="cc-bot-messages" id="ccBotMessages"></div>' +
      '<form class="cc-bot-form" id="ccBotForm">' +
      '<input type="text" class="cc-bot-input" id="ccBotInput" placeholder="Ask anything…" autocomplete="off" maxlength="500"/>' +
      '<button type="submit" class="cc-bot-send">Send</button>' +
      '</form>' +
      '</div>' +
      '<button type="button" class="cc-bot-toggle" id="ccBotToggle" aria-expanded="false" aria-controls="ccBotPanel" title="Open career assistant">' +
      '<span class="cc-bot-glow-ring"></span>' +
      BOT_SVG +
      '</button>' +
      '</div>';

    document.body.appendChild(root);

    var toggle = document.getElementById('ccBotToggle');
    var closeBtn = document.getElementById('ccBotClose');
    var messages = document.getElementById('ccBotMessages');
    var form = document.getElementById('ccBotForm');
    var input = document.getElementById('ccBotInput');

    function escapeHtml(s) {
      var d = document.createElement('div');
      d.textContent = s;
      return d.innerHTML;
    }

    function addBotRich(reply) {
      var div = document.createElement('div');
      div.className = 'cc-msg cc-msg-bot';
      div.innerHTML = escapeHtml(reply).replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
      messages.appendChild(div);
      messages.scrollTop = messages.scrollHeight;
    }

    addBotRich(
      'Hi! I’m your **Career Crafter** assistant. Ask about roadmaps, signing up, logging in, pricing, or features.'
    );

    function setOpen(open) {
      root.classList.toggle('cc-open', open);
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
      if (open) {
        setTimeout(function () {
          input.focus();
        }, 200);
      }
    }

    toggle.addEventListener('click', function () {
      setOpen(!root.classList.contains('cc-open'));
    });
    closeBtn.addEventListener('click', function () {
      setOpen(false);
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && root.classList.contains('cc-open')) {
        setOpen(false);
      }
    });

    function showTyping() {
      var wrap = document.createElement('div');
      wrap.className = 'cc-typing';
      wrap.id = 'ccTyping';
      wrap.innerHTML = '<span></span><span></span><span></span>';
      messages.appendChild(wrap);
      messages.scrollTop = messages.scrollHeight;
    }

    function hideTyping() {
      var t = document.getElementById('ccTyping');
      if (t) t.remove();
    }

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var text = input.value.trim();
      if (!text) return;
      input.value = '';

      var userEl = document.createElement('div');
      userEl.className = 'cc-msg cc-msg-user';
      userEl.textContent = text;
      messages.appendChild(userEl);
      messages.scrollTop = messages.scrollHeight;

      showTyping();
      window.setTimeout(function () {
        hideTyping();
        addBotRich(findAnswer(text));
      }, 450 + Math.random() * 400);
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', injectWidget);
  } else {
    injectWidget();
  }
})();
