/* Bimsara Serasinghe portfolio: vanilla JavaScript, no dependencies. */
(function () {
  "use strict";
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  document.documentElement.classList.add("js");

  /* ---------- Mobile navigation ---------- */
  var menuBtn = $("#menuBtn"), navLinks = $("#navLinks");
  menuBtn.addEventListener("click", function () {
    var open = navLinks.classList.toggle("open");
    menuBtn.setAttribute("aria-expanded", String(open));
  });
  $$("#navLinks a").forEach(function (a) {
    a.addEventListener("click", function () {
      navLinks.classList.remove("open");
      menuBtn.setAttribute("aria-expanded", "false");
    });
  });

  /* ---------- Active navigation highlighting ---------- */
  var sections = $$("main section[id]");
  var links = $$("#navLinks a");
  var spy = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (e.isIntersecting) {
        links.forEach(function (a) { a.classList.toggle("active", a.getAttribute("href") === "#" + e.target.id); });
      }
    });
  }, { rootMargin: "-45% 0px -50% 0px" });
  sections.forEach(function (s) { spy.observe(s); });

  /* ---------- Scroll reveal ---------- */
  var reveal = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (e.isIntersecting) { e.target.classList.add("in"); reveal.unobserve(e.target); }
    });
  }, { threshold: 0.12 });
  $$(".reveal").forEach(function (el) { reveal.observe(el); });

  /* ---------- Image fallbacks (profile and project screenshots) ---------- */
  function showFallback(img) {
    var box = document.createElement("div");
    box.className = "fallback";
    box.textContent = img.getAttribute("data-fallback") || "";
    box.setAttribute("role", "img");
    box.setAttribute("aria-label", img.alt);
    img.replaceWith(box);
  }
  $$("img[data-fallback]").forEach(function (img) {
    if (img.complete && img.naturalWidth === 0) { showFallback(img); return; }
    img.addEventListener("error", function () { showFallback(img); }, { once: true });
  });

  /* ---------- Download CV (reports a missing file instead of failing silently) ---------- */
  var cvBtn = $("#cvBtn"), cvNote = $("#cvNote");
  if (window.location.protocol !== "file:" && window.fetch) {
    fetch(cvBtn.getAttribute("href"), { method: "HEAD" }).then(function (r) {
      if (!r.ok) cvNote.hidden = false;
    }).catch(function () {});
  }

  /* ---------- Project details dialog ---------- */
  var dlg = $("#dlg"), dlgBody = $("#dlgBody");
  $$(".project [data-open]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var card = btn.closest(".project");
      var shot = $(".shot", card).cloneNode(true);
      var html = '<span class="cat">' + $(".cat", card).textContent + "</span>" +
        '<h3 id="dlgTitle">' + $("h3", card).textContent + "</h3>" +
        "<p>" + $("p", card).textContent + "</p>";
      dlgBody.innerHTML = html;
      dlgBody.appendChild(shot);
      dlgBody.insertAdjacentHTML("beforeend", $(".detail", card).innerHTML);
      var tags = $(".tags", card).cloneNode(true);
      var h = document.createElement("h4"); h.textContent = "Technologies";
      dlgBody.appendChild(h); dlgBody.appendChild(tags);
      if (typeof dlg.showModal === "function") dlg.showModal(); else dlg.setAttribute("open", "");
    });
  });
  $("#dlgClose").addEventListener("click", function () { dlg.close(); });
  dlg.addEventListener("click", function (e) { if (e.target === dlg) dlg.close(); });

  /* ---------- Back-to-top button ---------- */
  var toTop = $("#toTop");
  window.addEventListener("scroll", function () { toTop.hidden = window.scrollY < 600; }, { passive: true });
  toTop.addEventListener("click", function () { window.scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" }); });

  /* ---------- Contact form validation ---------- */
  var form = $("#contactForm");
  var EMAIL = "bimsaraserasinghe0954@gmail.com";
  function setError(id, msg) {
    var field = $("#" + id);
    $('.err[data-for="' + id + '"]').textContent = msg;
    field.classList.toggle("invalid", !!msg);
    field.setAttribute("aria-invalid", msg ? "true" : "false");
    return !msg;
  }
  form.addEventListener("submit", function (e) {
    e.preventDefault();
    var name = $("#name").value.trim(), email = $("#email").value.trim(), msg = $("#message").value.trim();
    var ok = true;
    ok = setError("name", name ? "" : "Enter your name.") && ok;
    ok = setError("email", /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? "" : "Enter a valid email address.") && ok;
    ok = setError("message", msg.length >= 10 ? "" : "Write a message of at least 10 characters.") && ok;
    if (!ok) return;
    /* No backend: open the visitor's own email app with a pre-filled message. */
    window.location.href = "mailto:" + EMAIL +
      "?subject=" + encodeURIComponent("Portfolio enquiry from " + name) +
      "&body=" + encodeURIComponent(msg + "\n\nFrom: " + name + " (" + email + ")");
  });

  /* ---------- Hero background: subtle animated network ---------- */
  var canvas = $("#net");
  var ctx = canvas.getContext("2d");
  var pts = [], w = 0, h2 = 0, raf = 0;
  function size() {
    var r = canvas.getBoundingClientRect(), d = Math.min(window.devicePixelRatio || 1, 2);
    w = r.width; h2 = r.height;
    canvas.width = w * d; canvas.height = h2 * d;
    ctx.setTransform(d, 0, 0, d, 0, 0);
    var n = Math.round(Math.min(60, w / 22));
    pts = [];
    for (var i = 0; i < n; i++) pts.push({ x: Math.random() * w, y: Math.random() * h2, vx: (Math.random() - 0.5) * 0.25, vy: (Math.random() - 0.5) * 0.25 });
  }
  function draw() {
    ctx.clearRect(0, 0, w, h2);
    for (var i = 0; i < pts.length; i++) {
      var p = pts[i];
      if (!reduceMotion) {
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0 || p.x > w) p.vx *= -1;
        if (p.y < 0 || p.y > h2) p.vy *= -1;
      }
      for (var j = i + 1; j < pts.length; j++) {
        var q = pts[j], dx = p.x - q.x, dy = p.y - q.y, d2 = dx * dx + dy * dy;
        if (d2 < 14000) {
          ctx.strokeStyle = "rgba(139,123,255," + (0.28 * (1 - d2 / 14000)) + ")";
          ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(q.x, q.y); ctx.stroke();
        }
      }
      ctx.fillStyle = i % 3 ? "rgba(56,214,255,0.8)" : "rgba(139,123,255,0.8)";
      ctx.beginPath(); ctx.arc(p.x, p.y, 2, 0, 6.2832); ctx.fill();
    }
    if (!reduceMotion) raf = requestAnimationFrame(draw);
  }
  size(); draw();
  window.addEventListener("resize", function () { cancelAnimationFrame(raf); size(); draw(); });
  document.addEventListener("visibilitychange", function () {
    if (document.hidden) cancelAnimationFrame(raf); else if (!reduceMotion) draw();
  });
})();
