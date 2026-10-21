// Typewriter for the project headings.
// Each heading types itself the first time it is mostly in view, once per visit
// (a browser tab session): reloading or coming back from a case study shows it
// in full. Typing takes about 2-3 seconds whatever the heading's length, then the
// cursor blinks a few times and goes away. With reduced motion, or without
// JavaScript, the heading is simply shown in full; screen readers always get the
// whole heading at once.
(function () {
  var TARGET_MS = 2000;                  // aim for ~2 s per heading
  var MIN_MS_PER_CHAR = 20;              // ...but never faster than 50 letters a second
  var MAX_MS_PER_CHAR = 50;              // ...or slower than the Figma prototype
  var CURSOR_LINGER_MS = 3300;           // three blinks after typing, then hide
  var STORAGE_KEY = "typed-headings";

  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  if (!("IntersectionObserver" in window)) return;

  var seen = {};
  try { seen = JSON.parse(sessionStorage.getItem(STORAGE_KEY)) || {}; } catch (e) { /* storage blocked */ }
  function remember(text) {
    seen[text] = 1;
    try { sessionStorage.setItem(STORAGE_KEY, JSON.stringify(seen)); } catch (e) { /* storage blocked */ }
  }

  document.querySelectorAll(".project__lede").forEach(function (heading) {
    var text = heading.textContent.trim().replace(/\s+/g, " ");
    if (seen[text]) return;              // already typed during this visit

    // Screen readers get the whole heading at once; the animated copy is hidden from them.
    var spoken = document.createElement("span");
    spoken.className = "visually-hidden";
    spoken.textContent = text;

    var glyphs = document.createElement("span");
    glyphs.className = "typewriter";
    glyphs.setAttribute("aria-hidden", "true");

    var chars = Array.from(text).map(function (ch) {
      var span = document.createElement("span");
      span.className = "typewriter__char";
      span.textContent = ch;
      glyphs.appendChild(span);
      return span;
    });

    var caret = document.createElement("span");
    caret.className = "typewriter__caret";
    glyphs.insertBefore(caret, chars[0]);

    heading.textContent = "";
    heading.append(spoken, glyphs);

    var msPerChar = Math.min(MAX_MS_PER_CHAR, Math.max(MIN_MS_PER_CHAR, TARGET_MS / chars.length));

    function type() {
      remember(text);
      glyphs.classList.add("is-typing");
      var i = 0;
      var timer = setInterval(function () {
        chars[i].classList.add("is-shown");
        chars[i].after(caret);
        i += 1;
        if (i === chars.length) {
          clearInterval(timer);
          glyphs.classList.remove("is-typing");
          setTimeout(function () { caret.remove(); }, CURSOR_LINGER_MS);
        }
      }, msPerChar);
    }

    var observer = new IntersectionObserver(function (entries) {
      if (entries[0].isIntersecting) {
        observer.disconnect();
        type();
      }
    }, { threshold: 0.75 });
    observer.observe(heading);
  });
})();
