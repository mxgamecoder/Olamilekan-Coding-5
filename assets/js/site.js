/* Olamilekan Coding — site behaviour.
   No dependencies. Everything here degrades gracefully without JS. */
(function () {
  "use strict";

  var root = document.documentElement;
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)");

  /* ---------- theme ---------- */
  var THEME_KEY = "oc-theme";
  var metaTheme = document.querySelector('meta[name="theme-color"]');

  function systemTheme() {
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  }

  function applyTheme(theme) {
    var resolved = theme === "system" ? systemTheme() : theme;
    root.setAttribute("data-theme", resolved);
    if (metaTheme) metaTheme.setAttribute("content", resolved === "dark" ? "#0c0e10" : "#f1f2ef");
    var btn = document.querySelector("[data-theme-toggle]");
    if (btn) {
      btn.setAttribute("aria-label", resolved === "dark" ? "Switch to light theme" : "Switch to dark theme");
      btn.setAttribute("aria-pressed", String(resolved === "dark"));
    }
  }

  var savedTheme = "system";
  try {
    savedTheme = localStorage.getItem(THEME_KEY) || "system";
  } catch (e) {
    /* storage blocked */
  }
  applyTheme(savedTheme);

  window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", function () {
    if ((root.getAttribute("data-theme") || "") && savedTheme === "system") applyTheme("system");
  });

  var themeBtn = document.querySelector("[data-theme-toggle]");
  if (themeBtn) {
    themeBtn.addEventListener("click", function () {
      var next = root.getAttribute("data-theme") === "dark" ? "light" : "dark";
      savedTheme = next;
      try {
        localStorage.setItem(THEME_KEY, next);
      } catch (e) {
        /* ignore */
      }
      applyTheme(next);
    });
  }

  /* ---------- mobile nav ---------- */
  var navToggle = document.querySelector("[data-nav-toggle]");
  var drawer = document.querySelector("[data-drawer]");
  if (navToggle && drawer) {
    navToggle.addEventListener("click", function () {
      var open = drawer.getAttribute("data-open") === "true";
      drawer.setAttribute("data-open", String(!open));
      navToggle.setAttribute("aria-expanded", String(!open));
      navToggle.setAttribute("aria-label", open ? "Open menu" : "Close menu");
    });
    drawer.addEventListener("click", function (e) {
      if (e.target.closest("a")) {
        drawer.setAttribute("data-open", "false");
        navToggle.setAttribute("aria-expanded", "false");
      }
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && drawer.getAttribute("data-open") === "true") {
        drawer.setAttribute("data-open", "false");
        navToggle.setAttribute("aria-expanded", "false");
        navToggle.focus();
      }
    });
  }

  /* ---------- hero word rotator ---------- */
  var rotator = document.querySelector("[data-rotator]");
  if (rotator) {
    var words = (rotator.getAttribute("data-words") || "").split("|").filter(Boolean);
    if (reduce.matches || words.length < 2) {
      rotator.textContent = words[0] || rotator.textContent;
    } else {
      var w = 0;
      var ch = words[0].length;
      var deleting = false;
      var tick = function () {
        var word = words[w];
        if (!deleting) {
          ch++;
          if (ch > word.length) {
            deleting = true;
            return setTimeout(tick, 1700);
          }
        } else {
          ch--;
          if (ch < 1) {
            deleting = false;
            w = (w + 1) % words.length;
          }
        }
        rotator.textContent = word.slice(0, Math.max(1, ch));
        setTimeout(tick, deleting ? 45 : 85);
      };
      tick();
    }
  }

  /* ---------- reveal on scroll ---------- */
  var revealables = document.querySelectorAll("[data-reveal]");
  if (revealables.length) {
    if (reduce.matches || !("IntersectionObserver" in window)) {
      revealables.forEach(function (el) {
        el.classList.add("in");
      });
    } else {
      var ro = new IntersectionObserver(
        function (entries) {
          entries.forEach(function (entry) {
            if (entry.isIntersecting) {
              entry.target.classList.add("in");
              ro.unobserve(entry.target);
            }
          });
        },
        { rootMargin: "0px 0px -8% 0px", threshold: 0.08 }
      );
      revealables.forEach(function (el) {
        ro.observe(el);
      });
    }
  }

  /* ---------- active nav link ---------- */
  var navLinks = Array.prototype.slice.call(document.querySelectorAll(".nav a[href^='#']"));
  if (navLinks.length && "IntersectionObserver" in window) {
    var sections = navLinks
      .map(function (a) {
        return document.querySelector(a.getAttribute("href"));
      })
      .filter(Boolean);
    var so = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          navLinks.forEach(function (a) {
            a.removeAttribute("aria-current");
            if (a.getAttribute("href") === "#" + entry.target.id) a.setAttribute("aria-current", "true");
          });
        });
      },
      { rootMargin: "-45% 0px -50% 0px" }
    );
    sections.forEach(function (s) {
      so.observe(s);
    });
  }

  /* ---------- copy buttons ---------- */
  document.querySelectorAll("[data-copy]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var text = btn.getAttribute("data-copy");
      var label = btn.textContent;
      var done = function (ok) {
        btn.textContent = ok ? "copied" : "press ctrl+c";
        setTimeout(function () {
          btn.textContent = label;
        }, 1600);
      };
      if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(text).then(function () {
          done(true);
        }, function () {
          done(false);
        });
      } else {
        done(false);
      }
    });
  });

  /* ---------- subscribe ---------- */
  var subForm = document.querySelector("[data-subscribe]");
  if (subForm) {
    var status = subForm.querySelector("[data-status]");
    var submit = subForm.querySelector("button[type='submit']");
    var setStatus = function (msg, state) {
      if (!status) return;
      status.textContent = msg;
      if (state) status.setAttribute("data-state", state);
      else status.removeAttribute("data-state");
    };

    subForm.addEventListener("submit", function (e) {
      e.preventDefault();
      var input = subForm.querySelector("input[type='email']");
      if (!input || !input.value.trim()) return;

      var endpoint = subForm.getAttribute("action");
      setStatus("sending…");
      if (submit) submit.disabled = true;

      var body = new FormData();
      body.append("data[email]", input.value.trim());

      fetch(endpoint, { method: "POST", body: body })
        .then(function (res) {
          if (!res.ok) throw new Error("HTTP " + res.status);
          input.value = "";
          setStatus("you're on the list. talk soon.", "ok");
        })
        .catch(function () {
          var mail = subForm.getAttribute("data-fallback");
          setStatus(
            mail
              ? "network blocked the form — email " + mail + " and I'll add you."
              : "something broke. try again in a minute.",
            "err"
          );
        })
        .finally(function () {
          if (submit) submit.disabled = false;
        });
    });
  }

  /* ---------- contact (mailto, no third-party key in the client) ---------- */
  var contactForm = document.querySelector("[data-contact]");
  if (contactForm) {
    contactForm.addEventListener("submit", function (e) {
      e.preventDefault();
      var to = contactForm.getAttribute("data-to");
      var name = (contactForm.querySelector("[name='name']") || {}).value || "";
      var email = (contactForm.querySelector("[name='email']") || {}).value || "";
      var message = (contactForm.querySelector("[name='message']") || {}).value || "";
      var status = contactForm.querySelector("[data-status]");

      var subject = "Website message from " + (name || "a visitor");
      var body = name + " <" + email + ">\n\n" + message;
      var href = "mailto:" + to + "?subject=" + encodeURIComponent(subject) + "&body=" + encodeURIComponent(body);

      if (status) {
        status.textContent = "opening your mail app… if nothing happens, mail " + to;
        status.setAttribute("data-state", "ok");
      }
      window.location.href = href;
    });
  }

  /* ---------- footer year ---------- */
  document.querySelectorAll("[data-year]").forEach(function (el) {
    el.textContent = String(new Date().getFullYear());
  });

  /* ---------- service worker ---------- */
  if ("serviceWorker" in navigator && location.protocol === "https:") {
    window.addEventListener("load", function () {
      navigator.serviceWorker.register("./sw.js").catch(function () {
        /* offline support is optional */
      });
    });
  }
})();
