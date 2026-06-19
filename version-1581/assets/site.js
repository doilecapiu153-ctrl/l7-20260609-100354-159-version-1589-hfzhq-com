(function () {
  function normalize(value) {
    return String(value || "").trim().toLowerCase();
  }

  function fillSelects(scope) {
    var cards = Array.prototype.slice.call(scope.querySelectorAll(".searchable-card"));
    var selects = Array.prototype.slice.call(document.querySelectorAll("[data-filter-select]"));
    selects.forEach(function (select) {
      var key = select.getAttribute("data-filter-select");
      var values = [];
      cards.forEach(function (card) {
        var value = card.getAttribute("data-" + key);
        if (value && values.indexOf(value) === -1) {
          values.push(value);
        }
      });
      values.sort(function (a, b) {
        if (/^\d+$/.test(a) && /^\d+$/.test(b)) {
          return Number(b) - Number(a);
        }
        return a.localeCompare(b, "zh-CN");
      });
      values.forEach(function (value) {
        var option = document.createElement("option");
        option.value = value;
        option.textContent = value;
        select.appendChild(option);
      });
    });
  }

  function applyFilter() {
    var scope = document.querySelector("[data-filter-scope]");
    if (!scope) {
      return;
    }
    var queryInput = document.querySelector("[data-filter-input]");
    var query = normalize(queryInput && queryInput.value);
    var selects = Array.prototype.slice.call(document.querySelectorAll("[data-filter-select]"));
    var cards = Array.prototype.slice.call(scope.querySelectorAll(".searchable-card"));
    var visible = 0;
    cards.forEach(function (card) {
      var text = normalize(card.getAttribute("data-text") || card.textContent);
      var matched = !query || text.indexOf(query) !== -1;
      selects.forEach(function (select) {
        var key = select.getAttribute("data-filter-select");
        var value = normalize(select.value);
        var cardValue = normalize(card.getAttribute("data-" + key));
        if (value && cardValue !== value) {
          matched = false;
        }
      });
      card.classList.toggle("is-hidden", !matched);
      if (matched) {
        visible += 1;
      }
    });
    var empty = document.querySelector("[data-empty-state]");
    if (empty) {
      empty.classList.toggle("is-visible", visible === 0);
    }
  }

  function initFilters() {
    var scope = document.querySelector("[data-filter-scope]");
    if (!scope) {
      return;
    }
    fillSelects(scope);
    var queryInput = document.querySelector("[data-filter-input]");
    var params = new URLSearchParams(window.location.search);
    var q = params.get("q");
    if (queryInput && q) {
      queryInput.value = q;
    }
    document.addEventListener("input", function (event) {
      if (event.target.matches("[data-filter-input]")) {
        applyFilter();
      }
    });
    document.addEventListener("change", function (event) {
      if (event.target.matches("[data-filter-select]")) {
        applyFilter();
      }
    });
    var clear = document.querySelector("[data-filter-clear]");
    if (clear) {
      clear.addEventListener("click", function () {
        if (queryInput) {
          queryInput.value = "";
        }
        document.querySelectorAll("[data-filter-select]").forEach(function (select) {
          select.value = "";
        });
        applyFilter();
      });
    }
    applyFilter();
  }

  function initGlobalSearch() {
    document.querySelectorAll("[data-global-search]").forEach(function (input) {
      input.addEventListener("keydown", function (event) {
        if (event.key === "Enter") {
          event.preventDefault();
          var value = input.value.trim();
          if (value) {
            window.location.href = "movies.html?q=" + encodeURIComponent(value);
          }
        }
      });
    });
  }

  function initMobileMenu() {
    var button = document.querySelector("[data-menu-toggle]");
    var nav = document.querySelector("[data-mobile-nav]");
    if (!button || !nav) {
      return;
    }
    button.addEventListener("click", function () {
      nav.classList.toggle("is-open");
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    initMobileMenu();
    initGlobalSearch();
    initFilters();
  });
})();
