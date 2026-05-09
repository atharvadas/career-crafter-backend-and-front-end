/**
 * Legacy loader — loads the main widget from the site root.
 * Prefer: <script src="chatbot.js"></script> (same folder as your HTML).
 */
(function () {
  if (window.__ccCareerChatbotLoader) return;
  window.__ccCareerChatbotLoader = true;

  var base = document.currentScript && document.currentScript.src
    ? document.currentScript.src.replace(/[^/]+$/, '')
    : '';
  var s = document.createElement('script');
  s.src = base ? new URL('../chatbot.js', base + 'x').href : 'chatbot.js';
  document.body.appendChild(s);
})();
