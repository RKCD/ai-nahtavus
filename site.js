/* AI-nähtavus: language toggle and the mailto order form. Nothing is stored. */
(function () {
  var root = document.documentElement;
  root.classList.add("js");
  var addr = "acceleratedigitaltwin@gmail.com";

  function visible() { return document.querySelector(".page[data-lang]:not([hidden])"); }

  /* ---------- Order form: builds a prefilled mailto, stores nothing ---------- */
  document.querySelectorAll("form.order").forEach(function (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!form.reportValidity()) return;
      var lines = [];
      form.querySelectorAll("[data-label]").forEach(function (f) {
        lines.push(f.getAttribute("data-label") + ": " + (f.value.trim() || "-"));
      });
      var body = (form.getAttribute("data-intro") || "") + "\n\n" + lines.join("\n") + "\n";
      location.href = "mailto:" + addr + "?subject=" + encodeURIComponent(form.getAttribute("data-subject")) + "&body=" + encodeURIComponent(body);
      var st = form.querySelector(".order-status");
      if (st) st.textContent = form.getAttribute("data-sent") || "";
    });
  });

  /* ---------- Language toggle ----------
     Without JavaScript both language blocks are visible, the default one first.
     A small inline script in <head> sets html.lang-xx before first paint; CSS hides the other block.
     The default language gets a clean URL, the other one ?lang=xx. */
  var DEF = root.getAttribute("data-default-lang") || "en";
  function setLang(target, initial) {
    document.querySelectorAll(".page[data-lang]").forEach(function (p) { p.hidden = p.getAttribute("data-lang") !== target; });
    root.classList.remove("lang-et", "lang-en");
    root.classList.add("lang-" + target);
    root.lang = target;
    try {
      var u = new URL(location.href);
      if (target === DEF) u.searchParams.delete("lang"); else u.searchParams.set("lang", target);
      history.replaceState(null, "", u.pathname + u.search + (initial ? u.hash : ""));
    } catch (e) {}
  }
  document.querySelectorAll(".lang-btn").forEach(function (btn) {
    btn.addEventListener("click", function () {
      setLang(btn.getAttribute("data-set"));
      window.scrollTo(0, 0);
      var b = visible().querySelector(".lang-btn"); if (b) b.focus();
    });
  });
  var q = location.search.match(/[?&]lang=(en|et)\b/), h = location.hash.match(/-(en|et)$/);
  var want = q ? q[1] : h ? h[1] : DEF;
  setLang(want, true);
  if (want !== DEF) {
    var anchor = location.hash && document.getElementById(location.hash.slice(1));
    if (anchor) anchor.scrollIntoView({ behavior: "instant" });
  }
})();
