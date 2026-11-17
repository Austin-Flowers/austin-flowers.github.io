// Renders the project list and sidebar groups from data/projects.json.
// To add or change a project, edit that file; nothing here needs to change.

(function () {
  "use strict";

  var STATUS_LABELS = {
    "live": "Live",
    "merged": "Merged upstream",
    "in-progress": "In progress",
    "archived": "Archived"
  };

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

  function renderProject(p) {
    var head = el("div", { className: "project__head" }, [
      el("h4", { className: "project__title", text: p.title }),
      p.status ? el("span", {
        className: "status status--" + p.status,
        text: p.statusLabel || STATUS_LABELS[p.status] || p.status
      }) : null
    ]);

    var children = [head, el("p", { className: "project__summary", text: p.summary })];

    if (p.tech && p.tech.length) {
      children.push(el("p", { className: "project__tech", text: "Stack: " + p.tech.join(", ") }));
    }

    if (p.details) {
      children.push(el("details", null, [
        el("summary", { text: "How it works" }),
        el("p", { text: p.details })
      ]));
    }

    if (p.links && p.links.length) {
      children.push(el("p", { className: "project__links" }, p.links.map(function (l) {
        return el("a", { href: l.url, text: l.label });
      })));
    }

    return el("article", { className: "project", id: "project-" + p.id }, children);
  }

  function render(data) {
    var projects = (data.projects || []).filter(function (p) { return !p.hidden; });
    var groupsEl = document.getElementById("project-groups");
    var navEl = document.getElementById("nav-groups");

    // Featured: any project with "featured": true, shown right after the intro.
    var featured = projects.filter(function (p) { return p.featured; });
    if (featured.length) {
      var list = document.getElementById("featured-list");
      featured.forEach(function (p) { list.appendChild(renderProject(p)); });
      document.getElementById("featured").hidden = false;
    }

    // Groups appear in the order listed in the data file; empty groups are skipped.
    (data.groups || []).forEach(function (g) {
      var items = projects.filter(function (p) { return p.group === g.id; });
      if (!items.length) return;

      var section = el("section", { className: "group", id: "group-" + g.id, "aria-labelledby": "group-" + g.id + "-title" }, [
        el("h3", { className: "group__title", id: "group-" + g.id + "-title", text: g.title }),
        g.blurb ? el("p", { className: "group__blurb", text: g.blurb }) : null
      ]);
      items.forEach(function (p) { section.appendChild(renderProject(p)); });
      groupsEl.appendChild(section);

      navEl.appendChild(el("li", null, [
        el("a", { href: "#group-" + g.id }, [
          el("span", { text: g.title }),
          el("span", { className: "count", text: String(items.length), "aria-label": items.length + " projects" })
        ])
      ]));
    });
  }

  function trackCurrentSection() {
    if (!("IntersectionObserver" in window)) return;
    var links = Array.prototype.slice.call(document.querySelectorAll(".nav > ul > li > a"));
    var byId = {};
    links.forEach(function (a) { byId[a.getAttribute("href").slice(1)] = a; });
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        links.forEach(function (a) { a.classList.remove("is-current"); a.removeAttribute("aria-current"); });
        var a = byId[e.target.id];
        if (a) { a.classList.add("is-current"); a.setAttribute("aria-current", "true"); }
      });
    }, { rootMargin: "-30% 0px -60% 0px" });
    Object.keys(byId).forEach(function (id) {
      var s = document.getElementById(id);
      if (s) observer.observe(s);
    });
  }

  fetch("data/projects.json", { cache: "no-cache" })
    .then(function (r) {
      if (!r.ok) throw new Error("HTTP " + r.status);
      return r.json();
    })
    .then(render)
    .catch(function () {
      document.getElementById("project-groups").appendChild(
        el("p", null, [
          document.createTextNode("The project list didn't load. Browse my work at "),
          el("a", { href: "https://github.com/Austin-Flowers", text: "github.com/Austin-Flowers" }),
          document.createTextNode(".")
        ])
      );
    })
    .then(trackCurrentSection);
})();
