// Renders project tiles from data/projects.json.
// - Overview page: tiles for projects marked "featured": true (up to 3)
// - Projects page: every project, with filter buttons by group
// To add or change a project, edit data/projects.json; nothing here needs to change.

(function () {
  "use strict";

  var STATUS_LABELS = {
    "live": "Live",
    "merged": "Merged upstream",
    "in-progress": "In progress",
    "archived": "Archived"
  };

  var featuredEl = document.getElementById("featured-tiles");
  var tilesEl = document.getElementById("project-tiles");
  var filtersEl = document.getElementById("filters");
  if (!featuredEl && !tilesEl) return;

  function el(tag, attrs, children) {
    var node = document.createElement(tag);
    if (attrs) {
      Object.keys(attrs).forEach(function (k) {
        if (k === "text") node.textContent = attrs[k];
        else if (k === "className") node.className = attrs[k];
        else node.setAttribute(k, attrs[k]);
      });
    }
    (children || []).forEach(function (c) { if (c) node.appendChild(c); });
    return node;
  }

  function statusBadge(p) {
    if (!p.status) return null;
    return el("span", {
      className: "status status--" + p.status,
      text: p.statusLabel || STATUS_LABELS[p.status] || p.status
    });
  }

  function techList(p) {
    if (!p.tech || !p.tech.length) return null;
    return el("ul", { className: "tile__tech", "aria-label": "Built with" },
      p.tech.map(function (t) { return el("li", { text: t }); }));
  }

  function linkList(p) {
    return (p.links || []).map(function (l) { return el("a", { href: l.url, text: l.label }); });
  }

  // One shared dialog for project details
  var dialog = null;
  function openDetails(p, groupTitle, opener) {
    if (!dialog) {
      dialog = el("dialog", { className: "detail", "aria-labelledby": "detail-title" });
      document.body.appendChild(dialog);
      dialog.addEventListener("click", function (e) { if (e.target === dialog) dialog.close(); });
      dialog.addEventListener("close", function () { if (dialog._opener) dialog._opener.focus(); });
    }
    dialog.innerHTML = "";
    var close = el("button", { className: "detail__close", type: "button", "aria-label": "Close", text: "×" });
    close.addEventListener("click", function () { dialog.close(); });

    var inner = el("div", { className: "detail__inner" }, [
      el("div", { className: "detail__head" }, [
        el("div", null, [
          el("h2", { id: "detail-title", text: p.title }),
          groupTitle ? el("p", { className: "tile__group", text: groupTitle }) : null
        ]),
        close
      ]),
      el("p", null, [statusBadge(p)]),
      el("p", { text: p.summary }),
      p.details ? el("p", { text: p.details }) : null,
      techList(p),
      p.links && p.links.length ? el("div", { className: "tile__foot" }, linkList(p)) : null
    ]);
    dialog.appendChild(inner);
    dialog._opener = opener;
    if (typeof dialog.showModal === "function") dialog.showModal();
    else dialog.setAttribute("open", "");
  }

  function renderTile(p, groupTitle) {
    var foot = linkList(p);
    if (p.details) {
      var more = el("button", { className: "tile__more", type: "button", text: "Details" });
      more.addEventListener("click", function () { openDetails(p, groupTitle, more); });
      foot.unshift(more);
    }

    var body = el("div", { className: "tile__body" }, [
      el("h3", { className: "tile__title", text: p.title }),
      el("p", { className: "tile__meta" }, [
        groupTitle ? el("span", { className: "tile__group", text: groupTitle }) : null,
        statusBadge(p)
      ]),
      el("p", { className: "tile__summary", text: p.summary }),
      techList(p),
      foot.length ? el("div", { className: "tile__foot" }, foot) : null
    ]);

    var image = p.image ? el("div", { className: "tile__image" }, [
      el("img", { src: p.image, alt: p.imageAlt || "", loading: "lazy" })
    ]) : null;

    return el("article", { className: "tile", id: "project-" + p.id, "data-group": p.group }, [image, body]);
  }

  function render(data) {
    var projects = (data.projects || []).filter(function (p) { return !p.hidden; });
    var groups = data.groups || [];
    var titleOf = {};
    groups.forEach(function (g) { titleOf[g.id] = g.title; });

    if (featuredEl) {
      var featured = projects.filter(function (p) { return p.featured; }).slice(0, 3);
      featured.forEach(function (p) { featuredEl.appendChild(renderTile(p, titleOf[p.group])); });
      if (!featured.length) featuredEl.parentNode.hidden = true;
    }

    if (tilesEl) {
      // Order tiles by group order, keeping file order within a group
      var order = {};
      groups.forEach(function (g, i) { order[g.id] = i; });
      var sorted = projects.slice().sort(function (a, b) {
        return (order[a.group] || 0) - (order[b.group] || 0);
      });
      var tiles = sorted.map(function (p) {
        var t = renderTile(p, titleOf[p.group]);
        tilesEl.appendChild(t);
        return t;
      });

      // Filter buttons: All, then each group that has projects
      var used = groups.filter(function (g) {
        return projects.some(function (p) { return p.group === g.id; });
      });
      var buttons = [];
      function apply(id) {
        tiles.forEach(function (t) { t.hidden = id !== "all" && t.getAttribute("data-group") !== id; });
        buttons.forEach(function (b) { b.setAttribute("aria-pressed", String(b.getAttribute("data-id") === id)); });
      }
      function addButton(id, label, count) {
        var b = el("button", { type: "button", "data-id": id, "aria-pressed": "false" }, [
          document.createTextNode(label),
          el("span", { className: "count", text: String(count) })
        ]);
        b.addEventListener("click", function () {
          apply(id);
          history.replaceState(null, "", id === "all" ? location.pathname : "#" + id);
        });
        buttons.push(b);
        filtersEl.appendChild(el("li", null, [b]));
      }
      addButton("all", "All", projects.length);
      used.forEach(function (g) {
        addButton(g.id, g.title, projects.filter(function (p) { return p.group === g.id; }).length);
      });

      var start = location.hash.slice(1);
      apply(used.some(function (g) { return g.id === start; }) ? start : "all");
    }
  }

  fetch("data/projects.json", { cache: "no-cache" })
    .then(function (r) {
      if (!r.ok) throw new Error("HTTP " + r.status);
      return r.json();
    })
    .then(render)
    .catch(function () {
      var target = tilesEl || featuredEl;
      target.appendChild(el("p", { className: "empty" }, [
        document.createTextNode("Projects didn't load. Browse my work at "),
        el("a", { href: "https://github.com/Austin-Flowers", text: "github.com/Austin-Flowers" }),
        document.createTextNode(".")
      ]));
    });
})();
