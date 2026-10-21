// Typewriter for the project headings, matching the Figma Sites interaction:
// hovering a heading types it out at ~20 characters a second behind a blinking
// cursor, and the text stays once typed. Touch screens can't hover, so there the
// heading types itself when it scrolls into view. With reduced motion, or
// without JavaScript, the heading is simply shown in full.
(function () {
  var MS_PER_CHAR = 50;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  var canHover = window.matchMedia("(hover: hover)").matches;

  document.querySelectorAll(".project__lede").forEach(function (heading) {
    var text = heading.textContent.trim().replace(/\s+/g, " ");

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

    var started = false;
    function type() {
      if (started) return;
      started = true;
      glyphs.classList.add("is-typing");
      var i = 0;
      var timer = setInterval(function () {
        chars[i].classList.add("is-shown");
        chars[i].after(caret);
        i += 1;
        if (i === chars.length) {
          clearInterval(timer);
          glyphs.classList.remove("is-typing");
        }
      }, MS_PER_CHAR);
    }

    if (canHover) {
      heading.addEventListener("pointerenter", type);
      // Keyboard users: start when focus reaches the project's button.
      var article = heading.closest(".project");
      if (article) article.addEventListener("focusin", type);
    } else if ("IntersectionObserver" in window) {
      var observer = new IntersectionObserver(function (entries) {
        if (entries[0].isIntersecting) {
          observer.disconnect();
          type();
        }
      }, { threshold: 0.6 });
      observer.observe(heading);
    } else {
      type();
    }
  });
})();
